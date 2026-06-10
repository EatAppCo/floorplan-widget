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
  STROKE_SELECTED_WIDTH: 1,
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
    this.selectedTableIds = [];
    this.selectionMode = "multi";
    this.selectedRoom = null;
    this.onTableClick = null;
    this.onRoomChange = null;
    this.onError = null;
    this.canvasSize = 0;
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
    this.selectionMode = options.selectionMode || "multi";
    this.selectedTableIds = (options.initialSelectedTableIds || []).filter(
      (id) => !this.blockedTableIds.includes(id)
    );
    if (this.rooms.length === 0) {
      this.emitError(new Error("No rooms available."));
      return;
    }
    this.selectedRoom = this.rooms[0];
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
    } catch (error) {
      this.emitError(error instanceof Error ? error : new Error("Failed to initialize floorplan."));
    }
  }
  /**
   * Calculate and update canvas size based on canvas container element
   */
  updateCanvasSize() {
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
  setupEventHandlers() {
    if (!this.canvas) return;
    this.canvas.on("mouse:up", (event) => {
      try {
        const target = event.target;
        if (target && target instanceof TableGroup_default) {
          const table = target.tableContext;
          if (table && table.type === "Table") {
            if (this.selectionMode === "single") {
              this.selectedTableIds = this.selectedTableIds.includes(table.id) ? [] : [table.id];
            } else {
              const tableIndex = this.selectedTableIds.indexOf(table.id);
              if (tableIndex === -1) {
                this.selectedTableIds.push(table.id);
              } else {
                this.selectedTableIds.splice(tableIndex, 1);
              }
            }
            this.render();
            if (this.onTableClick) {
              this.onTableClick(table, [...this.selectedTableIds]);
            }
          }
        }
      } catch (error) {
        this.emitError(error instanceof Error ? error : new Error("Error handling table click."));
      }
    });
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
      tabItem.addEventListener("click", () => {
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
      const tableObjectOptions = {
        ...CENTER_ORIGIN,
        strokeWidth: FLOOR_DEFAULT.STROKE_WIDTH,
        rx: isEmojiType ? 0 : isRectangleShape ? FLOOR_DEFAULT.TABLE_RADIUS : Math.abs(width) / 2,
        ry: isEmojiType ? 0 : isRectangleShape ? FLOOR_DEFAULT.TABLE_RADIUS : Math.abs(height) / 2,
        strokeUniform: true,
        stroke: isShape ? "transparent" : isBlocked ? "#dddddd" : isSelected ? DEFAULT_TABLE_PALETTE.selectedStroke : DEFAULT_TABLE_PALETTE.stroke,
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
      const tableGroup = new TableGroup_default([tableObject], {
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
      if (!isEmojiType && !isBlocked && isPreferred && isTable) {
        labelGroup = this.createTableNumberLabel(table, isSelected);
      }
      return { tableGroup, labelGroup };
    } catch (error) {
      this.emitError(error instanceof Error ? error : new Error(`Failed to create table: ${table.id}.`));
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
    if (this.selectedRoom && this.selectedRoom.background_image_url) {
      this.backgroundElement.style.backgroundImage = `url(${this.selectedRoom.background_image_url})`;
    } else {
      this.backgroundElement.style.backgroundImage = "";
    }
  }
  /**
   * Render all tables on the canvas
   */
  render() {
    try {
      if (!this.canvas) return;
      this.canvas.clear();
      this.updateBackgroundImage();
      const tablesToRender = this.selectedRoom && this.selectedRoom.tables || [];
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
      this.emitError(error instanceof Error ? error : new Error("Failed to render floorplan."));
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
    const previousRoom = this.selectedRoom;
    this.selectedRoom = room;
    if ((!previousRoom || previousRoom.id !== room.id) && this.onRoomChange) {
      this.onRoomChange(room);
    }
    this.renderTabs();
    this.render();
  }
  /**
   * Destroy the renderer and clean up resources
   */
  destroy() {
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
