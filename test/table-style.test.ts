import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  showNumberBadge,
  tableInsideText,
  tableShapeStyle,
} from '../src/helpers/tableStyle';
import { table } from './support/renderer';

const plain = {
  isShape: false,
  isEmoji: false,
  isBlocked: false,
  isSelected: false,
  color: null,
  selectedAppearance: 'tint' as const,
};

test("defaults reproduce today's table style", () => {
  assert.deepEqual(tableShapeStyle(plain), {
    fill: '#FFFFFF',
    stroke: '#6F6F6F',
    strokeWidth: 1,
  });
  assert.deepEqual(tableShapeStyle({ ...plain, isSelected: true }), {
    fill: '#E5F4EB',
    stroke: '#128849',
    strokeWidth: 3,
  });
  assert.deepEqual(tableShapeStyle({ ...plain, isBlocked: true }), {
    fill: '#EAEAEA',
    stroke: 'transparent',
    strokeWidth: 1,
  });
  assert.deepEqual(
    tableShapeStyle({ ...plain, isShape: true, color: '#E1E8F8' }),
    { fill: '#E1E8F8', stroke: 'transparent', strokeWidth: 1 }
  );
  assert.equal(
    tableShapeStyle({ ...plain, isShape: true, isEmoji: true }).fill,
    'transparent'
  );
});

test('solid selection fills the table green', () => {
  assert.deepEqual(
    tableShapeStyle({
      ...plain,
      isSelected: true,
      selectedAppearance: 'solid',
    }),
    { fill: '#128849', stroke: '#128849', strokeWidth: 3 }
  );
});

const inside = (
  number: string,
  width: number,
  height: number,
  shape: 'square' | 'rectangle' | 'circle' = 'square',
  extra: { isSelected?: boolean; selectedAppearance?: 'tint' | 'solid' } = {}
) =>
  tableInsideText(table(number, { number, min_covers: 2, max_covers: 4 }), {
    width,
    height,
    shape,
    isSelected: false,
    selectedAppearance: 'tint',
    ...extra,
  });

test('a 40px square shows number and covers on two lines', () => {
  assert.deepEqual(inside('T1', 40, 40), {
    mode: 'inside',
    lines: [
      { text: 'T1', fontSize: 11, fill: '#34353A' },
      { text: '2–4', fontSize: 9, fill: '#999999' },
    ],
  });
});

test('solid selection turns the inside text white', () => {
  const result = inside('T1', 40, 40, 'square', {
    isSelected: true,
    selectedAppearance: 'solid',
  });
  assert.equal(result.mode, 'inside');
  if (result.mode === 'inside') {
    assert.deepEqual(
      result.lines.map((line) => line.fill),
      ['#FFFFFF', '#FFFFFF']
    );
  }
});

test('a 24px ellipse shows the number only, at 7px', () => {
  assert.deepEqual(inside('T1', 24, 24, 'circle'), {
    mode: 'inside',
    lines: [{ text: 'T1', fontSize: 7, fill: '#34353A' }],
  });
});

test('a 10px table falls back to the badge', () => {
  assert.deepEqual(inside('T1', 10, 10), { mode: 'badge' });
});

test('a wide identifier that cannot fit at 7px falls back to the badge', () => {
  assert.deepEqual(inside('TERRACE-12', 40, 40), { mode: 'badge' });
});

test('a short 60x30 table shows the number only, at 8px', () => {
  assert.deepEqual(inside('T12', 60, 30, 'rectangle'), {
    mode: 'inside',
    lines: [{ text: 'T12', fontSize: 8, fill: '#34353A' }],
  });
});

test('badge rule', () => {
  const badge = (
    tableContent: 'badge' | 'inside',
    insideMode: 'inside' | 'badge',
    isPreferred: boolean,
    isPaid: boolean
  ) => showNumberBadge({ tableContent, insideMode, isPreferred, isPaid });

  assert.equal(badge('badge', 'inside', true, false), true);
  assert.equal(badge('badge', 'inside', true, true), false);
  assert.equal(badge('badge', 'inside', false, false), false);
  assert.equal(badge('inside', 'inside', true, false), false);
  assert.equal(badge('inside', 'badge', false, false), true);
  assert.equal(badge('inside', 'badge', false, true), false);
});
