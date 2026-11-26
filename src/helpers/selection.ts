import { Table } from '../types';
import { getCenterPoint, isEmoji } from './tables';

export interface PointerStart {
  pointerType: string;
  eventType: string;
  button: number;
  touchCount: number;
  zoom: number;
  onTable: boolean;
  dragToSelect: boolean;
  multi: boolean;
  pinching: boolean;
}

/**
 * What a press starts: a box selection (primary mouse button, fit zoom, off any
 * table, opted in, multi-select, not pinching), a pan (zoomed in), or the
 * default tap-or-scroll behaviour.
 */
export const classifyPointerStart = ({
  pointerType,
  eventType,
  button,
  touchCount,
  zoom,
  onTable,
  dragToSelect,
  multi,
  pinching,
}: PointerStart): 'box' | 'pan' | 'default' => {
  const isMouse = pointerType === 'mouse' && !eventType.startsWith('touch');
  if (
    dragToSelect &&
    multi &&
    isMouse &&
    button === 0 &&
    touchCount <= 1 &&
    zoom === 1 &&
    !onTable &&
    !pinching
  ) {
    return 'box';
  }
  return zoom > 1 ? 'pan' : 'default';
};

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** A rect with non-negative width/height, whichever way it was dragged. */
export const normalizeRect = ({ left, top, width, height }: Rect): Rect => ({
  left: width < 0 ? left + width : left,
  top: height < 0 ? top + height : top,
  width: Math.abs(width),
  height: Math.abs(height),
});

/**
 * Ids of bookable tables whose centre lies inside `rect` (canvas units at fit
 * zoom). Blocked tables, shapes and emojis are never hit.
 */
export const tablesInRect = (
  tables: Table[],
  rect: Rect,
  canvasSize: number,
  {
    blockedIds,
    emojiList,
  }: { blockedIds: string[]; emojiList: readonly string[] }
): string[] => {
  const box = normalizeRect(rect);
  return tables
    .filter(
      (table) =>
        table.type === 'Table' &&
        !blockedIds.includes(table.id) &&
        !isEmoji(table, emojiList)
    )
    .filter((table) => {
      const [x, y] = getCenterPoint(table, canvasSize);
      return (
        x >= box.left &&
        x <= box.left + box.width &&
        y >= box.top &&
        y <= box.top + box.height
      );
    })
    .map((table) => table.id);
};

/** Current picks plus unseen hits, in order, up to the cap. */
export const mergeSelection = (
  current: string[],
  hits: string[],
  maxSelectable: number | null
): string[] => {
  const merged = [...current];
  for (const id of hits) {
    if (maxSelectable !== null && merged.length >= maxSelectable) break;
    if (!merged.includes(id)) merged.push(id);
  }
  return merged;
};

/** Whether two id lists hold the same ids, in any order. */
export const sameIds = (a: string[], b: string[]): boolean =>
  a.length === b.length && a.every((id) => b.includes(id));

/**
 * Map a canvas-unit rect onto the rendered canvas in CSS pixels, relative to
 * the overlay mount (handles CSS scaling and a canvas offset in its host).
 */
export const toCssRect = (
  rect: Rect,
  {
    canvasWidth,
    canvasHeight,
    cssWidth,
    cssHeight,
    offsetLeft,
    offsetTop,
  }: {
    canvasWidth: number;
    canvasHeight: number;
    cssWidth: number;
    cssHeight: number;
    offsetLeft: number;
    offsetTop: number;
  }
): Rect => {
  const box = normalizeRect(rect);
  const scaleX = canvasWidth ? cssWidth / canvasWidth : 1;
  const scaleY = canvasHeight ? cssHeight / canvasHeight : 1;
  return {
    left: offsetLeft + box.left * scaleX,
    top: offsetTop + box.top * scaleY,
    width: box.width * scaleX,
    height: box.height * scaleY,
  };
};

/** Whether two id → value records hold the same entries (array values compared in order). */
export const sameRecord = (
  a: Record<string, string | string[]>,
  b: Record<string, string | string[]>
): boolean => {
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  return keys.every((key) => {
    const left = a[key];
    const right = b[key];
    if (Array.isArray(left) && Array.isArray(right)) {
      return (
        left.length === right.length &&
        left.every((value, index) => value === right[index])
      );
    }
    return left === right;
  });
};
