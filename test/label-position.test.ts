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
