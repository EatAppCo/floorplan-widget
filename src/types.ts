/**
 * Shape type for tables
 */
export type TableShape = 'rectangle' | 'circle' | 'square';

/**
 * Type of object on the floorplan
 */
export type TableType = 'Table' | 'Shape';

/**
 * Represents a table or shape on the floorplan
 */
export interface Table {
  id: string;
  x: number;
  y: number;
  rotation?: number;
  number: string;
  max_covers: number;
  min_covers: number;
  room_id?: string;
  shape?: TableShape;
  size?: string;
  color?: string | null;
  type?: TableType;
}

/**
 * Represents a room containing tables
 */
export interface Room {
  id: string;
  name: string;
  background_image_url: string | null;
  background_image_sid: string | null;
  updated_at?: string;
  table_ids: string[];
  tables: Table[];
}

/**
 * Callback function when a table is clicked
 * @param clickedTable - The table that was just clicked
 * @param selectedTableIds - Array of currently selected table IDs
 */
export type OnTableClickCallback = (
  clickedTable: Table,
  selectedTableIds: string[]
) => void;

/**
 * Called once after a drag-to-select box adds tables, with every selected id
 */
export type OnSelectionChangeCallback = (selectedTableIds: string[]) => void;

/**
 * Callback function when a room is changed
 */
export type OnRoomChangeCallback = (room: Room) => void;

/**
 * Callback function when an error occurs
 */
export type OnErrorCallback = (error: Error) => void;

/**
 * Options for initializing the FloorplanRenderer
 */
export interface FloorplanRendererOptions {
  containerElement?: HTMLElement | null;
  rooms: Room[];
  blockedTableIds?: string[];
  preferredTableIds?: string[];
  /** Tables that incur an up-front payment — rendered with a `$` badge */
  paidTableIds?: string[];
  /** Cap on how many tables can be selected at once in multi mode (omit = unbounded) */
  maxSelectable?: number;
  /** Required party size; tapping a table smaller than this auto-extends to the nearest linked group */
  covers?: number;
  /**
   * Engine-blessed linked combos (arrays of table ids) eligible for auto-extend. The host MUST pre-filter
   * these to combos that are fully renderable in one room, unblocked, and within `maxSelectable`. The renderer
   * also guards this at selection time, but it only ever selects combos you pass — it never assembles its own.
   */
  tableGroups?: string[][];
  /** Show each room's background image (default true) */
  showBackgroundImage?: boolean;
  /** Show emoji decor shapes (default true); false filters them out */
  showEmojis?: boolean;
  /** Room to open on first render (defaults to the first room) */
  initialRoomId?: string;
  /**
   * Tooltip shown on the tab of a room that has no selectable table at the chosen time. Such tabs are
   * rendered disabled (greyed, unclickable). Omit to leave disabled tabs without a tooltip.
   */
  roomUnavailableHint?: string;
  selectionMode?: 'single' | 'multi';
  /**
   * What a table shows: `'badge'` (default) is the number badge under preferred tables;
   * `'inside'` draws the number and covers inside every table, falling back to the badge
   * when the table is too small for the text.
   */
  tableContent?: 'badge' | 'inside';
  /** Selected tables: `'tint'` (default, light green) or `'solid'` (green with white text) */
  selectedAppearance?: 'tint' | 'solid';
  /** Table id → ring colour (e.g. a section). Rings are drawn behind tables; none by default. */
  tableRings?: Record<string, string>;
  /** Show the room tabs above the plan (default true); hosts with their own room navigation pass false */
  showRoomTabs?: boolean;
  /** Table id → labels drawn as pills under the table (max 3 + "+N"); none by default. */
  tableLabels?: Record<string, string[]>;
  /** Mouse-drag on empty canvas (fit zoom, multi mode) selects every table in the box; default false */
  dragToSelect?: boolean;
  /** Fired once per completed drag-to-select box (taps keep firing onTableClick only) */
  onSelectionChange?: OnSelectionChangeCallback;
  initialSelectedTableIds?: string[];
  onTableClick?: OnTableClickCallback;
  onRoomChange?: OnRoomChangeCallback;
  onError?: OnErrorCallback;
}

/**
 * Calculated table dimensions
 */
export interface TableDimensions {
  width: number;
  height: number;
  left: number;
  top: number;
  size: [number, number];
  centerPoint: [number, number];
}
