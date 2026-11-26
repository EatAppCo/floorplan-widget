import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  belowLabelTop,
  formatTableLabels,
  renderLayers,
  ringColorFor,
  ringGeometry,
  ringGlow,
} from '../src/helpers/decorations';
import { buildRenderer, room, stubCanvas, table } from './support/renderer';
import type { Table } from '../src/types';

test('formatTableLabels trims, dedupes, keeps three and counts the rest', () => {
  assert.deepEqual(
    formatTableLabels([
      ' Garden terrace ',
      'Outdoor',
      'Outdoor',
      'Accessible',
      'Quiet',
    ]),
    ['Garden terrace', 'Outdoor', 'Accessible', '+1']
  );
});

test('the design example keeps all three labels', () => {
  assert.deepEqual(
    formatTableLabels(['Garden terrace', 'Outdoor', 'Accessible']),
    ['Garden terrace', 'Outdoor', 'Accessible']
  );
});

test('long labels are cut to 16 characters with an ellipsis', () => {
  const [label] = formatTableLabels(['Sunset Dinner (Terrace - Open Smoking)']);
  assert.equal(label.length, 16);
  assert.ok(label.endsWith('…'));
});

test('no labels stay empty', () => {
  assert.deepEqual(formatTableLabels([]), []);
  assert.deepEqual(formatTableLabels(['  ', '']), []);
});

test('ring geometry puts a 6px band outside the table', () => {
  assert.deepEqual(
    ringGeometry({ shape: 'rectangle', width: 40, height: 20 }),
    {
      kind: 'rect',
      width: 44,
      height: 24,
      rx: 6,
    }
  );
  assert.deepEqual(ringGeometry({ shape: 'circle', width: 30, height: 30 }), {
    kind: 'ellipse',
    rx: 17,
    ry: 17,
  });
});

test('ringColorFor only rings bookable, unblocked tables with a colour', () => {
  const rings = { t: '#F5B94A', s: '#7DB9F2' };
  assert.equal(ringColorFor(table('t'), rings, false), '#F5B94A');
  assert.equal(ringColorFor(table('t'), rings, true), null);
  assert.equal(ringColorFor(table('s', { type: 'Shape' }), rings, false), null);
  assert.equal(ringColorFor(table('none'), rings, false), null);
});

test('below labels sit under the table, or under its badge', () => {
  assert.equal(belowLabelTop({ tableBottom: 100 }), 106);
  assert.equal(belowLabelTop({ tableBottom: 100, badgeBottom: 110 }), 116);
  assert.equal(belowLabelTop({ tableBottom: 100, badgeBottom: 90 }), 106);
});

test('renderLayers splits décor from tables and keeps the given order', () => {
  const list: Table[] = [
    table('wall', { type: 'Shape', number: '' }),
    table('emoji', { type: 'Shape', number: '🌳' }),
    table('a'),
    table('untyped', { type: undefined }),
    table('selected'),
  ];
  const { decor, tables } = renderLayers(list);
  assert.deepEqual(
    decor.map((t) => t.id),
    ['wall', 'emoji']
  );
  assert.deepEqual(
    tables.map((t) => t.id),
    ['a', 'untyped', 'selected']
  );
});

function layeredRender(options: Parameters<typeof buildRenderer>[0]) {
  const tables = [
    table('t1'),
    table('emoji', { type: 'Shape', number: '🌳' }),
    table('t2'),
    table('wall', { type: 'Shape', number: '' }),
  ];
  const { renderer } = buildRenderer({
    rooms: [room('r', tables)],
    ...options,
  });
  const canvas = stubCanvas(renderer);
  renderer.createTableObject = (t: Table) => ({
    tableGroup: `group:${t.id}`,
    labelGroup: t.id === 't1' ? `badge:${t.id}` : null,
  });
  renderer.createRing = (t: Table) => `ring:${t.id}`;
  renderer.createTableLabels = (t: Table) =>
    renderer.tableLabels[t.id] ? `labels:${t.id}` : null;
  renderer.positionLabel = () => {};
  renderer.render();
  return canvas.added;
}

test('with rings and labels: décor, rings, tables + badges, then labels', () => {
  assert.deepEqual(
    layeredRender({
      tableRings: { t1: '#F5B94A', t2: '#7DB9F2' },
      tableLabels: { t1: ['Garden terrace'], t2: ['Outdoor'] },
    }),
    [
      'group:wall',
      'group:emoji',
      'ring:t1',
      'ring:t2',
      'group:t1',
      'badge:t1',
      'group:t2',
      'labels:t1',
      'labels:t2',
    ]
  );
});

test('without rings or labels the order is exactly today’s', () => {
  assert.deepEqual(layeredRender({}), [
    'group:wall',
    'group:emoji',
    'group:t1',
    'badge:t1',
    'group:t2',
  ]);
});

test('ringGlow turns a section hex into a translucent glow colour', () => {
  assert.equal(ringGlow('#F5B94A'), 'rgba(245, 185, 74, 0.45)');
  assert.equal(ringGlow('7db'), 'rgba(119, 221, 187, 0.45)');
  assert.equal(ringGlow('not-a-colour'), 'rgba(0, 0, 0, 0)');
});
