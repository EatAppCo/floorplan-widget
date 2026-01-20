/**
 * @eat/floorplan-core
 *
 * Framework-agnostic floorplan renderer using Fabric.js
 *
 * @example
 * ```typescript
 * import { FloorplanRenderer } from '@eat/floorplan-core';
 *
 * const floorplan = new FloorplanRenderer({
 *   container: document.getElementById('floorplan'),
 *   tables: [...],
 *   room: { ... },
 *   onTableClick: (table) => console.log('Clicked:', table)
 * });
 * ```
 */

// Import styles
import './FloorplanRenderer.css';

// Main renderer class
export { FloorplanRenderer } from './FloorplanRenderer';

// Types
export type {
  Table,
  TableShape,
  TableType,
  Room,
  FloorplanRendererOptions,
  OnTableClickCallback,
  OnRoomChangeCallback,
  OnErrorCallback,
  TableDimensions,
} from './types';

// Configuration
export {
  FLOOR_DEFAULT,
  floorEmojiList,
  shapeColors,
  palette,
  DEFAULT_TABLE_PALETTE,
  SCALE,
  INVISIBLE_CHARACTER,
} from './config';

// Helpers
export {
  getDimensionsV2,
  getTablesByRoomId,
  getTableTypePriority,
  isEmoji,
  sortTablesByRenderOrder,
} from './helpers/tables';

// Custom Fabric objects
export { default as TableGroup } from './objects/TableGroup';
export { default as LabelGroup } from './objects/LabelGroup';
export type { TableGroupOptions } from './objects/TableGroup';
export type { LabelGroupOptions, LabelPosition } from './objects/LabelGroup';
