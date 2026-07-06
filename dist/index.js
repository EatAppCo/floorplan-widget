"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  DEFAULT_TABLE_PALETTE: () => DEFAULT_TABLE_PALETTE,
  FLOOR_DEFAULT: () => FLOOR_DEFAULT,
  FloorplanRenderer: () => FloorplanRenderer,
  INVISIBLE_CHARACTER: () => INVISIBLE_CHARACTER,
  LabelGroup: () => LabelGroup_default,
  SCALE: () => SCALE,
  TableGroup: () => TableGroup_default,
  floorEmojiList: () => floorEmojiList,
  getDimensionsV2: () => getDimensionsV2,
  getTableTypePriority: () => getTableTypePriority,
  getTablesByRoomId: () => getTablesByRoomId,
  isEmoji: () => isEmoji,
  palette: () => palette,
  shapeColors: () => shapeColors,
  sortTablesByRenderOrder: () => sortTablesByRenderOrder
});
module.exports = __toCommonJS(index_exports);

// src/FloorplanRenderer.ts
var import_fabric = require("fabric");

// src/config/defaults.ts
var FLOOR_DEFAULT = {
  BOUNDING_RECT_COLOR: "#fcbf49",
  SELECTION_BORDER_COLOR: "#42A4F5",
  SELECTION_CORNER_BORDER_COLOR: "#3C3C3C",
  SELECTION_CORNER_COLOR: "#E5F4EB",
  BG_COLOR: "white",
  GRID_LINE_COLOR: "#e9e9e9",
  GRID_LINE_SPACING: 13,
  SELECTION_PADDING: 9,
  CANVAS_MIN_SIZE: 400,
  SHAPE_BG: "#E1E8F8",
  TABLE_MIN_COVERS: 1,
  TABLE_MAX_COVERS: 20,
  TABLE_SIZE: "6x6",
  TABLE_MIN_WIDTH: 36,
  TABLE_MIN_HEIGHT: 36,
  TABLE_RADIUS: 4,
  TABLE_DISABLED_OPACITY: 0.3,
  MAX_ZOOM_LEVEL: 5,
  MIN_ZOOM_LEVEL: 1,
  OPACITY_DISABLED: 0.5,
  STROKE_WIDTH: 1,
  STROKE_SELECTED_WIDTH: 3,
  STATUS_DISTANCE: 8,
  CHAIR_DISABLED_OPACITY: 0.3,
  CHAIR_WIDTH: 30,
  CHAIR_HEIGHT: 10,
  CHAIR_BG: "#B7B7B7",
  CHAIR_BORDER_RADIUS: 3,
  STATUS_ICON_FONT_SIZE: 22,
  SHADOW: "0 5px 10px rgba(0,0,0,0.6)"
};
var INVISIBLE_CHARACTER = "\u200E";
var SCALE = 64;
var ZOOM_STEPS = [1, 1.5, 2, 2.5];
var DRAG_THRESHOLD = 5;
var MINIMAP_SIZE = 120;
var DISABLED_OBJECT_PROPERTIES = {
  selectable: false,
  evented: false,
  hoverCursor: "default"
};
var CENTER_ORIGIN = {
  originX: "center",
  originY: "center"
};
var DEFAULT_TABLE_GROUP_OPTIONS = {
  ...CENTER_ORIGIN,
  selectable: false,
  evented: true,
  hasControls: false,
  hasBorders: false,
  hoverCursor: "pointer"
};
var LABEL_SIZE_CONFIG = {
  large: {
    LINE_HEIGHT: 20,
    TEXT_FONT_SIZE: 13,
    BORDER_RADIUS: 8
  },
  small: {
    LINE_HEIGHT: 19,
    TEXT_FONT_SIZE: 14,
    BORDER_RADIUS: 6
  },
  very_small: {
    LINE_HEIGHT: 14,
    TEXT_FONT_SIZE: 9,
    BORDER_RADIUS: 5
  }
};

// src/config/palette.ts
var palette = {
  red: "#B00020",
  green100: "#128849",
  brandGreen: "#74BF63",
  white: "#FFFFFF",
  white50: "#F9F9FB",
  white100: "#F8F8F8",
  gray: "#D8D8D8",
  gray50: "#FbFbFb",
  gray100: "#CCCCCC",
  gray200: "#999999",
  gray500: "#979797",
  dark100: "#34353A",
  dark50: "#4A4C50",
  black: "#000000"
};
var DEFAULT_TABLE_FILL_COLOR = palette.white;
var DEFAULT_TABLE_STROKE_COLOR = "#6F6F6F";
var SELECTED_TABLE_FILL_COLOR = "#E5F4EB";
var SELECTED_TABLE_STROKE_COLOR = "#128849";
var DEFAULT_TABLE_PALETTE = {
  text: palette.black,
  icon: null,
  fill: DEFAULT_TABLE_FILL_COLOR,
  stroke: DEFAULT_TABLE_STROKE_COLOR,
  blocked: "#EAEAEA",
  selectedFill: SELECTED_TABLE_FILL_COLOR,
  selectedStroke: SELECTED_TABLE_STROKE_COLOR,
  shadow: null,
  status: null,
  opacity: 1
};
var shapeColors = [
  "#E1E8F8",
  "#DBF4F3",
  "#FBE1E6",
  "#EDE5F7",
  "#E4E8EC",
  "#EEE0E8",
  "#D4E9BD",
  "#F9C5A5",
  "#FFE4BA",
  "#AADCB7",
  "#D1ADC1",
  "#AFC1EC"
];

// src/config/emojis.ts
var floorEmojiList = [
  "\u{1FAB4}",
  "\u{1F331}",
  "\u{1F33F}",
  "\u{1F343}",
  "\u{1F337}",
  "\u{1F33C}",
  "\u{1F338}",
  "\u{1F33A}",
  "\u{1F33B}",
  "\u{1F339}",
  "\u{1F490}",
  "\u{1F342}",
  "\u{1F341}",
  "\u{1F33E}",
  "\u{1F334}",
  "\u{1F335}",
  "\u{1F332}",
  "\u{1F333}",
  "\u{1F378}",
  "\u{1F379}",
  "\u{1F37A}",
  "\u{1F37B}",
  "\u{1F942}",
  "\u{1F943}",
  "\u{1F37E}",
  "\u{1F944}",
  "\u{1FAD6}",
  "\u2615\uFE0F",
  "\u{1F37D}\uFE0F",
  "\u{1F373}",
  "\u{1F6AC}",
  "\u{1F6AD}",
  "\u{1F4F7}",
  "\u{1F4F8}",
  "\u{1F4BB}",
  "\u260E\uFE0F",
  "\u{1F5A5}\uFE0F",
  "\u{1F5A8}\uFE0F",
  "\u{1F5B1}\uFE0F",
  "\u2328\uFE0F",
  "\u{1F6AA}",
  "\u{1FA9F}",
  "\u{1F6CB}\uFE0F",
  "\u{1FA91}",
  "\u{1F6CF}\uFE0F",
  "\u{1F6CC}",
  "\u{1FA9E}",
  "\u{1F6BD}",
  "\u{1F6BF}",
  "\u{1F6C1}",
  "\u{1F9FA}",
  "\u{1F9F9}",
  "\u{1F9FD}",
  "\u{1F9FC}",
  "\u{1FAA0}",
  "\u{1FAA3}",
  "\u{1F50C}",
  "\u{1F4A1}",
  "\u{1F570}\uFE0F",
  "\u{1F321}\uFE0F",
  "\u{1F39B}\uFE0F",
  "\u{1F399}\uFE0F",
  "\u{1F4FA}",
  "\u{1F4FB}",
  "\u{1F508}",
  "\u{1F509}",
  "\u{1F50A}",
  "\u{1F4DE}",
  "\u{1F4E0}",
  "\u{1F4DF}",
  "\u{1F4FD}\uFE0F",
  "\u{1F39E}\uFE0F",
  "\u{1F3A5}",
  "\u{1F3AC}",
  "\u{1F3A7}",
  "\u{1F3A4}",
  "\u{1F3BC}",
  "\u{1F3B5}",
  "\u{1F3B6}",
  "\u{1F3B9}",
  "\u{1F3BB}",
  "\u{1F3BA}",
  "\u{1F3B7}",
  "\u{1F941}",
  "\u{1F3B8}",
  "\u{1F3AE}",
  "\u{1F3AF}",
  "\u{1F3B0}",
  "\u{1F3B2}",
  "\u{1F9E9}",
  "\u{1F004}",
  "\u{1F3B4}",
  "\u{1F0CF}",
  "\u{1F579}\uFE0F",
  "\u{1F3FA}",
  "\u{1FA86}",
  "\u{1F6D1}",
  "\u{1F4A6}",
  "\u{1F3CA}",
  "\u26F1\uFE0F",
  "\u{1F3D6}\uFE0F",
  "\u26F2",
  "\u{1F30A}",
  "\u{1F347}",
  "\u{1F348}",
  "\u{1F349}",
  "\u{1F34A}",
  "\u{1F34B}",
  "\u{1F34C}",
  "\u{1F34D}",
  "\u{1F96D}",
  "\u{1F34E}",
  "\u{1F34F}",
  "\u{1F350}",
  "\u{1F351}",
  "\u{1F352}",
  "\u{1F353}",
  "\u{1FAD0}",
  "\u{1F95D}",
  "\u{1F345}",
  "\u{1FAD1}",
  "\u{1F336}\uFE0F",
  "\u{1FAD2}",
  "\u{1F96C}",
  "\u{1F966}",
  "\u{1F9C4}",
  "\u{1F9C5}",
  "\u{1F344}",
  "\u{1F95C}",
  "\u{1F330}",
  "\u{1F354}"
];

// src/helpers/tables.ts
var getSize = (table, viewSideLength) => {
  const size = table.size || "6x6";
  const [w, h] = size.split("x").map(Number);
  return [
    Math.floor(w * viewSideLength / SCALE),
    Math.floor(h * viewSideLength / SCALE)
  ];
};
var getCenterPoint = (table, viewSideLength) => {
  return [
    Math.floor(table.x * viewSideLength),
    Math.floor(table.y * viewSideLength)
  ];
};
var getDimensionsV2 = (table, viewSideLength) => {
  const size = getSize(table, viewSideLength);
  const centerPoint = getCenterPoint(table, viewSideLength);
  return {
    size,
    centerPoint,
    height: size[1],
    width: size[0],
    left: centerPoint[0],
    top: centerPoint[1]
  };
};
var getTablesByRoomId = (tables, roomId) => {
  return tables.filter((table) => table.room_id === roomId).sort((a, b) => {
    if (a && a.type && b && b.type) {
      return a.type.localeCompare(b.type);
    }
    return 0;
  });
};
var getTableTypePriority = (table, emojiList) => {
  if (table.type === "Shape") {
    return isEmoji(table, emojiList) ? 2 : 1;
  }
  return 3;
};
var isEmoji = (table, emojiList) => {
  return table && table.type === "Shape" && emojiList.includes(table.number);
};
var sortTablesByRenderOrder = (tables, emojiList) => {
  return [...tables].sort((a, b) => {
    const priorityA = getTableTypePriority(a, emojiList);
    const priorityB = getTableTypePriority(b, emojiList);
    return priorityA - priorityB;
  });
};

// src/objects/TableGroup.ts
var { fabric } = require("fabric");
var TableGroup = class extends fabric.Group {
  constructor(objects, options) {
    super(objects, options);
    this.tableContext = options.tableContext;
  }
};
var TableGroup_default = TableGroup;

// src/objects/LabelGroup.ts
var { fabric: fabric2 } = require("fabric");
var LabelGroup = class extends fabric2.Group {
  constructor(objects, options) {
    super(objects, options);
    this._relatedTableId = options._relatedTableId;
    this._positionOnTable = options._positionOnTable;
  }
};
var LabelGroup_default = LabelGroup;

// src/FloorplanRenderer.ts
var FloorplanRenderer = class {
  constructor(options) {
    this.canvas = null;
    this.canvasElement = null;
    this.containerElement = null;
    this.canvasContainerElement = null;
    this.backgroundElement = null;
    this.tabsContainerElement = null;
    this.rooms = [];
    this.blockedTableIds = [];
    this.preferredTableIds = [];
    this.paidTableIds = [];
    this.selectedTableIds = [];
    this.selectionMode = "multi";
    this.maxSelectable = null;
    this.covers = 0;
    this.tableGroups = [];
    this.showBackgroundImage = true;
    this.showEmojis = true;
    this.roomUnavailableHint = "";
    this.selectedRoom = null;
    this.onTableClick = null;
    this.onRoomChange = null;
    this.onError = null;
    this.canvasSize = 0;
    this.zoomControlsElement = null;
    this.zoomInButton = null;
    this.zoomOutButton = null;
    this.minimapElement = null;
    this.minimapImageElement = null;
    this.minimapViewportElement = null;
    this.minimapAvailable = true;
    this.zoomStepIndex = 0;
    this.isPanning = false;
    this.lastPointer = null;
    this.dragDistance = 0;
    this.pendingPanDelta = null;
    this.panRafId = null;
    this.resizeObserver = null;
    this.resizeRafId = null;
    this.touchTarget = null;
    this.boundTouchStart = null;
    this.boundTouchMove = null;
    this.boundTouchEnd = null;
    this.isPinching = false;
    this.suppressTap = false;
    this.pinchStartDistance = 0;
    this.pinchStartZoom = 1;
    var _a, _b, _c, _d;
    this.onError = options.onError || null;
    this.onTableClick = options.onTableClick || null;
    this.onRoomChange = options.onRoomChange || null;
    if (!options.containerElement) {
      const error = new Error("Container element is required.");
      this.emitError(error);
      return;
    }
    this.containerElement = options.containerElement;
    this.rooms = options.rooms || [];
    this.blockedTableIds = options.blockedTableIds || [];
    this.preferredTableIds = options.preferredTableIds || [];
    this.paidTableIds = options.paidTableIds || [];
    this.selectionMode = options.selectionMode || "multi";
    this.maxSelectable = (_a = options.maxSelectable) != null ? _a : null;
    this.covers = (_b = options.covers) != null ? _b : 0;
    this.tableGroups = options.tableGroups || [];
    this.showBackgroundImage = (_c = options.showBackgroundImage) != null ? _c : true;
    this.showEmojis = (_d = options.showEmojis) != null ? _d : true;
    this.roomUnavailableHint = options.roomUnavailableHint || "";
    this.selectedTableIds = (options.initialSelectedTableIds || []).filter(
      (id) => !this.blockedTableIds.includes(id)
    );
    if (this.maxSelectable !== null) {
      this.selectedTableIds = this.selectedTableIds.slice(
        0,
        this.maxSelectable
      );
    }
    if (this.rooms.length === 0) {
      this.emitError(new Error("No rooms available."));
      return;
    }
    this.selectedRoom = this.rooms.find((room) => room.id === options.initialRoomId) || this.rooms[0];
    this.initialize();
  }
  /**
   * Emit an error to the parent application
   */
  emitError(error) {
    if (this.onError) {
      this.onError(error);
    }
  }
  /**
   * Whether the multi-select cap has been reached
   */
  atSelectionLimit() {
    return this.maxSelectable !== null && this.selectedTableIds.length >= this.maxSelectable;
  }
  /**
   * Multi-select with linked-group support:
   * - tapping a selected table clears it (or its whole group if it was an atomic group);
   * - a table the party fits alone toggles as a single (respecting the cap);
   * - a table too small alone auto-extends to the nearest eligible group, selected atomically.
   */
  toggleMultiSelection(table) {
    if (this.selectedTableIds.includes(table.id)) {
      const group2 = this.selectedGroupContaining(table.id);
      this.selectedTableIds = group2 ? this.selectedTableIds.filter((id) => !group2.includes(id)) : this.selectedTableIds.filter((id) => id !== table.id);
      return;
    }
    if (this.fitsAlone(table)) {
      if (!this.atSelectionLimit()) this.selectedTableIds.push(table.id);
      return;
    }
    const group = this.nearestGroupContaining(table);
    if (group) this.selectedTableIds = [...group];
  }
  /** Whether the party fits this single table (covers unknown ⇒ treat as fits, single behaviour). */
  fitsAlone(table) {
    var _a;
    return this.covers === 0 || ((_a = table.max_covers) != null ? _a : 0) >= this.covers;
  }
  /**
   * The group that IS the current selection and contains `id`, matched EXACTLY (same length), so tapping any
   * member clears the whole set. Exact match prevents an overlapping subset combo (e.g. [A,B] vs a selected
   * [A,B,C]) from clearing only part of the group and leaving an invalid, non-combo remainder.
   */
  selectedGroupContaining(id) {
    return this.tableGroups.find(
      (group) => group.includes(id) && group.length === this.selectedTableIds.length && group.every((member) => this.selectedTableIds.includes(member))
    ) || null;
  }
  /**
   * Defensive: `tableGroups` is meant to be host-prefiltered, but as a package API the renderer never
   * auto-selects a combo with a member that isn't in the current room, is blocked, or exceeds the cap.
   */
  groupIsSelectable(group) {
    var _a;
    if (this.maxSelectable !== null && group.length > this.maxSelectable)
      return false;
    const roomTableIds = (((_a = this.selectedRoom) == null ? void 0 : _a.tables) || []).filter((table) => table.type === "Table").map((table) => table.id);
    return group.every(
      (id) => roomTableIds.includes(id) && !this.blockedTableIds.includes(id)
    );
  }
  /** Nearest eligible group containing `table`: smallest max-distance to a member, then fewest tables, then ids. */
  nearestGroupContaining(table) {
    const candidates = this.tableGroups.filter(
      (group) => group.includes(table.id) && this.groupIsSelectable(group)
    );
    if (candidates.length === 0) return null;
    return candidates.slice().sort((a, b) => {
      const byDistance = this.maxMemberDistance(table, a) - this.maxMemberDistance(table, b);
      if (byDistance !== 0) return byDistance;
      if (a.length !== b.length) return a.length - b.length;
      return a.join().localeCompare(b.join());
    })[0];
  }
  /** The farthest a member of `group` sits from `table` (so we can prefer the most compact group). */
  maxMemberDistance(table, group) {
    return Math.max(
      ...group.map((id) => {
        const member = this.findTableById(id);
        if (!member) return Infinity;
        return Math.hypot(member.x - table.x, member.y - table.y);
      })
    );
  }
  findTableById(id) {
    for (const room of this.rooms) {
      const match = room.tables.find((table) => table.id === id);
      if (match) return match;
    }
    return void 0;
  }
  /**
   * Initialize the canvas and render the floorplan
   */
  initialize() {
    try {
      if (!this.containerElement) {
        this.emitError(new Error("Container element is not initialized."));
        return;
      }
      this.containerElement.innerHTML = "";
      this.containerElement.classList.add("floorplan-container");
      this.renderTabs();
      this.canvasContainerElement = document.createElement("div");
      this.canvasContainerElement.className = "floorplan-canvas-container";
      this.containerElement.appendChild(this.canvasContainerElement);
      this.canvasElement = document.createElement("canvas");
      this.canvasContainerElement.appendChild(this.canvasElement);
      this.updateCanvasSize();
      this.canvas = new import_fabric.fabric.Canvas(this.canvasElement, {
        backgroundColor: "transparent",
        preserveObjectStacking: true,
        selection: false,
        width: this.canvasSize,
        height: this.canvasSize,
        renderOnAddRemove: false,
        stateful: false,
        allowTouchScrolling: true
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
        error instanceof Error ? error : new Error("Failed to initialize floorplan.")
      );
    }
  }
  /**
   * Size the (square) canvas to the smaller of the container's two dimensions so it always fits
   * its host. Falls back to the minimum only when the container is unmeasured (0×0 before layout) —
   * a forced minimum would overflow a narrow host (e.g. the admin preview panel) and clip the plan.
   */
  updateCanvasSize() {
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
  observeResize() {
    if (typeof ResizeObserver === "undefined" || !this.canvasContainerElement) {
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
  handleResize() {
    if (!this.canvas || !this.canvasContainerElement) return;
    const previousSize = this.canvasSize;
    this.updateCanvasSize();
    if (this.canvasSize === previousSize || this.canvasSize <= 0) return;
    this.canvas.setDimensions({
      width: this.canvasSize,
      height: this.canvasSize
    });
    this.resetView();
    this.render();
    this.captureMinimap();
  }
  /**
   * Set up canvas event handlers. Pointer down/move/up drive drag-pan (when zoomed)
   * and, on a non-drag release, table selection.
   */
  setupEventHandlers() {
    if (!this.canvas) return;
    this.canvas.on(
      "mouse:down",
      (opt) => this.onPointerDown(opt)
    );
    this.canvas.on(
      "mouse:move",
      (opt) => this.onPointerMove(opt)
    );
    this.canvas.on(
      "mouse:up",
      (opt) => this.onPointerUp(opt)
    );
    this.setupTouchGestures();
  }
  /**
   * Pinch-to-zoom on touch devices. Fabric tracks only the first touch (pan/select), so a second
   * finger is handled here: zoom continuously toward the pinch midpoint, and suppress the
   * pan/select path and the browser's own page-zoom while two fingers are down. Bound on the
   * container in the capture phase so it runs before Fabric's own canvas handlers.
   */
  setupTouchGestures() {
    const target = this.canvasContainerElement;
    if (!target) return;
    this.touchTarget = target;
    this.boundTouchStart = (e) => this.onTouchStart(e);
    this.boundTouchMove = (e) => this.onTouchMove(e);
    this.boundTouchEnd = (e) => this.onTouchEnd(e);
    target.addEventListener("touchstart", this.boundTouchStart, {
      capture: true
    });
    target.addEventListener("touchmove", this.boundTouchMove, {
      passive: false,
      capture: true
    });
    target.addEventListener("touchend", this.boundTouchEnd, { capture: true });
    target.addEventListener("touchcancel", this.boundTouchEnd, {
      capture: true
    });
  }
  /**
   * Distance between two active touch points
   */
  touchSeparation(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  }
  /**
   * Midpoint of a two-finger touch, in canvas-local coordinates (origin at the canvas top-left)
   */
  touchMidpoint(touches) {
    var _a, _b, _c;
    const rect = (_a = this.canvasContainerElement) == null ? void 0 : _a.getBoundingClientRect();
    const x = (touches[0].clientX + touches[1].clientX) / 2 - ((_b = rect == null ? void 0 : rect.left) != null ? _b : 0);
    const y = (touches[0].clientY + touches[1].clientY) / 2 - ((_c = rect == null ? void 0 : rect.top) != null ? _c : 0);
    return new import_fabric.fabric.Point(x, y);
  }
  onTouchStart(e) {
    if (e.touches.length !== 2) return;
    this.isPinching = true;
    this.suppressTap = true;
    this.isPanning = false;
    this.pinchStartDistance = this.touchSeparation(e.touches);
    this.pinchStartZoom = this.currentZoom();
  }
  onTouchMove(e) {
    if (!this.isPinching || e.touches.length !== 2 || !this.canvas) return;
    e.preventDefault();
    if (this.pinchStartDistance <= 0) return;
    const ratio = this.touchSeparation(e.touches) / this.pinchStartDistance;
    const maxZoom = ZOOM_STEPS[ZOOM_STEPS.length - 1];
    const zoom = Math.min(
      maxZoom,
      Math.max(FLOOR_DEFAULT.MIN_ZOOM_LEVEL, this.pinchStartZoom * ratio)
    );
    this.canvas.zoomToPoint(this.touchMidpoint(e.touches), zoom);
    if (zoom <= FLOOR_DEFAULT.MIN_ZOOM_LEVEL) {
      this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    } else {
      this.clampPan();
    }
    this.canvas.requestRenderAll();
    this.syncBackgroundTransform();
    this.syncMinimap();
  }
  onTouchEnd(e) {
    if (e.touches.length >= 2 || !this.isPinching) return;
    this.isPinching = false;
    this.syncZoomStepIndex();
    this.updateZoomButtons();
  }
  /**
   * Align zoomStepIndex with the current (possibly continuous) zoom left by a pinch
   */
  syncZoomStepIndex() {
    const zoom = this.currentZoom();
    let nearest = 0;
    ZOOM_STEPS.forEach((step, index) => {
      if (Math.abs(step - zoom) < Math.abs(ZOOM_STEPS[nearest] - zoom)) {
        nearest = index;
      }
    });
    this.zoomStepIndex = nearest;
  }
  isMultiTouch(e) {
    return "touches" in e && e.touches.length >= 2;
  }
  /**
   * Screen-space coordinates of a mouse or touch pointer event
   */
  pointerXY(e) {
    if ("touches" in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return touch ? { x: touch.clientX, y: touch.clientY } : { x: 0, y: 0 };
    }
    return { x: e.clientX, y: e.clientY };
  }
  onPointerDown(opt) {
    if (this.isPinching || this.isMultiTouch(opt.e)) return;
    this.suppressTap = false;
    this.lastPointer = this.pointerXY(opt.e);
    this.dragDistance = 0;
    this.isPanning = this.currentZoom() > 1;
  }
  onPointerMove(opt) {
    if (this.isPinching || this.isMultiTouch(opt.e)) return;
    if (!this.lastPointer) return;
    const xy = this.pointerXY(opt.e);
    const dx = xy.x - this.lastPointer.x;
    const dy = xy.y - this.lastPointer.y;
    this.dragDistance += Math.abs(dx) + Math.abs(dy);
    this.lastPointer = xy;
    if (this.isPanning) {
      opt.e.preventDefault();
      this.schedulePan(dx, dy);
    }
  }
  onPointerUp(opt) {
    if (this.isPinching || this.suppressTap || this.isMultiTouch(opt.e)) {
      this.suppressTap = false;
      this.lastPointer = null;
      this.isPanning = false;
      this.dragDistance = 0;
      return;
    }
    const wasDrag = this.dragDistance > DRAG_THRESHOLD;
    this.lastPointer = null;
    this.isPanning = false;
    this.dragDistance = 0;
    if (!wasDrag) {
      this.handleTableSelect(opt);
    }
  }
  /**
   * Toggle the pressed table's selection and notify the host
   */
  handleTableSelect(opt) {
    try {
      const target = opt.target;
      if (!(target instanceof TableGroup_default)) return;
      const table = target.tableContext;
      if (!table || table.type !== "Table") return;
      if (this.selectionMode === "single") {
        this.selectedTableIds = this.selectedTableIds.includes(table.id) ? [] : [table.id];
      } else {
        this.toggleMultiSelection(table);
      }
      this.render();
      if (this.onTableClick) {
        this.onTableClick(table, [...this.selectedTableIds]);
      }
    } catch (error) {
      this.emitError(
        error instanceof Error ? error : new Error("Error handling table click.")
      );
    }
  }
  /**
   * Current canvas zoom (1 = fit)
   */
  currentZoom() {
    return this.canvas ? this.canvas.getZoom() : 1;
  }
  /**
   * Apply a pan delta on the next frame, coalescing pointer events to one
   * viewport write per frame (Fabric pan is main-thread heavy on large rooms)
   */
  schedulePan(dx, dy) {
    var _a, _b;
    this.pendingPanDelta = {
      x: (((_a = this.pendingPanDelta) == null ? void 0 : _a.x) || 0) + dx,
      y: (((_b = this.pendingPanDelta) == null ? void 0 : _b.y) || 0) + dy
    };
    if (this.panRafId !== null) return;
    this.panRafId = requestAnimationFrame(() => {
      this.panRafId = null;
      const delta = this.pendingPanDelta;
      this.pendingPanDelta = null;
      if (!delta || !this.canvas) return;
      this.canvas.relativePan(new import_fabric.fabric.Point(delta.x, delta.y));
      this.clampPan();
      this.canvas.requestRenderAll();
      this.syncBackgroundTransform();
      this.syncMinimap();
    });
  }
  /**
   * Keep the panned viewport within the room bounds (no empty gutters)
   */
  clampPan() {
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
  syncBackgroundTransform() {
    if (!this.backgroundElement || !this.canvas) return;
    const vpt = this.canvas.viewportTransform;
    if (!vpt) return;
    this.backgroundElement.style.transform = `translate(${vpt[4]}px, ${vpt[5]}px) scale(${vpt[0]})`;
  }
  /**
   * Fabric's canvas wrapper (.canvas-container) — the centered square that the overlays
   * (background, zoom controls, minimap) anchor to, so they float on the canvas itself rather
   * than the padded region around it. Falls back to the outer container if the wrapper is missing.
   */
  overlayMount() {
    var _a, _b;
    return (_b = (_a = this.canvasContainerElement) == null ? void 0 : _a.querySelector(
      ".canvas-container"
    )) != null ? _b : this.canvasContainerElement;
  }
  /**
   * Render the zoom in/out buttons over the canvas
   */
  renderZoomControls() {
    const mount = this.overlayMount();
    if (!mount) return;
    this.zoomControlsElement = document.createElement("div");
    this.zoomControlsElement.className = "floorplan-zoom-controls";
    this.zoomInButton = this.createZoomButton(
      "+",
      "Zoom in",
      () => this.stepZoom(1)
    );
    this.zoomOutButton = this.createZoomButton(
      "\u2212",
      "Zoom out",
      () => this.stepZoom(-1)
    );
    this.zoomControlsElement.appendChild(this.zoomOutButton);
    this.zoomControlsElement.appendChild(this.zoomInButton);
    mount.appendChild(this.zoomControlsElement);
    this.updateZoomButtons();
  }
  createZoomButton(label, ariaLabel, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "floorplan-zoom-button";
    button.textContent = label;
    button.setAttribute("aria-label", ariaLabel);
    button.addEventListener("click", onClick);
    return button;
  }
  /**
   * Step the zoom one level, then recenter (at fit) or clamp the viewport
   */
  stepZoom(direction) {
    if (!this.canvas) return;
    const nextIndex = Math.min(
      ZOOM_STEPS.length - 1,
      Math.max(0, this.zoomStepIndex + direction)
    );
    if (nextIndex === this.zoomStepIndex) return;
    this.zoomStepIndex = nextIndex;
    const zoom = ZOOM_STEPS[nextIndex];
    const center = new import_fabric.fabric.Point(this.canvasSize / 2, this.canvasSize / 2);
    this.canvas.zoomToPoint(center, zoom);
    if (zoom === 1) {
      this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    } else {
      this.clampPan();
    }
    this.canvas.requestRenderAll();
    this.syncBackgroundTransform();
    this.updateZoomButtons();
    this.syncMinimap();
  }
  /**
   * Reset to fit-zoom and recenter (used on room change)
   */
  resetView() {
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
  updateZoomButtons() {
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
  renderMinimap() {
    const mount = this.overlayMount();
    if (!mount) return;
    this.minimapElement = document.createElement("div");
    this.minimapElement.className = "floorplan-minimap";
    this.minimapElement.style.width = `${MINIMAP_SIZE}px`;
    this.minimapElement.style.height = `${MINIMAP_SIZE}px`;
    this.minimapElement.style.display = "none";
    this.minimapImageElement = document.createElement("img");
    this.minimapImageElement.className = "floorplan-minimap-image";
    this.minimapImageElement.alt = "";
    this.minimapViewportElement = document.createElement("div");
    this.minimapViewportElement.className = "floorplan-minimap-viewport";
    this.minimapElement.appendChild(this.minimapImageElement);
    this.minimapElement.appendChild(this.minimapViewportElement);
    mount.appendChild(this.minimapElement);
  }
  /**
   * Snapshot the (vector-only) room into the minimap. MUST be called only at
   * identity zoom — Fabric's toDataURL honors the viewportTransform, so a zoomed
   * capture would store a cropped view. The background image is a DOM sibling, not
   * on the canvas, so the export can't be CORS-tainted; guard regardless.
   */
  captureMinimap() {
    if (!this.canvas || !this.minimapImageElement) return;
    try {
      this.minimapImageElement.src = this.canvas.toDataURL({
        format: "png",
        multiplier: MINIMAP_SIZE / this.canvasSize
      });
      this.minimapAvailable = true;
    } catch (error) {
      this.minimapAvailable = false;
      if (this.minimapElement) {
        this.minimapElement.style.display = "none";
      }
      console.warn("[FloorplanRenderer] Minimap snapshot failed", error);
    }
  }
  /**
   * Show the minimap only while zoomed and move its viewport rectangle to match
   * the current pan/zoom (reads the vpt; never re-snapshots)
   */
  syncMinimap() {
    if (!this.minimapElement || !this.canvas) return;
    const zoom = this.canvas.getZoom();
    const visible = this.minimapAvailable && zoom > 1;
    this.minimapElement.style.display = visible ? "block" : "none";
    if (!visible || !this.minimapViewportElement) return;
    const vpt = this.canvas.viewportTransform;
    if (!vpt) return;
    const scale = MINIMAP_SIZE / this.canvasSize;
    const size = MINIMAP_SIZE / zoom;
    this.minimapViewportElement.style.width = `${size}px`;
    this.minimapViewportElement.style.height = `${size}px`;
    this.minimapViewportElement.style.left = `${-vpt[4] / zoom * scale}px`;
    this.minimapViewportElement.style.top = `${-vpt[5] / zoom * scale}px`;
  }
  /**
   * Render room tabs
   */
  renderTabs() {
    if (!this.tabsContainerElement && this.containerElement) {
      this.tabsContainerElement = document.createElement("div");
      this.tabsContainerElement.className = "floorplan-tabs-container";
      this.containerElement.appendChild(this.tabsContainerElement);
    }
    if (!this.tabsContainerElement) return;
    this.tabsContainerElement.innerHTML = "";
    this.rooms.forEach((room) => {
      const tabItem = document.createElement("div");
      tabItem.textContent = room.name;
      tabItem.className = "floorplan-tab";
      tabItem.setAttribute("data-room-id", room.id);
      const isActive = this.selectedRoom && this.selectedRoom.id === room.id;
      if (isActive) {
        tabItem.classList.add("floorplan-tab--active");
      }
      const isDisabled = !isActive && !this.roomHasAvailability(room);
      if (isDisabled) {
        tabItem.classList.add("floorplan-tab--disabled");
        if (this.roomUnavailableHint) tabItem.title = this.roomUnavailableHint;
      } else {
        tabItem.addEventListener("click", () => {
          this.selectRoom(room.id);
        });
      }
      if (this.tabsContainerElement) {
        this.tabsContainerElement.appendChild(tabItem);
      }
    });
  }
  /** Whether a room has at least one bookable table that isn't blocked at the chosen time. */
  roomHasAvailability(room) {
    return room.tables.some(
      (table) => table.type === "Table" && !this.blockedTableIds.includes(table.id)
    );
  }
  /**
   * Create a label for the table number
   */
  createTableNumberLabel(table, isSelected) {
    const config = LABEL_SIZE_CONFIG.very_small;
    const tableNumber = table.number;
    const textElement = new import_fabric.fabric.Text(tableNumber, {
      ...DISABLED_OBJECT_PROPERTIES,
      ...CENTER_ORIGIN,
      fontFamily: "Inter, sans-serif",
      fill: table.type === "Shape" ? "black" : "#979797",
      fontSize: config.TEXT_FONT_SIZE - (table.type === "Shape" ? 1 : 0),
      lineHeight: 1,
      textAlign: "center"
    });
    const circleSize = config.LINE_HEIGHT;
    const labelRect = new import_fabric.fabric.Rect({
      ...DISABLED_OBJECT_PROPERTIES,
      ...CENTER_ORIGIN,
      height: circleSize,
      width: circleSize,
      rx: circleSize / 2,
      ry: circleSize / 2,
      fill: table.type === "Shape" ? "rgba(0,0,0,0.05)" : palette.white,
      stroke: isSelected ? DEFAULT_TABLE_PALETTE.selectedStroke : DEFAULT_TABLE_PALETTE.stroke,
      strokeWidth: FLOOR_DEFAULT.STROKE_WIDTH
    });
    return new LabelGroup_default([labelRect, textElement], {
      ...DISABLED_OBJECT_PROPERTIES,
      ...CENTER_ORIGIN,
      _relatedTableId: table.id,
      _positionOnTable: "bottom"
    });
  }
  /**
   * Create a `$` badge for a table that incurs an up-front payment
   */
  createPaymentLabel(table) {
    const config = LABEL_SIZE_CONFIG.very_small;
    const textElement = new import_fabric.fabric.Text("$", {
      ...DISABLED_OBJECT_PROPERTIES,
      ...CENTER_ORIGIN,
      fontFamily: "Inter, sans-serif",
      fill: palette.green100,
      fontSize: config.TEXT_FONT_SIZE,
      lineHeight: 1,
      textAlign: "center"
    });
    const circleSize = config.LINE_HEIGHT;
    const labelRect = new import_fabric.fabric.Rect({
      ...DISABLED_OBJECT_PROPERTIES,
      ...CENTER_ORIGIN,
      height: circleSize,
      width: circleSize,
      rx: circleSize / 2,
      ry: circleSize / 2,
      fill: palette.white,
      stroke: palette.green100,
      strokeWidth: FLOOR_DEFAULT.STROKE_WIDTH
    });
    return new LabelGroup_default([labelRect, textElement], {
      ...DISABLED_OBJECT_PROPERTIES,
      ...CENTER_ORIGIN,
      _relatedTableId: table.id,
      _positionOnTable: "corner"
    });
  }
  /**
   * Create a centered name label for a non-emoji shape (e.g. "Burj Khalifa View")
   */
  createShapeLabel(table) {
    return new import_fabric.fabric.Text(table.number, {
      ...DISABLED_OBJECT_PROPERTIES,
      ...CENTER_ORIGIN,
      fontFamily: "Inter, sans-serif",
      fill: palette.dark100,
      fontSize: LABEL_SIZE_CONFIG.very_small.TEXT_FONT_SIZE,
      lineHeight: 1,
      textAlign: "center"
    });
  }
  /**
   * Create a table object for rendering on canvas
   */
  createTableObject(table) {
    try {
      const { top, left, width, height } = getDimensionsV2(
        table,
        this.canvasSize
      );
      const { rotation, type, color, shape } = table;
      const isRectangleShape = shape === "rectangle" || shape === "square";
      const isShape = type === "Shape";
      const isTable = type === "Table";
      const isEmojiType = isEmoji(table, floorEmojiList);
      const isBlocked = this.blockedTableIds.includes(table.id);
      const isSelected = this.selectedTableIds.includes(table.id);
      const isPreferred = this.preferredTableIds.includes(table.id);
      const isPaid = this.paidTableIds.includes(table.id);
      const tableObjectOptions = {
        ...CENTER_ORIGIN,
        strokeWidth: isSelected ? FLOOR_DEFAULT.STROKE_SELECTED_WIDTH : FLOOR_DEFAULT.STROKE_WIDTH,
        rx: isEmojiType ? 0 : isRectangleShape ? FLOOR_DEFAULT.TABLE_RADIUS : Math.abs(width) / 2,
        ry: isEmojiType ? 0 : isRectangleShape ? FLOOR_DEFAULT.TABLE_RADIUS : Math.abs(height) / 2,
        strokeUniform: true,
        stroke: isShape ? "transparent" : isBlocked ? "transparent" : isSelected ? DEFAULT_TABLE_PALETTE.selectedStroke : DEFAULT_TABLE_PALETTE.stroke,
        fill: isEmojiType ? "transparent" : isBlocked ? DEFAULT_TABLE_PALETTE.blocked : isSelected ? DEFAULT_TABLE_PALETTE.selectedFill : isShape ? color || "transparent" : DEFAULT_TABLE_PALETTE.fill,
        perPixelTargetFind: true
      };
      let tableObject;
      if (isEmojiType) {
        tableObject = new import_fabric.fabric.IText(table.number, {
          ...CENTER_ORIGIN,
          fontSize: width,
          lineHeight: 1,
          textAlign: "center"
        });
      } else if (isRectangleShape) {
        tableObject = new import_fabric.fabric.Rect({
          width,
          height,
          ...tableObjectOptions
        });
      } else {
        tableObject = new import_fabric.fabric.Ellipse({
          ...tableObjectOptions
        });
      }
      const groupObjects = [tableObject];
      if (isShape && !isEmojiType && table.number) {
        groupObjects.push(this.createShapeLabel(table));
      }
      const tableGroup = new TableGroup_default(groupObjects, {
        ...DEFAULT_TABLE_GROUP_OPTIONS,
        tableContext: table,
        top,
        left,
        angle: rotation || 0,
        perPixelTargetFind: true,
        evented: isTable && !isBlocked,
        hoverCursor: isTable && !isBlocked ? "pointer" : "default"
      });
      let labelGroup = null;
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
        error instanceof Error ? error : new Error(`Failed to create table: ${table.id}.`)
      );
      return {
        tableGroup: new TableGroup_default([], { tableContext: table }),
        labelGroup: null
      };
    }
  }
  /**
   * Position the label relative to its table group
   */
  positionLabel(tableGroup, labelGroup) {
    const boundingRect = tableGroup.getBoundingRect();
    const isShape = tableGroup.tableContext.type === "Shape";
    if (labelGroup._positionOnTable === "corner") {
      labelGroup.set({
        top: boundingRect.top + boundingRect.height,
        left: boundingRect.left + boundingRect.width
      });
      return;
    }
    const adjustedHeight = isShape ? boundingRect.height / 2 : boundingRect.height - FLOOR_DEFAULT.STROKE_WIDTH / 2;
    labelGroup.set({
      top: boundingRect.top + adjustedHeight,
      left: boundingRect.left + boundingRect.width / 2
    });
  }
  /**
   * Setup and update the background image
   * Creates the background element if it doesn't exist, then updates the image
   */
  updateBackgroundImage() {
    if (!this.canvasContainerElement) return;
    if (!this.backgroundElement) {
      const fabricCanvasContainer = this.canvasContainerElement.querySelector(
        ".canvas-container"
      );
      if (!fabricCanvasContainer) {
        console.warn(
          "[FloorplanRenderer] Could not find Fabric.js canvas-container"
        );
        return;
      }
      this.backgroundElement = document.createElement("div");
      this.backgroundElement.className = "floorplan-background";
      fabricCanvasContainer.insertBefore(
        this.backgroundElement,
        fabricCanvasContainer.firstChild
      );
    }
    if (this.showBackgroundImage && this.selectedRoom && this.selectedRoom.background_image_url) {
      this.backgroundElement.style.backgroundImage = `url(${this.selectedRoom.background_image_url})`;
    } else {
      this.backgroundElement.style.backgroundImage = "";
    }
    this.syncBackgroundTransform();
  }
  /**
   * Render all tables on the canvas
   */
  render() {
    try {
      if (!this.canvas) return;
      const vpt = this.canvas.viewportTransform ? [...this.canvas.viewportTransform] : null;
      this.canvas.clear();
      if (vpt) {
        this.canvas.setViewportTransform(vpt);
      }
      this.updateBackgroundImage();
      const tablesToRender = (this.selectedRoom && this.selectedRoom.tables || []).filter((table) => this.showEmojis || !isEmoji(table, floorEmojiList));
      const sortedTables = sortTablesByRenderOrder(
        tablesToRender,
        floorEmojiList
      );
      sortedTables.forEach((table) => {
        const { tableGroup, labelGroup } = this.createTableObject(table);
        this.canvas.add(tableGroup);
        if (labelGroup) {
          this.positionLabel(tableGroup, labelGroup);
          this.canvas.add(labelGroup);
        }
      });
      this.canvas.renderAll();
    } catch (error) {
      this.emitError(
        error instanceof Error ? error : new Error("Failed to render floorplan.")
      );
    }
  }
  /**
   * Internal method to handle room selection logic
   */
  selectRoom(roomId) {
    const room = this.rooms.find((r) => r.id === roomId);
    if (!room) {
      console.warn(`[FloorplanRenderer] Room with id "${roomId}" not found`);
      return;
    }
    if (!this.roomHasAvailability(room)) return;
    const previousRoom = this.selectedRoom;
    this.selectedRoom = room;
    if ((!previousRoom || previousRoom.id !== room.id) && this.onRoomChange) {
      this.onRoomChange(room);
    }
    this.renderTabs();
    this.resetView();
    this.render();
    this.captureMinimap();
  }
  /**
   * Destroy the renderer and clean up resources
   */
  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.resizeRafId !== null) {
      cancelAnimationFrame(this.resizeRafId);
      this.resizeRafId = null;
    }
    if (this.panRafId !== null) {
      cancelAnimationFrame(this.panRafId);
      this.panRafId = null;
    }
    if (this.touchTarget) {
      if (this.boundTouchStart) {
        this.touchTarget.removeEventListener(
          "touchstart",
          this.boundTouchStart,
          true
        );
      }
      if (this.boundTouchMove) {
        this.touchTarget.removeEventListener(
          "touchmove",
          this.boundTouchMove,
          true
        );
      }
      if (this.boundTouchEnd) {
        this.touchTarget.removeEventListener(
          "touchend",
          this.boundTouchEnd,
          true
        );
        this.touchTarget.removeEventListener(
          "touchcancel",
          this.boundTouchEnd,
          true
        );
      }
      this.touchTarget = null;
    }
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = null;
    }
    if (this.tabsContainerElement && this.tabsContainerElement.parentNode) {
      this.tabsContainerElement.parentNode.removeChild(
        this.tabsContainerElement
      );
    }
    this.tabsContainerElement = null;
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
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_TABLE_PALETTE,
  FLOOR_DEFAULT,
  FloorplanRenderer,
  INVISIBLE_CHARACTER,
  LabelGroup,
  SCALE,
  TableGroup,
  floorEmojiList,
  getDimensionsV2,
  getTableTypePriority,
  getTablesByRoomId,
  isEmoji,
  palette,
  shapeColors,
  sortTablesByRenderOrder
});
