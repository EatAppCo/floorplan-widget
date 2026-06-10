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
  LABEL_SIZE_CONFIG,
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
  private selectedTableIds: string[] = [];
  private selectionMode: 'single' | 'multi' = 'multi';
  private selectedRoom: Room | null = null;
  private onTableClick: OnTableClickCallback | null = null;
  private onRoomChange: OnRoomChangeCallback | null = null;
  private onError: OnErrorCallback | null = null;
  private canvasSize: number = 0;

  constructor(options: FloorplanRendererOptions) {
    // Set callbacks
    this.onError = options.onError || null;
    this.onTableClick = options.onTableClick || null;
    this.onRoomChange = options.onRoomChange || null;

    // Validate container element
    if (!options.containerElement) {
      const error = new Error('Container element is required.')
      this.emitError(error);
      return;
    }

    // Set options
    this.containerElement = options.containerElement;
    this.rooms = options.rooms || [];
    this.blockedTableIds = options.blockedTableIds || [];
    this.preferredTableIds = options.preferredTableIds || [];
    this.selectionMode = options.selectionMode || 'multi';
    this.selectedTableIds = (options.initialSelectedTableIds || []).filter(
      (id) => !this.blockedTableIds.includes(id)
    );

    if (this.rooms.length === 0) {
      this.emitError(new Error('No rooms available.'));
      return;
    }

    // Set initial room
    this.selectedRoom = this.rooms[0];

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
    } catch (error) {
      this.emitError(error instanceof Error ? error : new Error('Failed to initialize floorplan.'));
    }
  }

  /**
   * Calculate and update canvas size based on canvas container element
   */
  private updateCanvasSize(): void {
    if (!this.canvasContainerElement) return;

    const containerRect = this.canvasContainerElement.getBoundingClientRect();
    this.canvasSize = Math.min(containerRect.width, containerRect.height);

    if (this.canvasSize < FLOOR_DEFAULT.CANVAS_MIN_SIZE) {
      this.canvasSize = FLOOR_DEFAULT.CANVAS_MIN_SIZE;
    }
  }

  /**
   * Set up canvas event handlers
   */
  private setupEventHandlers(): void {
    if (!this.canvas) return;

    this.canvas.on('mouse:up', (event: fabric.IEvent<MouseEvent>) => {
      try {
        const target = event.target;
        if (target && target instanceof TableGroup) {
          const table = target.tableContext;
          if (table && table.type === 'Table') {
            if (this.selectionMode === 'single') {
              this.selectedTableIds = this.selectedTableIds.includes(table.id)
                ? []
                : [table.id];
            } else {
              const tableIndex = this.selectedTableIds.indexOf(table.id);
              if (tableIndex === -1) {
                this.selectedTableIds.push(table.id);
              } else {
                this.selectedTableIds.splice(tableIndex, 1);
              }
            }

            // Re-render to update selection styling
            this.render();

            if (this.onTableClick) {
              this.onTableClick(table, [...this.selectedTableIds]);
            }
          }
        }
      } catch (error) {
        this.emitError(error instanceof Error ? error : new Error('Error handling table click.'));
      }
    });
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
            ? '#dddddd'
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

      // Create table group
      const tableGroup = new TableGroup([tableObject], {
        ...DEFAULT_TABLE_GROUP_OPTIONS,
        tableContext: table,
        top,
        left,
        angle: rotation || 0,
        perPixelTargetFind: true,
        evented: isTable && !isBlocked,
        hoverCursor: isTable && !isBlocked ? 'pointer' : 'default',
      });

      let labelGroup: LabelGroup | null = null;
      if (!isEmojiType && !isBlocked && isPreferred && isTable) {
        labelGroup = this.createTableNumberLabel(table, isSelected);
      }

      return { tableGroup, labelGroup };
    } catch (error) {
      this.emitError(error instanceof Error ? error : new Error(`Failed to create table: ${table.id}.`));
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

    if (this.selectedRoom && this.selectedRoom.background_image_url) {
      this.backgroundElement.style.backgroundImage = `url(${this.selectedRoom.background_image_url})`;
    } else {
      // Clear background image if not set
      this.backgroundElement.style.backgroundImage = '';
    }
  }

  /**
   * Render all tables on the canvas
   */
  private render(): void {
    try {
      if (!this.canvas) return;

      this.canvas.clear();

      this.updateBackgroundImage();

      // Get tables from selected room
      const tablesToRender =
        (this.selectedRoom && this.selectedRoom.tables) || [];

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
      this.emitError(error instanceof Error ? error : new Error('Failed to render floorplan.'));
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

    // Re-render canvas
    this.render();
  }

  /**
   * Destroy the renderer and clean up resources
   */
  public destroy(): void {
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
  }
}
