import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildRenderer,
  FakeElement,
  installFakeDocument,
  room,
  stubCanvas,
  table,
} from './support/renderer';
import type { Table } from '../src/types';

// Characterization: how each table looks, which badge it gets, what is drawn in
// which order, the room tabs, and teardown — all with default options.

function styleOf(t: Table, options: Parameters<typeof buildRenderer>[0] = {}) {
  const { renderer } = buildRenderer({ rooms: [room('r', [t])], ...options });
  const { tableGroup, labelGroup } = renderer.createTableObject(t);
  const shape = tableGroup._objects[0];
  return { tableGroup, labelGroup, shape };
}

test('a plain square table', () => {
  const { tableGroup, labelGroup, shape } = styleOf(table('t'));
  assert.equal(shape.type, 'rect');
  assert.equal(shape.fill, '#FFFFFF');
  assert.equal(shape.stroke, '#6F6F6F');
  assert.equal(shape.strokeWidth, 1);
  assert.equal(shape.rx, 4);
  assert.equal(shape.ry, 4);
  assert.equal(tableGroup.left, 320);
  assert.equal(tableGroup.top, 320);
  assert.equal(tableGroup.angle, 0);
  assert.equal(tableGroup.evented, true);
  assert.equal(tableGroup.hoverCursor, 'pointer');
  assert.equal(labelGroup, null);
});

test('a plain circle table is an ellipse', () => {
  const { shape, labelGroup } = styleOf(table('t', { shape: 'circle' }));
  assert.equal(shape.type, 'ellipse');
  assert.equal(shape.rx, 30);
  assert.equal(shape.ry, 30);
  assert.equal(shape.fill, '#FFFFFF');
  assert.equal(labelGroup, null);
});

test('a selected table is tinted with a thick green stroke', () => {
  const { shape } = styleOf(table('t'), { initialSelectedTableIds: ['t'] });
  assert.equal(shape.fill, '#E5F4EB');
  assert.equal(shape.stroke, '#128849');
  assert.equal(shape.strokeWidth, 3);
});

test('a blocked table is grey, unstroked and not interactive', () => {
  const { shape, tableGroup, labelGroup } = styleOf(table('t'), {
    blockedTableIds: ['t'],
  });
  assert.equal(shape.fill, '#EAEAEA');
  assert.equal(shape.stroke, 'transparent');
  assert.equal(tableGroup.evented, false);
  assert.equal(tableGroup.hoverCursor, 'default');
  assert.equal(labelGroup, null);
});

test('an unnamed coloured shape uses its colour and is not interactive', () => {
  const { shape, tableGroup } = styleOf(
    table('s', { type: 'Shape', number: '', color: '#E1E8F8' })
  );
  assert.equal(shape.fill, '#E1E8F8');
  assert.equal(shape.stroke, 'transparent');
  assert.equal(tableGroup._objects.length, 1);
  assert.equal(tableGroup.evented, false);
});

test('a rotated rectangle keeps its size and angle', () => {
  const { shape, tableGroup } = styleOf(
    table('t', { shape: 'rectangle', size: '3x6', rotation: 45 })
  );
  assert.equal(shape.width, 30);
  assert.equal(shape.height, 60);
  assert.equal(tableGroup.angle, 45);
});

test('badge decision: payment wins, then preferred, never when blocked', () => {
  const decide = (t: Table, options: Parameters<typeof buildRenderer>[0]) => {
    const { renderer } = buildRenderer({ rooms: [room('r', [t])], ...options });
    renderer.createTableNumberLabel = () => 'number-badge';
    renderer.createPaymentLabel = () => 'payment-badge';
    return renderer.createTableObject(t).labelGroup;
  };
  const t = table('t');
  assert.equal(
    decide(t, { paidTableIds: ['t'], preferredTableIds: ['t'] }),
    'payment-badge'
  );
  assert.equal(decide(t, { preferredTableIds: ['t'] }), 'number-badge');
  assert.equal(
    decide(t, { preferredTableIds: ['t'], blockedTableIds: ['t'] }),
    null
  );
  assert.equal(decide(t, {}), null);
});

function renderOrder(options: Parameters<typeof buildRenderer>[0] = {}) {
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
    labelGroup: t.id === 't1' ? `label:${t.id}` : null,
  });
  renderer.positionLabel = () => {};
  renderer.render();
  return canvas.added;
}

test('render draws shapes, then emojis, then tables, selected last', () => {
  assert.deepEqual(renderOrder({ initialSelectedTableIds: ['t1'] }), [
    'group:wall',
    'group:emoji',
    'group:t2',
    'group:t1',
    'label:t1',
  ]);
});

test('render drops emojis when showEmojis is false', () => {
  assert.deepEqual(renderOrder({ showEmojis: false }), [
    'group:wall',
    'group:t1',
    'label:t1',
    'group:t2',
  ]);
});

test('room tabs: one per room, active and disabled states', () => {
  const restore = installFakeDocument();
  try {
    const { renderer } = buildRenderer({
      rooms: [room('open', [table('a')]), room('closed', [table('b')])],
      blockedTableIds: ['b'],
      roomUnavailableHint: 'Nothing free',
    });
    renderer.containerElement = new FakeElement();
    renderer.renderTabs();

    const container = renderer.tabsContainerElement as FakeElement;
    assert.equal(container.className, 'floorplan-tabs-container');
    assert.equal(renderer.containerElement.children[0], container);
    const [open, closed] = container.children;
    assert.equal(open.textContent, 'open');
    assert.ok(open.classList.contains('floorplan-tab--active'));
    assert.equal(open.listeners.click.length, 1);
    assert.ok(closed.classList.contains('floorplan-tab--disabled'));
    assert.equal(closed.attributes['aria-disabled'], 'true');
    assert.equal(closed.title, 'Nothing free');
    assert.equal(closed.listeners.click, undefined);
  } finally {
    restore();
  }
});

test('destroy tears everything down once and is safe to repeat', () => {
  const { renderer } = buildRenderer();
  const canvas = stubCanvas(renderer);
  const parent = new FakeElement();
  const tabs = parent.appendChild(new FakeElement());
  const holder = parent.appendChild(new FakeElement());
  let disconnected = 0;
  renderer.tabsContainerElement = tabs;
  renderer.canvasContainerElement = holder;
  renderer.resizeObserver = { disconnect: () => (disconnected += 1) };

  renderer.destroy();
  renderer.destroy();

  assert.equal(canvas.calls.filter(([name]) => name === 'dispose').length, 1);
  assert.deepEqual(parent.removed, [tabs, holder]);
  assert.equal(disconnected, 1);
  assert.equal(renderer.canvas, null);
  assert.equal(renderer.tabsContainerElement, null);
  assert.equal(renderer.canvasContainerElement, null);
});
