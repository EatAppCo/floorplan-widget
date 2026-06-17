/**
 * Default configuration values for the floorplan renderer
 */
export const FLOOR_DEFAULT = {
  BOUNDING_RECT_COLOR: '#fcbf49',
  SELECTION_BORDER_COLOR: '#42A4F5',
  SELECTION_CORNER_BORDER_COLOR: '#3C3C3C',
  SELECTION_CORNER_COLOR: '#E5F4EB',
  BG_COLOR: 'white',
  GRID_LINE_COLOR: '#e9e9e9',
  GRID_LINE_SPACING: 13,
  SELECTION_PADDING: 9,
  CANVAS_MIN_SIZE: 400,
  SHAPE_BG: '#E1E8F8',
  TABLE_MIN_COVERS: 1,
  TABLE_MAX_COVERS: 20,
  TABLE_SIZE: '6x6',
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
  CHAIR_BG: '#B7B7B7',
  CHAIR_BORDER_RADIUS: 3,
  STATUS_ICON_FONT_SIZE: 22,
  SHADOW: '0 5px 10px rgba(0,0,0,0.6)',
} as const;

/**
 * Invisible character for empty labels
 */
export const INVISIBLE_CHARACTER = '\u200E';

/**
 * Scale factor for table dimensions
 */
export const SCALE = 64;

/**
 * Discrete zoom levels stepped through by the zoom buttons (index 0 = fit)
 */
export const ZOOM_STEPS = [1, 1.5, 2, 2.5] as const;

/**
 * Pointer travel (px) past which a press counts as a drag, not a table tap
 */
export const DRAG_THRESHOLD = 5;

/**
 * Common properties for non-interactive Fabric objects
 */
export const DISABLED_OBJECT_PROPERTIES = {
  selectable: false,
  evented: false,
  hoverCursor: 'default',
};

/**
 * Center origin settings for Fabric objects
 */
export const CENTER_ORIGIN = {
  originX: 'center' as const,
  originY: 'center' as const,
};

/**
 * Default options for table groups
 */
export const DEFAULT_TABLE_GROUP_OPTIONS = {
  ...CENTER_ORIGIN,
  selectable: false,
  evented: true,
  hasControls: false,
  hasBorders: false,
  hoverCursor: 'pointer',
};

/**
 * Label configuration for different sizes
 */
export const LABEL_SIZE_CONFIG = {
  large: {
    LINE_HEIGHT: 20,
    TEXT_FONT_SIZE: 13,
    BORDER_RADIUS: 8,
  },
  small: {
    LINE_HEIGHT: 19,
    TEXT_FONT_SIZE: 14,
    BORDER_RADIUS: 6,
  },
  very_small: {
    LINE_HEIGHT: 14,
    TEXT_FONT_SIZE: 9,
    BORDER_RADIUS: 5,
  },
};
