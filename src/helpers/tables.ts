import { Table, TableDimensions } from '../types';
import { SCALE } from '../config';

/**
 * Parse the size string and calculate pixel dimensions
 * @param table - The table object
 * @param viewSideLength - The length of the canvas side in pixels
 * @returns Tuple of [width, height] in pixels
 */
export const getSize = (
  table: Table,
  viewSideLength: number
): [number, number] => {
  const size = table.size || '6x6';
  const [w, h] = size.split('x').map(Number);
  return [
    Math.floor((w * viewSideLength) / SCALE),
    Math.floor((h * viewSideLength) / SCALE),
  ];
};

/**
 * Calculate the center point of a table on the canvas
 * @param table - The table object
 * @param viewSideLength - The length of the canvas side in pixels
 * @returns Tuple of [x, y] center coordinates
 */
export const getCenterPoint = (
  table: Table,
  viewSideLength: number
): [number, number] => {
  return [
    Math.floor(table.x * viewSideLength),
    Math.floor(table.y * viewSideLength),
  ];
};

/**
 * Calculate the dimensions of a table for rendering on canvas
 * @param table - The table object
 * @param viewSideLength - The length of the canvas side in pixels
 * @returns Object containing size, centerPoint, width, height, left, and top
 */
export const getDimensionsV2 = (
  table: Table,
  viewSideLength: number
): TableDimensions => {
  const size = getSize(table, viewSideLength);
  const centerPoint = getCenterPoint(table, viewSideLength);

  return {
    size,
    centerPoint,
    height: size[1],
    width: size[0],
    left: centerPoint[0],
    top: centerPoint[1],
  };
};

/**
 * Filter tables by room ID and sort by type
 * @param tables - Array of all tables
 * @param roomId - ID of the room to filter by
 * @returns Filtered and sorted array of tables
 */
export const getTablesByRoomId = (tables: Table[], roomId: string): Table[] => {
  return tables
    .filter((table) => table.room_id === roomId)
    .sort((a, b) => {
      if (a && a.type && b && b.type) {
        return a.type.localeCompare(b.type);
      }
      return 0;
    });
};

/**
 * Get the render priority of a table type
 * Shapes render first (1), then Emojis (2), then Tables (3)
 * @param table - The table object
 * @param emojiList - List of emoji characters
 * @returns Priority number (lower = renders first/behind)
 */
export const getTableTypePriority = (
  table: Table,
  emojiList: readonly string[]
): number => {
  if (table.type === 'Shape') {
    return isEmoji(table, emojiList) ? 2 : 1;
  }
  return 3; // Tables render on top
};

/**
 * Check if a table is an emoji type
 * @param table - The table object
 * @param emojiList - List of emoji characters
 * @returns True if the table is an emoji
 */
export const isEmoji = (
  table: Table,
  emojiList: readonly string[]
): boolean => {
  return table && table.type === 'Shape' && emojiList.includes(table.number);
};

/**
 * Sort tables by render priority (shapes first, then emojis, then tables),
 * with selected tables above other tables so overlapping objects cannot hide them.
 * @param tables - Array of tables to sort
 * @param emojiList - List of emoji characters
 * @param selectedTableIds - IDs of tables that must render on top
 * @returns Sorted array of tables
 */
export const sortTablesByRenderOrder = (
  tables: Table[],
  emojiList: readonly string[],
  selectedTableIds: readonly string[] = []
): Table[] => {
  const selectedIds = new Set(selectedTableIds);

  return [...tables].sort((a, b) => {
    const priorityA = getTableTypePriority(a, emojiList);
    const priorityB = getTableTypePriority(b, emojiList);
    const priorityDifference = priorityA - priorityB;

    if (priorityDifference !== 0) return priorityDifference;

    return Number(selectedIds.has(a.id)) - Number(selectedIds.has(b.id));
  });
};
