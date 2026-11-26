import { FLOOR_DEFAULT } from '../config/defaults';
import { floorEmojiList } from '../config/emojis';
import { Table, TableShape } from '../types';
import { isEmoji } from './tables';

/** Ring stroke width, and how far its outer edge sits outside the table edge. */
export const RING_STROKE = 3;
export const RING_OUTER = 4;
/** Gap between a table (or its badge) and the labels stacked below it. */
export const LABEL_GAP = 4;

/**
 * Labels to draw under a table: trimmed, blank-free, de-duplicated, each cut to
 * `maxChars` with an ellipsis, at most `maxLabels`, then `+N` for the rest.
 */
export const formatTableLabels = (
  labels: string[],
  {
    maxLabels = 3,
    maxChars = 16,
  }: { maxLabels?: number; maxChars?: number } = {}
): string[] => {
  const unique: string[] = [];
  labels.forEach((label) => {
    const trimmed = (label || '').trim();
    if (trimmed && !unique.includes(trimmed)) unique.push(trimmed);
  });

  const shown = unique.slice(0, maxLabels).map((label) =>
    Array.from(label).length > maxChars
      ? `${Array.from(label)
          .slice(0, maxChars - 1)
          .join('')}…`
      : label
  );
  const hidden = unique.length - shown.length;
  return hidden > 0 ? [...shown, `+${hidden}`] : shown;
};

export type RingGeometry =
  | { kind: 'rect'; width: number; height: number; rx: number }
  | { kind: 'ellipse'; rx: number; ry: number };

/**
 * Ring outline around a table: same shape, with its stroke's outer edge
 * `RING_OUTER` px outside the table (so the centreline is RING_OUTER - stroke/2).
 */
export const ringGeometry = ({
  shape,
  width,
  height,
}: {
  shape?: TableShape;
  width: number;
  height: number;
}): RingGeometry => {
  const centreline = RING_OUTER - RING_STROKE / 2;
  if (shape === 'circle') {
    return {
      kind: 'ellipse',
      rx: Math.abs(width) / 2 + centreline,
      ry: Math.abs(height) / 2 + centreline,
    };
  }
  return {
    kind: 'rect',
    width: Math.abs(width) + centreline * 2,
    height: Math.abs(height) + centreline * 2,
    rx: FLOOR_DEFAULT.TABLE_RADIUS + centreline,
  };
};

/** The ring colour for a table, or null when it gets no ring. */
export const ringColorFor = (
  table: Table,
  rings: Record<string, string>,
  isBlocked: boolean
): string | null => {
  if (isBlocked || table.type !== 'Table') return null;
  if (isEmoji(table, floorEmojiList)) return null;
  return rings[table.id] || null;
};

/** Top of the label stack: under the table, or under its badge when lower. */
export const belowLabelTop = ({
  tableBottom,
  badgeBottom,
}: {
  tableBottom: number;
  badgeBottom?: number;
}): number => Math.max(tableBottom, badgeBottom ?? tableBottom) + LABEL_GAP;

/**
 * Split an already filtered and sorted list into décor (shapes and emojis,
 * drawn first) and everything else (tables, plus untyped entries, as before).
 */
export const renderLayers = (
  sorted: Table[]
): { decor: Table[]; tables: Table[] } => ({
  decor: sorted.filter((table) => table.type === 'Shape'),
  tables: sorted.filter((table) => table.type !== 'Shape'),
});
