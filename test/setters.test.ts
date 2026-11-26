import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildRenderer, room, stubCanvas, table } from './support/renderer';
import type { Table } from '../src/types';

function setup(options: Parameters<typeof buildRenderer>[0] = {}) {
  let clicks = 0;
  let selections = 0;
  const { renderer } = buildRenderer({
    rooms: [room('r', [table('a'), table('b'), table('blocked')])],
    blockedTableIds: ['blocked'],
    onTableClick: () => (clicks += 1),
    onSelectionChange: () => (selections += 1),
    ...options,
  });
  const canvas = stubCanvas(renderer, { zoom: 2 });
  canvas.viewportTransform = [2, 0, 0, 2, -10, -10];
  let renders = 0;
  let captures = 0;
  renderer.render = () => (renders += 1);
  renderer.captureMinimap = () => (captures += 1);
  return {
    renderer,
    canvas,
    counts: () => ({ renders, captures, clicks, selections }),
  };
}

test('setSelectedTableIds drops blocked ids, applies the cap and renders once', () => {
  const { renderer, counts } = setup({ maxSelectable: 1 });
  renderer.setSelectedTableIds(['blocked', 'a', 'b']);
  assert.deepEqual(renderer.getSelectedTableIds(), ['a']);
  assert.deepEqual(counts(), {
    renders: 1,
    captures: 0,
    clicks: 0,
    selections: 0,
  });
});

test('setSelectedTableIds ignores duplicate ids instead of keeping the old selection', () => {
  const { renderer } = setup();
  renderer.setSelectedTableIds(['a', 'b']);
  renderer.setSelectedTableIds(['a', 'a']);
  assert.deepEqual(renderer.getSelectedTableIds(), ['a']);
});

test('getSelectedTableIds returns a copy', () => {
  const { renderer } = setup();
  renderer.setSelectedTableIds(['a']);
  renderer.getSelectedTableIds().push('b');
  assert.deepEqual(renderer.getSelectedTableIds(), ['a']);
});

test('setTableRings and setTableLabels render once and never re-capture the minimap', () => {
  const { renderer, counts } = setup();
  renderer.setTableRings({ a: '#F5B94A' });
  renderer.setTableLabels({ a: ['Garden terrace'] });
  assert.deepEqual(renderer.tableRings, { a: '#F5B94A' });
  assert.deepEqual(renderer.tableLabels, { a: ['Garden terrace'] });
  assert.deepEqual(counts(), {
    renders: 2,
    captures: 0,
    clicks: 0,
    selections: 0,
  });
});

test('identical values do not re-render', () => {
  const { renderer, counts } = setup();
  renderer.setSelectedTableIds(['a', 'b']);
  renderer.setSelectedTableIds(['b', 'a']);
  renderer.setTableRings({ a: '#F5B94A' });
  renderer.setTableRings({ a: '#F5B94A' });
  renderer.setTableLabels({ a: ['x', 'y'] });
  renderer.setTableLabels({ a: ['x', 'y'] });
  assert.equal(counts().renders, 3);
});

test('setters are no-ops after destroy', () => {
  const { renderer, counts } = setup();
  renderer.canvas = null;
  renderer.setSelectedTableIds(['a']);
  renderer.setTableRings({ a: '#F5B94A' });
  renderer.setTableLabels({ a: ['x'] });
  assert.equal(counts().renders, 0);
  assert.deepEqual(renderer.getSelectedTableIds(), []);
});

test('the real render keeps the zoomed viewport across a setter', () => {
  const { renderer: r } = buildRenderer({ rooms: [room('r', [table('a')])] });
  const canvas = stubCanvas(r, { zoom: 2 });
  canvas.viewportTransform = [2, 0, 0, 2, -10, -10];
  // Worst case: clearing the canvas resets its viewport, as Fabric may.
  canvas.clear = function () {
    this.added = [];
    this.viewportTransform = [1, 0, 0, 1, 0, 0];
  };
  r.createTableObject = (t: Table) => ({
    tableGroup: `group:${t.id}`,
    labelGroup: null,
  });
  r.setTableRings({ a: '#F5B94A' });
  assert.deepEqual(canvas.viewportTransform, [2, 0, 0, 2, -10, -10]);
});
