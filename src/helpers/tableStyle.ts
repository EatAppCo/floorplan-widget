import { FLOOR_DEFAULT } from '../config/defaults';
import {
  DEFAULT_TABLE_PALETTE,
  palette,
  SELECTED_TABLE_SOLID_FILL,
  SELECTED_TABLE_SOLID_TEXT,
} from '../config/palette';
import { Table, TableShape } from '../types';

export type TableContent = 'badge' | 'inside';
export type SelectedAppearance = 'tint' | 'solid';

export interface TableShapeStyleInput {
  isShape: boolean;
  isEmoji: boolean;
  isBlocked: boolean;
  isSelected: boolean;
  color?: string | null;
  selectedAppearance: SelectedAppearance;
}

export interface TableShapeStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
}

/**
 * Fill, stroke and stroke width for a table or shape. With the default `'tint'`
 * selection this is exactly the renderer's original styling.
 */
export const tableShapeStyle = ({
  isShape,
  isEmoji,
  isBlocked,
  isSelected,
  color,
  selectedAppearance,
}: TableShapeStyleInput): TableShapeStyle => {
  const solid = isSelected && selectedAppearance === 'solid';

  const stroke = isShape
    ? 'transparent'
    : isBlocked
      ? 'transparent'
      : isSelected
        ? DEFAULT_TABLE_PALETTE.selectedStroke
        : DEFAULT_TABLE_PALETTE.stroke;

  const fill = isEmoji
    ? 'transparent'
    : isBlocked
      ? DEFAULT_TABLE_PALETTE.blocked
      : isSelected
        ? solid
          ? SELECTED_TABLE_SOLID_FILL
          : DEFAULT_TABLE_PALETTE.selectedFill
        : isShape
          ? color || 'transparent'
          : DEFAULT_TABLE_PALETTE.fill;

  return {
    fill,
    stroke,
    strokeWidth: isSelected
      ? FLOOR_DEFAULT.STROKE_SELECTED_WIDTH
      : FLOOR_DEFAULT.STROKE_WIDTH,
  };
};

export interface InsideTextLine {
  text: string;
  fontSize: number;
  fill: string;
}

export type InsideText =
  | { mode: 'inside'; lines: InsideTextLine[] }
  | { mode: 'badge' };

export interface InsideTextInput {
  width: number;
  height: number;
  shape?: TableShape;
  isSelected: boolean;
  selectedAppearance: SelectedAppearance;
}

const MAX_TEXT = 13;
const MIN_TWO_LINE = 9;
const MIN_TEXT = 7;
const CHAR_WIDTH = 0.6;
const LINE_HEIGHT = 1.15;

/** The box text may occupy: the inscribed area for an ellipse, most of a rect. */
export const tableInterior = (
  width: number,
  height: number,
  shape?: TableShape
): { width: number; height: number } => {
  const ratio = shape === 'circle' ? 0.7 : 0.8;
  return { width: Math.abs(width) * ratio, height: Math.abs(height) * ratio };
};

const textWidth = (text: string, fontSize: number) =>
  Array.from(text).length * CHAR_WIDTH * fontSize;

/**
 * Number (and covers when they fit) to draw inside a table, sized so it never
 * leaves the shape. Falls back to `{ mode: 'badge' }` when nothing fits at the
 * minimum size; the renderer then shows the classic number badge instead.
 */
export const tableInsideText = (
  table: Table,
  { width, height, shape, isSelected, selectedAppearance }: InsideTextInput
): InsideText => {
  const interior = tableInterior(width, height, shape);
  const solid = isSelected && selectedAppearance === 'solid';
  const numberFill = solid ? SELECTED_TABLE_SOLID_TEXT : palette.dark100;
  const coversFill = solid ? SELECTED_TABLE_SOLID_TEXT : palette.gray200;
  const number = table.number;
  const covers = `${table.min_covers}–${table.max_covers}`;
  const base = Math.min(MAX_TEXT, Math.round(Math.min(width, height) * 0.28));

  if (base >= MIN_TWO_LINE) {
    const coversSize = Math.max(MIN_TEXT, Math.round(0.8 * base));
    const fits =
      textWidth(number, base) <= interior.width &&
      textWidth(covers, coversSize) <= interior.width &&
      LINE_HEIGHT * (base + coversSize) <= interior.height;
    if (fits) {
      return {
        mode: 'inside',
        lines: [
          { text: number, fontSize: base, fill: numberFill },
          { text: covers, fontSize: coversSize, fill: coversFill },
        ],
      };
    }
  }

  for (let size = Math.min(base, MAX_TEXT); size >= MIN_TEXT; size -= 1) {
    if (
      textWidth(number, size) <= interior.width &&
      LINE_HEIGHT * size <= interior.height
    ) {
      return {
        mode: 'inside',
        lines: [{ text: number, fontSize: size, fill: numberFill }],
      };
    }
  }

  return { mode: 'badge' };
};

/**
 * Whether the table gets the classic number badge. Under `'badge'` this is the
 * original rule (preferred, unless the `$` badge takes the slot); under
 * `'inside'` only tables whose text could not fit inside fall back to it.
 */
export const showNumberBadge = ({
  tableContent,
  insideMode,
  isPreferred,
  isPaid,
}: {
  tableContent: TableContent;
  insideMode: InsideText['mode'];
  isPreferred: boolean;
  isPaid: boolean;
}): boolean => {
  if (isPaid) return false;
  if (tableContent === 'badge') return isPreferred;
  return insideMode === 'badge';
};
