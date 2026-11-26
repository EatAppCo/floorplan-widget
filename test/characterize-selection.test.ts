import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildRenderer, room, table, tableGroupFor } from './support/renderer';
import type { Table } from '../src/types';

// Characterization: tap selection exactly as the booking widget gets it today.

function tapper(options: Parameters<typeof buildRenderer>[0]) {
  const trace: string[] = [];
  const clicks: Array<{ table: Table; ids: string[] }> = [];
  const { renderer } = buildRenderer({
    ...options,
    onTableClick: (t: Table, ids: string[]) => {
      trace.push('onTableClick');
      clicks.push({ table: t, ids });
    },
  });
  renderer.render = () => trace.push('render');
  const tap = (t: Table) =>
    renderer.handleTableSelect({ target: tableGroupFor(t) });
  return { renderer, trace, clicks, tap };
}

const a = table('a', { x: 0.1, y: 0.1 });
const b = table('b', { x: 0.2, y: 0.1 });
const c = table('c', { x: 0.3, y: 0.1 });

test('single mode: tap selects, tap again clears, another tap replaces', () => {
  const { renderer, tap } = tapper({
    rooms: [room('r', [a, b])],
    selectionMode: 'single',
  });
  tap(a);
  assert.deepEqual(renderer.selectedTableIds, ['a']);
  tap(a);
  assert.deepEqual(renderer.selectedTableIds, []);
  tap(a);
  tap(b);
  assert.deepEqual(renderer.selectedTableIds, ['b']);
});

test('multi mode without covers toggles each table', () => {
  const { renderer, tap } = tapper({ rooms: [room('r', [a, b])] });
  tap(a);
  tap(b);
  assert.deepEqual(renderer.selectedTableIds, ['a', 'b']);
  tap(a);
  assert.deepEqual(renderer.selectedTableIds, ['b']);
});

test('a tap at the cap keeps the ids but still renders and calls back', () => {
  const { renderer, tap, trace, clicks } = tapper({
    rooms: [room('r', [a, b])],
    maxSelectable: 1,
  });
  tap(a);
  trace.length = 0;
  tap(b);
  assert.deepEqual(renderer.selectedTableIds, ['a']);
  assert.deepEqual(trace, ['render', 'onTableClick']);
  assert.deepEqual(clicks.at(-1)!.ids, ['a']);
});

test('render runs before the callback, which receives a copy', () => {
  const { renderer, tap, trace, clicks } = tapper({ rooms: [room('r', [a])] });
  tap(a);
  assert.deepEqual(trace, ['render', 'onTableClick']);
  clicks[0].ids.push('mutated');
  assert.deepEqual(renderer.selectedTableIds, ['a']);
});

test('covers too large for a table auto-extends to the nearest eligible group', () => {
  const small = table('s', { x: 0.5, y: 0.5, max_covers: 2 });
  const near = table('n', { x: 0.52, y: 0.5 });
  const far = table('f', { x: 0.9, y: 0.9 });
  const { renderer, tap } = tapper({
    rooms: [room('r', [small, near, far])],
    covers: 4,
    tableGroups: [
      ['s', 'f'],
      ['s', 'n'],
    ],
  });
  tap(small);
  assert.deepEqual(renderer.selectedTableIds, ['s', 'n']);
});

test('ties on distance prefer fewer tables, then ids', () => {
  const small = table('s', { x: 0.5, y: 0.5, max_covers: 2 });
  const p = table('p', { x: 0.6, y: 0.5 });
  const q = table('q', { x: 0.5, y: 0.6 });
  const { renderer, tap } = tapper({
    rooms: [room('r', [small, p, q])],
    covers: 4,
    tableGroups: [
      ['s', 'q'],
      ['s', 'p', 'q'],
      ['s', 'p'],
    ],
  });
  tap(small);
  assert.deepEqual(renderer.selectedTableIds, ['s', 'p']);
});

test('groups with a blocked or other-room member are skipped', () => {
  const small = table('s', { max_covers: 2 });
  const blocked = table('x');
  const elsewhere = table('e');
  const { renderer, tap, clicks } = tapper({
    rooms: [room('r', [small, blocked]), room('other', [elsewhere])],
    covers: 4,
    blockedTableIds: ['x'],
    tableGroups: [
      ['s', 'x'],
      ['s', 'e'],
    ],
  });
  tap(small);
  assert.deepEqual(renderer.selectedTableIds, []);
  assert.equal(clicks.length, 1);
});

test('a tap on a member of the selected exact group clears the whole group', () => {
  const { renderer, tap } = tapper({
    rooms: [room('r', [a, b, c])],
    tableGroups: [
      ['a', 'b'],
      ['a', 'b', 'c'],
    ],
  });
  renderer.selectedTableIds = ['a', 'b', 'c'];
  tap(b);
  assert.deepEqual(renderer.selectedTableIds, []);

  renderer.selectedTableIds = ['a', 'b'];
  tap(a);
  assert.deepEqual(renderer.selectedTableIds, []);
});

test('non-table targets do nothing', () => {
  const { renderer, trace } = tapper({ rooms: [room('r', [a])] });
  renderer.handleTableSelect({ target: { not: 'a group' } });
  renderer.handleTableSelect({
    target: tableGroupFor(table('shape', { type: 'Shape' })),
  });
  assert.deepEqual(trace, []);
  assert.deepEqual(renderer.selectedTableIds, []);
});
