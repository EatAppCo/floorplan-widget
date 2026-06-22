import { fabric } from 'fabric';
import {
  Table,
  Room,
  FloorplanRendererOptions,
  OnTableClickCallback,
  OnRoomChangeCallback,
  OnErrorCallback,
} from './types';
import {
  FLOOR_DEFAULT,
  floorEmojiList,
  DEFAULT_TABLE_PALETTE,
  palette,
} from './config';
import {
  getDimensionsV2,
  isEmoji,
  sortTablesByRenderOrder,
} from './helpers/tables';
import TableGroup from './objects/TableGroup';
import LabelGroup from './objects/LabelGroup';
import './FloorplanRenderer.css';
import {
  CENTER_ORIGIN,
  DEFAULT_TABLE_GROUP_OPTIONS,
  DISABLED_OBJECT_PROPERTIES,
  DRAG_THRESHOLD,
  LABEL_SIZE_CONFIG,
  MINIMAP_SIZE,
  ZOOM_STEPS,
} from './config/defaults';

export class FloorplanRenderer {
  private canvas: fabric.Canvas | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private containerElement: HTMLElement | null = null;
  private canvasContainerElement: HTMLElement | null = null;
  private backgroundElement: HTMLElement | null = null;
  private tabsContainerElement: HTMLElement | null = null;
  private rooms: Room[] = [];
  private blockedTableIds: string[] = [];
  private preferredTableIds: string[] = [];
  private paidTableIds: string[] = [];
  private selectedTableIds: string[] = [];
  private selectionMode: 'single' | 'multi' = 'multi';
  private maxSelectable: number | null = null;
  private showBackgroundImage: boolean = true;
  private showEmojis: boolean = true;
  private selectedRoom: Room | null = null;
  private onTableClick: OnTableClickCallback | null = null;
  private onRoomChange: OnRoomChangeCallback | null = null;
  private onError: OnErrorCallback | null = null;
  private canvasSize: number = 0;
  private zoomControlsElement: HTMLElement | null = null;
  private zoomInButton: HTMLButtonElement | null = null;
  private zoomOutButton: HTMLButtonElement | null = null;
  private minimapElement: HTMLElement | null = null;
  private minimapImageElement: HTMLImageElement | null = null;
  private minimapViewportElement: HTMLElement | null = null;
  private minimapAvailable: boolean = true;
  private zoomStepIndex: number = 0;
  private isPanning: boolean = false;
  private lastPointer: { x: number; y: number } | null = null;
  private dragDistance: number = 0;
  private pendingPanDelta: { x: number; y: number } | null = null;
  private panRafId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private resizeRafId: number | null = null;

  constructor(options: FloorplanRendererOptions) {
    // Set callbacks
    this.onError = options.onError || null;
    this.onTableClick = options.onTableClick || null;
    this.onRoomChange = options.onRoomChange || null;

    // Validate container element
    if (!options.containerElement) {
      const error = new Error('Container element is required.');
      this.emitError(error);
      return;
    }

    // Set options
    this.containerElement = options.containerElement;
    this.rooms = options.rooms || [];
    this.blockedTableIds = options.blockedTableIds || [];
    this.preferredTableIds = options.preferredTableIds || [];
    this.paidTableIds = options.paidTableIds || [];
    this.selectionMode = options.selectionMode || 'multi';
    this.maxSelectable = options.maxSelectable ?? null;
    this.showBackgroundImage = options.showBackgroundImage ?? true;
    this.showEmojis = options.showEmojis ?? true;
    this.selectedTableIds = (options.initialSelectedTableIds || []).filter(
      (id) => !this.blockedTableIds.includes(id)
    );
    // A restored selection (back-nav) must respect a tightened cap, not just blocked tables
    if (this.maxSelectable !== null) {
      this.selectedTableIds = this.selectedTableIds.slice(
        0,
        this.maxSelectable
      );
    }

    if (this.rooms.length === 0) {
      this.emitError(new Error('No rooms available.'));
      return;
    }

    // Open the requested room, else the first
    this.selectedRoom =
      this.rooms.find((room) => room.id === options.initialRoomId) ||
      this.rooms[0];

    this.initialize();
  }

  /**
   * Emit an error to the parent application
   */
  private emitError(error: Error): void {
    if (this.onError) {
      this.onError(error);
    }
  }

  /**
   * Whether the multi-select cap has been reached
   */
  private atSelectionLimit(): boolean {
    return (
      this.maxSelectable !== null &&
      this.selectedTableIds.length >= this.maxSelectable
    );
  }

  /**
   * Initialize the canvas and render the floorplan
   */
  private initialize(): void {
    try {
      if (!this.containerElement) {
        this.emitError(new Error('Container element is not initialized.'));
        return;
      }

      // Clear container element before adding canvas
      this.containerElement.innerHTML = '';
      this.containerElement.classList.add('floorplan-container');

      this.renderTabs();

      // Create canvas container
      this.canvasContainerElement = document.createElement('div');
      this.canvasContainerElement.className = 'floorplan-canvas-container';
      this.containerElement.appendChild(this.canvasContainerElement);

      // Create canvas element inside canvas container
      this.canvasElement = document.createElement('canvas');
      this.canvasContainerElement.appendChild(this.canvasElement);

      this.updateCanvasSize();

      // Initialize Fabric canvas
      this.canvas = new fabric.Canvas(this.canvasElement, {
        backgroundColor: 'transparent',
        preserveObjectStacking: true,
        selection: false,
        width: this.canvasSize,
        height: this.canvasSize,
        renderOnAddRemove: false,
        stateful: false,
        allowTouchScrolling: true,
      });

      this.setupEventHandlers();
      this.render();
      this.renderZoomControls();
      this.renderMinimap();
      this.captureMinimap();
      this.syncMinimap();
      this.observeResize();
    } catch (error) {
      this.emitError(
        error instanceof Error
          ? error
          : new Error('Failed to initialize floorplan.')
      );
    }
  }

  /**
   * Size the (square) canvas to the smaller of the container's two dimensions so it always fits
   * its host. Falls back to the minimum only when the container is unmeasured (0×0 before layout) —
   * a forced minimum would overflow a narrow host (e.g. the admin preview panel) and clip the plan.
   */
  private updateCanvasSize(): void {
    if (!this.canvasContainerElement) return;

    const containerRect = this.canvasContainerElement.getBoundingClientRect();
    const size = Math.min(containerRect.width, containerRect.height);

    this.canvasSize = size > 0 ? size : FLOOR_DEFAULT.CANVAS_MIN_SIZE;
  }

  /**
   * Keep the canvas fitted to its container as the host resizes it — e.g. when a summary panel
   * below the plan expands and shrinks the plan's region, or the viewport rotates. Without this
   * the square canvas keeps its initial pixel size and overflows the shrunken container, painting
   * over sibling host content. Callbacks are coalesced into one animation frame so an animated
   * resize doesn't thrash.
   */
  private observeResize(): void {
    if (typeof ResizeObserver === 'undefined' || !this.canvasContainerElement) {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => {
      if (this.resizeRafId !== null) return;

      this.resizeRafId = requestAnimationFrame(() => {
        this.resizeRafId = null;
        this.handleResize();
      });
    });
    this.resizeObserver.observe(this.canvasContainerElement);
  }

  /**
   * Re-fit the canvas to the current container size. Object geometry is derived from canvasSize,
   * so a changed size means resizing the Fabric canvas and re-laying the plan, then refitting the
   * view and re-snapshotting the minimap (mirrors the room-change path). A no-op when the fitted
   * size is unchanged, so the ResizeObserver can't loop.
   */
  private handleResize(): void {
    if (!this.canvas || !this.canvasContainerElement) return;

    const previousSize = this.canvasSize;
    this.updateCanvasSize();

    if (this.canvasSize === previousSize || this.canvasSize <= 0) return;

    this.canvas.setDimensions({
      width: this.canvasSize,
      height: this.canvasSize,
    });

    this.resetView();
    this.render();
    this.captureMinimap();
  }

  /**
   * Set up canvas event handlers. Pointer down/move/up drive drag-pan (when zoomed)
   * and, on a non-drag release, table selection.
   */
  private setupEventHandlers(): void {
    if (!this.canvas) return;

    this.canvas.on('mouse:down', (opt: fabric.IEvent<MouseEvent>) =>
      this.onPointerDown(opt)
    );
    this.canvas.on('mouse:move', (opt: fabric.IEvent<MouseEvent>) =>
      this.onPointerMove(opt)
    );
    this.canvas.on('mouse:up', (opt: fabric.IEvent<MouseEvent>) =>
      this.onPointerUp(opt)
    );
  }

  /**
   * Screen-space coordinates of a mouse or touch pointer event
   */
  private pointerXY(e: MouseEvent | TouchEvent): { x: number; y: number } {
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return touch ? { x: touch.clientX, y: touch.clientY } : { x: 0, y: 0 };
    }
    return { x: e.clientX, y: e.clientY };
  }

  private onPointerDown(opt: fabric.IEvent<MouseEvent>): void {
    this.lastPointer = this.pointerXY(opt.e as MouseEvent | TouchEvent);
    this.dragDistance = 0;
    // Only a zoomed-in view pans; at fit-zoom the page keeps its native scroll
    this.isPanning = this.currentZoom() > 1;
  }

  private onPointerMove(opt: fabric.IEvent<MouseEvent>): void {
    if (!this.lastPointer) return;

    const xy = this.pointerXY(opt.e as MouseEvent | TouchEvent);
    const dx = xy.x - this.lastPointer.x;
    const dy = xy.y - this.lastPointer.y;
    this.dragDistance += Math.abs(dx) + Math.abs(dy);
    this.lastPointer = xy;

    if (this.isPanning) {
      opt.e.preventDefault();
      this.schedulePan(dx, dy);
    }
  }

  private onPointerUp(opt: fabric.IEvent<MouseEvent>): void {
    const wasDrag = this.dragDistance > DRAG_THRESHOLD;
    this.lastPointer = null;
    this.isPanning = false;
    this.dragDistance = 0;

    // A drag pans the canvas; only a clean press selects a table
    if (!wasDrag) {
      this.handleTableSelect(opt);
    }
  }

  /**
   * Toggle the pressed table's selection and notify the host
   */
  private handleTableSelect(opt: fabric.IEvent<MouseEvent>): void {
    try {
      const target = opt.target;
      if (!(target instanceof TableGroup)) return;

      const table = target.tableContext;
      if (!table || table.type !== 'Table') return;

      if (this.selectionMode === 'single') {
        this.selectedTableIds = this.selectedTableIds.includes(table.id)
          ? []
          : [table.id];
      } else {
        const tableIndex = this.selectedTableIds.indexOf(table.id);
        if (tableIndex !== -1) {
          this.selectedTableIds.splice(tableIndex, 1);
        } else if (this.atSelectionLimit()) {
          return; // at the cap — ignore selecting another table
        } else {
          this.selectedTableIds.push(table.id);
        }
      }

      // Re-render to update selection styling
      this.render();

      if (this.onTableClick) {
        this.onTableClick(table, [...this.selectedTableIds]);
      }
    } catch (error) {
      this.emitError(
        error instanceof Error
          ? error
          : new Error('Error handling table click.')
      );
    }
  }

  /**
   * Current canvas zoom (1 = fit)
   */
  private currentZoom(): number {
    return this.canvas ? this.canvas.getZoom() : 1;
  }

  /**
   * Apply a pan delta on the next frame, coalescing pointer events to one
   * viewport write per frame (Fabric pan is main-thread heavy on large rooms)
   */
  private schedulePan(dx: number, dy: number): void {
    this.pendingPanDelta = {
      x: (this.pendingPanDelta?.x || 0) + dx,
      y: (this.pendingPanDelta?.y || 0) + dy,
    };

    if (this.panRafId !== null) return;

    this.panRafId = requestAnimationFrame(() => {
      this.panRafId = null;
      const delta = this.pendingPanDelta;
      this.pendingPanDelta = null;
      if (!delta || !this.canvas) return;

      this.canvas.relativePan(new fabric.Point(delta.x, delta.y));
      this.clampPan();
      this.canvas.requestRenderAll();
      this.syncBackgroundTransform();
      this.syncMinimap();
    });
  }

  /**
   * Keep the panned viewport within the room bounds (no empty gutters)
   */
  private clampPan(): void {
    if (!this.canvas) return;

    const vpt = this.canvas.viewportTransform;
    if (!vpt) return;

    const min = this.canvasSize * (1 - this.canvas.getZoom());
    vpt[4] = Math.min(0, Math.max(min, vpt[4]));
    vpt[5] = Math.min(0, Math.max(min, vpt[5]));
    this.canvas.setViewportTransform(vpt);
  }

  /**
   * Mirror the canvas viewport onto the sibling background div. The image stays
   * a DOM div (not a canvas background) so the L3 minimap's toDataURL can't be
   * CORS-tainted by the CDN image.
   */
  private syncBackgroundTransform(): void {
    if (!this.backgroundElement || !this.canvas) return;

    const vpt = this.canvas.viewportTransform;
    if (!vpt) return;

    this.backgroundElement.style.transform = `translate(${vpt[4]}px, ${vpt[5]}px) scale(${vpt[0]})`;
  }

  /**
   * Render the zoom in/out buttons over the canvas
   */
  private renderZoomControls(): void {
    if (!this.canvasContainerElement) return;

    this.zoomControlsElement = document.createElement('div');
    this.zoomControlsElement.className = 'floorplan-zoom-controls';

    this.zoomInButton = this.createZoomButton('+', 'Zoom in', () =>
      this.stepZoom(1)
    );
    this.zoomOutButton = this.createZoomButton('−', 'Zoom out', () =>
      this.stepZoom(-1)
    );

    this.zoomControlsElement.appendChild(this.zoomOutButton);
    this.zoomControlsElement.appendChild(this.zoomInButton);
    this.canvasContainerElement.appendChild(this.zoomControlsElement);

    this.updateZoomButtons();
  }

  private createZoomButton(
    label: string,
    ariaLabel: string,
    onClick: () => void
  ): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'floorplan-zoom-button';
    button.textContent = label;
    button.setAttribute('aria-label', ariaLabel);
    button.addEventListener('click', onClick);
    return button;
  }

  /**
   * Step the zoom one level, then recenter (at fit) or clamp the viewport
   */
  private stepZoom(direction: number): void {
    if (!this.canvas) return;

    const nextIndex = Math.min(
      ZOOM_STEPS.length - 1,
      Math.max(0, this.zoomStepIndex + direction)
    );
    if (nextIndex === this.zoomStepIndex) return;

    this.zoomStepIndex = nextIndex;
    const zoom = ZOOM_STEPS[nextIndex];
    const center = new fabric.Point(this.canvasSize / 2, this.canvasSize / 2);
    this.canvas.zoomToPoint(center, zoom);

    if (zoom === 1) {
      this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    } else {
      this.clampPan();
    }

    // zoomToPoint/setViewportTransform don't repaint when renderOnAddRemove is
    // false (fabric.js:9578), so the canvas stays still without an explicit render
    this.canvas.requestRenderAll();
    this.syncBackgroundTransform();
    this.updateZoomButtons();
    this.syncMinimap();
  }

  /**
   * Reset to fit-zoom and recenter (used on room change)
   */
  private resetView(): void {
    this.zoomStepIndex = 0;
    if (this.canvas) {
      this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      this.canvas.requestRenderAll();
    }
    this.syncBackgroundTransform();
    this.updateZoomButtons();
    this.syncMinimap();
  }

  /**
   * Disable each zoom button at its limit
   */
  private updateZoomButtons(): void {
    if (this.zoomInButton) {
      this.zoomInButton.disabled = this.zoomStepIndex >= ZOOM_STEPS.length - 1;
    }
    if (this.zoomOutButton) {
      this.zoomOutButton.disabled = this.zoomStepIndex <= 0;
    }
  }

  /**
   * Build the minimap overlay (thumbnail + viewport rectangle), hidden until zoomed
   */
  private renderMinimap(): void {
    if (!this.canvasContainerElement) return;

    this.minimapElement = document.createElement('div');
    this.minimapElement.className = 'floorplan-minimap';
    this.minimapElement.style.width = `${MINIMAP_SIZE}px`;
    this.minimapElement.style.height = `${MINIMAP_SIZE}px`;
    this.minimapElement.style.display = 'none';

    this.minimapImageElement = document.createElement('img');
    this.minimapImageElement.className = 'floorplan-minimap-image';
    this.minimapImageElement.alt = '';

    this.minimapViewportElement = document.createElement('div');
    this.minimapViewportElement.className = 'floorplan-minimap-viewport';

    this.minimapElement.appendChild(this.minimapImageElement);
    this.minimapElement.appendChild(this.minimapViewportElement);
    this.canvasContainerElement.appendChild(this.minimapElement);
  }

  /**
   * Snapshot the (vector-only) room into the minimap. MUST be called only at
   * identity zoom — Fabric's toDataURL honors the viewportTransform, so a zoomed
   * capture would store a cropped view. The background image is a DOM sibling, not
   * on the canvas, so the export can't be CORS-tainted; guard regardless.
   */
  private captureMinimap(): void {
    if (!this.canvas || !this.minimapImageElement) return;

    try {
      this.minimapImageElement.src = this.canvas.toDataURL({
        format: 'png',
        multiplier: MINIMAP_SIZE / this.canvasSize,
      });
      this.minimapAvailable = true;
    } catch (error) {
      // Minimap is optional chrome — degrade quietly, don't surface via onError
      this.minimapAvailable = false;
      if (this.minimapElement) {
        this.minimapElement.style.display = 'none';
      }
      console.warn('[FloorplanRenderer] Minimap snapshot failed', error);
    }
  }

  /**
   * Show the minimap only while zoomed and move its viewport rectangle to match
   * the current pan/zoom (reads the vpt; never re-snapshots)
   */
  private syncMinimap(): void {
    if (!this.minimapElement || !this.canvas) return;

    const zoom = this.canvas.getZoom();
    const visible = this.minimapAvailable && zoom > 1;
    this.minimapElement.style.display = visible ? 'block' : 'none';
    if (!visible || !this.minimapViewportElement) return;

    const vpt = this.canvas.viewportTransform;
    if (!vpt) return;

    const scale = MINIMAP_SIZE / this.canvasSize;
    const size = MINIMAP_SIZE / zoom;
    this.minimapViewportElement.style.width = `${size}px`;
    this.minimapViewportElement.style.height = `${size}px`;
    this.minimapViewportElement.style.left = `${(-vpt[4] / zoom) * scale}px`;
    this.minimapViewportElement.style.top = `${(-vpt[5] / zoom) * scale}px`;
  }

  /**
   * Render room tabs
   */
  private renderTabs(): void {
    // Create tabs container if it doesn't exist
    if (!this.tabsContainerElement && this.containerElement) {
      this.tabsContainerElement = document.createElement('div');
      this.tabsContainerElement.className = 'floorplan-tabs-container';
      this.containerElement.appendChild(this.tabsContainerElement);
    }

    if (!this.tabsContainerElement) return;

    // Clear existing tabs
    this.tabsContainerElement.innerHTML = '';

    // Create tab button for each room
    this.rooms.forEach((room) => {
      const tabItem = document.createElement('div');
      tabItem.textContent = room.name;
      tabItem.className = 'floorplan-tab';
      tabItem.setAttribute('data-room-id', room.id);

      const isActive = this.selectedRoom && this.selectedRoom.id === room.id;

      if (isActive) {
        tabItem.classList.add('floorplan-tab--active');
      }

      // Add click handler
      tabItem.addEventListener('click', () => {
        this.selectRoom(room.id);
      });

      if (this.tabsContainerElement) {
        this.tabsContainerElement.appendChild(tabItem);
      }
    });
  }

  /**
   * Create a label for the table number
   */
  private createTableNumberLabel(
    table: Table,
    isSelected: boolean
  ): LabelGroup {
    const config = LABEL_SIZE_CONFIG.very_small;
    const tableNumber = table.number;

    const textElement = new fabric.Text(tableNumber, {
      ...DISABLED_OBJECT_PROPERTIES,
      ...CENTER_ORIGIN,
      fontFamily: 'Inter, sans-serif',
      fill: table.type === 'Shape' ? 'black' : '#979797',
      fontSize: config.TEXT_FONT_SIZE - (table.type === 'Shape' ? 1 : 0),
      lineHeight: 1,
      textAlign: 'center',
    });

    const circleSize = config.LINE_HEIGHT;

    const labelRect = new fabric.Rect({
      ...DISABLED_OBJECT_PROPERTIES,
      ...CENTER_ORIGIN,
      height: circleSize,
      width: circleSize,
      rx: circleSize / 2,
      ry: circleSize / 2,
      fill: table.type === 'Shape' ? 'rgba(0,0,0,0.05)' : palette.white,
      stroke: isSelected
        ? DEFAULT_TABLE_PALETTE.selectedStroke
        : DEFAULT_TABLE_PALETTE.stroke,
      strokeWidth: FLOOR_DEFAULT.STROKE_WIDTH,
    });

    return new LabelGroup([labelRect, textElement], {
      ...DISABLED_OBJECT_PROPERTIES,
      ...CENTER_ORIGIN,
      _relatedTableId: table.id,
      _positionOnTable: 'bottom',
    });
  }

  /**
   * Create a `$` badge for a table that incurs an up-front payment
   */
  private createPaymentLabel(table: Table): LabelGroup {
    const config = LABEL_SIZE_CONFIG.very_small;

    const textElement = new fabric.Text('$', {
      ...DISABLED_OBJECT_PROPERTIES,
      ...CENTER_ORIGIN,
      fontFamily: 'Inter, sans-serif',
      fill: palette.green100,
      fontSize: config.TEXT_FONT_SIZE,
      lineHeight: 1,
      textAlign: 'center',
    });

    const circleSize = config.LINE_HEIGHT;

    // White circle, green ring + green `$` (per Figma), straddling the table corner
    const labelRect = new fabric.Rect({
      ...DISABLED_OBJECT_PROPERTIES,
      ...CENTER_ORIGIN,
      height: circleSize,
      width: circleSize,
      rx: circleSize / 2,
      ry: circleSize / 2,
      fill: palette.white,
      stroke: palette.green100,
      strokeWidth: FLOOR_DEFAULT.STROKE_WIDTH,
    });

    return new LabelGroup([labelRect, textElement], {
      ...DISABLED_OBJECT_PROPERTIES,
      ...CENTER_ORIGIN,
      _relatedTableId: table.id,
      _positionOnTable: 'corner',
    });
  }

  /**
   * Create a centered name label for a non-emoji shape (e.g. "Burj Khalifa View")
   */
  private createShapeLabel(table: Table): fabric.Object {
    return new fabric.Text(table.number, {
      ...DISABLED_OBJECT_PROPERTIES,
      ...CENTER_ORIGIN,
      fontFamily: 'Inter, sans-serif',
      fill: palette.dark100,
      fontSize: LABEL_SIZE_CONFIG.very_small.TEXT_FONT_SIZE,
      lineHeight: 1,
      textAlign: 'center',
    });
  }

  /**
   * Create a table object for rendering on canvas
   */
  private createTableObject(table: Table): {
    tableGroup: TableGroup;
    labelGroup: LabelGroup | null;
  } {
    try {
      const { top, left, width, height } = getDimensionsV2(
        table,
        this.canvasSize
      );
      const { rotation, type, color, shape } = table;

      const isRectangleShape = shape === 'rectangle' || shape === 'square';
      const isShape = type === 'Shape';
      const isTable = type === 'Table';
      const isEmojiType = isEmoji(table, floorEmojiList);
      const isBlocked = this.blockedTableIds.includes(table.id);
      const isSelected = this.selectedTableIds.includes(table.id);
      const isPreferred = this.preferredTableIds.includes(table.id);
      const isPaid = this.paidTableIds.includes(table.id);

      // Table object options
      const tableObjectOptions = {
        ...CENTER_ORIGIN,
        strokeWidth: FLOOR_DEFAULT.STROKE_WIDTH,
        rx: isEmojiType
          ? 0
          : isRectangleShape
            ? FLOOR_DEFAULT.TABLE_RADIUS
            : Math.abs(width) / 2,
        ry: isEmojiType
          ? 0
          : isRectangleShape
            ? FLOOR_DEFAULT.TABLE_RADIUS
            : Math.abs(height) / 2,
        strokeUniform: true,
        stroke: isShape
          ? 'transparent'
          : isBlocked
            ? 'transparent'
            : isSelected
              ? DEFAULT_TABLE_PALETTE.selectedStroke
              : DEFAULT_TABLE_PALETTE.stroke,
        fill: isEmojiType
          ? 'transparent'
          : isBlocked
            ? DEFAULT_TABLE_PALETTE.blocked
            : isSelected
              ? DEFAULT_TABLE_PALETTE.selectedFill
              : isShape
                ? color || 'transparent'
                : DEFAULT_TABLE_PALETTE.fill,
        perPixelTargetFind: true,
      };

      let tableObject: fabric.Object;

      if (isEmojiType) {
        tableObject = new fabric.IText(table.number, {
          ...CENTER_ORIGIN,
          fontSize: width,
          lineHeight: 1,
          textAlign: 'center',
        });
      } else if (isRectangleShape) {
        tableObject = new fabric.Rect({
          width,
          height,
          ...tableObjectOptions,
        });
      } else {
        tableObject = new fabric.Ellipse({
          ...tableObjectOptions,
        });
      }

      // Non-emoji shapes carry a centered name label that rotates with the group
      const groupObjects: fabric.Object[] = [tableObject];
      if (isShape && !isEmojiType && table.number) {
        groupObjects.push(this.createShapeLabel(table));
      }

      const tableGroup = new TableGroup(groupObjects, {
        ...DEFAULT_TABLE_GROUP_OPTIONS,
        tableContext: table,
        top,
        left,
        angle: rotation || 0,
        perPixelTargetFind: true,
        evented: isTable && !isBlocked,
        hoverCursor: isTable && !isBlocked ? 'pointer' : 'default',
      });

      // The bottom slot holds one badge: `$` takes precedence, else the preferred number
      let labelGroup: LabelGroup | null = null;
      if (!isEmojiType && !isBlocked && isTable) {
        if (isPaid) {
          labelGroup = this.createPaymentLabel(table);
        } else if (isPreferred) {
          labelGroup = this.createTableNumberLabel(table, isSelected);
        }
      }

      return { tableGroup, labelGroup };
    } catch (error) {
      this.emitError(
        error instanceof Error
          ? error
          : new Error(`Failed to create table: ${table.id}.`)
      );
      return {
        tableGroup: new TableGroup([], { tableContext: table }),
        labelGroup: null,
      };
    }
  }

  /**
   * Position the label relative to its table group
   */
  private positionLabel(tableGroup: TableGroup, labelGroup: LabelGroup): void {
    const boundingRect = tableGroup.getBoundingRect();
    const isShape = tableGroup.tableContext.type === 'Shape';

    // The `$` badge straddles the table's bottom-right corner (per Figma)
    if (labelGroup._positionOnTable === 'corner') {
      labelGroup.set({
        top: boundingRect.top + boundingRect.height,
        left: boundingRect.left + boundingRect.width,
      });
      return;
    }

    const adjustedHeight = isShape
      ? boundingRect.height / 2
      : boundingRect.height - FLOOR_DEFAULT.STROKE_WIDTH / 2;

    labelGroup.set({
      top: boundingRect.top + adjustedHeight,
      left: boundingRect.left + boundingRect.width / 2,
    });
  }

  /**
   * Setup and update the background image
   * Creates the background element if it doesn't exist, then updates the image
   */
  private updateBackgroundImage(): void {
    if (!this.canvasContainerElement) return;

    // Create background element if it doesn't exist yet
    if (!this.backgroundElement) {
      // Find the canvas-container div element created by Fabric.js
      const fabricCanvasContainer = this.canvasContainerElement.querySelector(
        '.canvas-container'
      ) as HTMLElement;

      if (!fabricCanvasContainer) {
        console.warn(
          '[FloorplanRenderer] Could not find Fabric.js canvas-container'
        );
        return;
      }

      // Create background element
      this.backgroundElement = document.createElement('div');
      this.backgroundElement.className = 'floorplan-background';

      fabricCanvasContainer.insertBefore(
        this.backgroundElement,
        fabricCanvasContainer.firstChild
      );
    }

    if (
      this.showBackgroundImage &&
      this.selectedRoom &&
      this.selectedRoom.background_image_url
    ) {
      this.backgroundElement.style.backgroundImage = `url(${this.selectedRoom.background_image_url})`;
    } else {
      // Clear background image when hidden or not set
      this.backgroundElement.style.backgroundImage = '';
    }

    // Keep the background locked to the current zoom/pan
    this.syncBackgroundTransform();
  }

  /**
   * Render all tables on the canvas
   */
  private render(): void {
    try {
      if (!this.canvas) return;

      // Preserve zoom/pan across the clear + re-add (e.g. selecting while zoomed)
      const vpt = this.canvas.viewportTransform
        ? [...this.canvas.viewportTransform]
        : null;

      this.canvas.clear();

      if (vpt) {
        this.canvas.setViewportTransform(vpt);
      }

      this.updateBackgroundImage();

      // Get tables from selected room, optionally hiding emoji decor
      const tablesToRender = (
        (this.selectedRoom && this.selectedRoom.tables) ||
        []
      ).filter((table) => this.showEmojis || !isEmoji(table, floorEmojiList));

      // Sort tables by render order (shapes first, then emojis, then tables)
      const sortedTables = sortTablesByRenderOrder(
        tablesToRender,
        floorEmojiList
      );

      // Create and add objects for each table
      sortedTables.forEach((table) => {
        const { tableGroup, labelGroup } = this.createTableObject(table);

        this.canvas!.add(tableGroup as any);

        if (labelGroup) {
          this.positionLabel(tableGroup, labelGroup);
          this.canvas!.add(labelGroup as any);
        }
      });

      this.canvas.renderAll();
    } catch (error) {
      this.emitError(
        error instanceof Error
          ? error
          : new Error('Failed to render floorplan.')
      );
    }
  }

  /**
   * Internal method to handle room selection logic
   */
  private selectRoom(roomId: string): void {
    const room = this.rooms.find((r) => r.id === roomId);

    if (!room) {
      console.warn(`[FloorplanRenderer] Room with id "${roomId}" not found`);
      return;
    }

    const previousRoom = this.selectedRoom;
    this.selectedRoom = room;

    // Trigger callback if room changed
    if ((!previousRoom || previousRoom.id !== room.id) && this.onRoomChange) {
      this.onRoomChange(room);
    }

    // Re-render tabs to update active state
    this.renderTabs();

    // A new room starts at fit-zoom, centered
    this.resetView();

    // Re-render canvas
    this.render();

    // Re-snapshot for the minimap (canvas is at identity zoom here)
    this.captureMinimap();
  }

  /**
   * Destroy the renderer and clean up resources
   */
  public destroy(): void {
    // Stop reacting to container resizes
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.resizeRafId !== null) {
      cancelAnimationFrame(this.resizeRafId);
      this.resizeRafId = null;
    }

    // Cancel any in-flight pan frame
    if (this.panRafId !== null) {
      cancelAnimationFrame(this.panRafId);
      this.panRafId = null;
    }

    // Dispose canvas
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = null;
    }

    // Remove tabs container element
    if (this.tabsContainerElement && this.tabsContainerElement.parentNode) {
      this.tabsContainerElement.parentNode.removeChild(
        this.tabsContainerElement
      );
    }
    this.tabsContainerElement = null;

    // Remove canvas container element (this will also remove the canvas element and background element inside it)
    if (this.canvasContainerElement && this.canvasContainerElement.parentNode) {
      this.canvasContainerElement.parentNode.removeChild(
        this.canvasContainerElement
      );
    }
    this.canvasContainerElement = null;
    this.backgroundElement = null;
    this.canvasElement = null;
    this.zoomControlsElement = null;
    this.zoomInButton = null;
    this.zoomOutButton = null;
    this.minimapElement = null;
    this.minimapImageElement = null;
    this.minimapViewportElement = null;
  }
}
