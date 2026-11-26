import { FLOOR_DEFAULT } from '../config/defaults';
import { floorEmojiList } from '../config/emojis';
import { Table, TableShape } from '../types';
import { isEmoji } from './tables';

/** Ring stroke width, and how far its outer edge sits outside the table edge. */
export const RING_STROKE = 8;
export const RING_OUTER = 6;
/** Gap between a table (or its badge) and the labels stacked below it. */
export const LABEL_GAP = RING_OUTER;

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

/** Vertical space kept between two label stacks, the same as between pills. */
export const LABEL_STACK_GAP = 2;

export interface LabelStackBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Tops for below-table label stacks so that neighbouring stacks never cover
 * each other. Stacks are placed top to bottom (then left to right); each keeps
 * its own top unless it would cover a stack already placed, in which case it
 * moves down just below it. Returns the tops in the input order.
 */
export const separateLabelStacks = (boxes: LabelStackBox[]): number[] => {
  const order = boxes
    .map((box, index) => ({ box, index }))
    .sort((a, b) => a.box.top - b.box.top || a.box.left - b.box.left);
  const placed: LabelStackBox[] = [];
  const tops: number[] = new Array(boxes.length);

  order.forEach(({ box, index }) => {
    let top = box.top;
    let blocker: LabelStackBox | undefined;
    do {
      blocker = placed.find(
        (other) =>
          box.left < other.left + other.width &&
          other.left < box.left + box.width &&
          top < other.top + other.height + LABEL_STACK_GAP &&
          other.top < top + box.height + LABEL_STACK_GAP
      );
      if (blocker) top = blocker.top + blocker.height + LABEL_STACK_GAP;
    } while (blocker);

    placed.push({ ...box, top });
    tops[index] = top;
  });

  return tops;
};

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

/** A translucent version of a ring colour, for its soft glow. */
export const ringGlow = (color: string, alpha = 0.45): string => {
  const hex = color.replace(/^#/, '');
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((c) => c + c)
          .join('')
      : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return 'rgba(0, 0, 0, 0)';
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
