import assert from 'node:assert/strict';

import { FloorplanRenderer } from '../src/FloorplanRenderer';

const renderer = Object.create(FloorplanRenderer.prototype) as any;
const labelPosition: { top?: number; left?: number } = {};
const labelGroup = {
  _positionOnTable: 'corner',
  set(position: { top: number; left: number }) {
    Object.assign(labelPosition, position);
  },
};
const tableGroup = {
  tableContext: { type: 'Table' },
  getBoundingRect(absolute?: boolean, calculate?: boolean) {
    assert.equal(absolute, true);
    assert.equal(calculate, true);
    return { top: 20, left: 10, width: 30, height: 40 };
  },
};

renderer.positionLabel(tableGroup, labelGroup);

assert.deepEqual(labelPosition, { top: 60, left: 40 });

// Below-table labels: top-anchored under the table, centred on it.
const belowPosition: { top?: number; left?: number } = {};
renderer.positionLabel(tableGroup, {
  _positionOnTable: 'below',
  set(position: { top: number; left: number }) {
    Object.assign(belowPosition, position);
  },
});
assert.deepEqual(belowPosition, { top: 64, left: 25 });

// ...and under the number badge when the table has one.
const underBadge: { top?: number; left?: number } = {};
renderer.positionLabel(
  tableGroup,
  {
    _positionOnTable: 'below',
    set(position: { top: number; left: number }) {
      Object.assign(underBadge, position);
    },
  },
  {
    getBoundingRect: () => ({ top: 55, left: 15, width: 20, height: 14 }),
  }
);
assert.deepEqual(underBadge, { top: 73, left: 25 });
