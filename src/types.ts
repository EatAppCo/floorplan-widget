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
