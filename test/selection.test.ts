import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  classifyPointerStart,
  mergeSelection,
  tablesInRect,
  toCssRect,
} from '../src/helpers/selection';
import { floorEmojiList } from '../src/config/emojis';
import {
  buildRenderer,
  FakeElement,
  installFakeDocument,
  mouseEvent,
  room,
  stubCanvas,
  table,
  tableGroupFor,
  touchEvent,
} from './support/renderer';
import type { Table } from '../src/types';

const start = {
  pointerType: 'mouse',
  eventType: 'mousedown',
  button: 0,
  touchCount: 0,
  zoom: 1,
  onTable: false,
  dragToSelect: true,
  multi: true,
  pinching: false,
};

test('classifyPointerStart: only a primary mouse press off-table at fit zoom boxes', () => {
  assert.equal(classifyPointerStart(start), 'box');
  assert.equal(
    classifyPointerStart({
      ...start,
      pointerType: 'touch',
      eventType: 'touchstart',
      touchCount: 1,
    }),
    'default'
  );
  assert.equal(classifyPointerStart({ ...start, button: 2 }), 'default');
  assert.equal(classifyPointerStart({ ...start, zoom: 1.5 }), 'pan');
  assert.equal(classifyPointerStart({ ...start, onTable: true }), 'default');
  assert.equal(
    classifyPointerStart({ ...start, dragToSelect: false }),
    'default'
  );
  assert.equal(classifyPointerStart({ ...start, multi: false }), 'default');
  assert.equal(classifyPointerStart({ ...start, pinching: true }), 'default');
});

const tA = table('a', { x: 0.25, y: 0.25 });
const tB = table('b', { x: 0.75, y: 0.75 });

test('tablesInRect hits tables whose centre is inside the box', () => {
  const hits = tablesInRect(
    [tA, tB],
    { left: 0, top: 0, width: 200, height: 200 },
    400,
    { blockedIds: [], emojiList: floorEmojiList }
  );
  assert.deepEqual(hits, ['a']);
});

test('tablesInRect skips blocked tables, shapes and emojis', () => {
  const tables: Table[] = [
    tA,
    table('blocked', { x: 0.1, y: 0.1 }),
    table('shape', { x: 0.2, y: 0.2, type: 'Shape' }),
    table('tree', { x: 0.3, y: 0.3, type: 'Shape', number: '🌳' }),
  ];
  const hits = tablesInRect(
    tables,
    { left: 0, top: 0, width: 400, height: 400 },
    400,
    { blockedIds: ['blocked'], emojiList: floorEmojiList }
  );
  assert.deepEqual(hits, ['a']);
});

test('tablesInRect accepts a box dragged in any direction', () => {
  const hits = tablesInRect(
    [tA],
    { left: 200, top: 200, width: -200, height: -200 },
    400,
    { blockedIds: [], emojiList: floorEmojiList }
  );
  assert.deepEqual(hits, ['a']);
});

test('mergeSelection keeps current picks and respects the cap', () => {
  assert.deepEqual(mergeSelection(['a'], ['b', 'c', 'a'], 2), ['a', 'b']);
  assert.deepEqual(mergeSelection(['a'], ['b', 'c', 'a'], null), [
    'a',
    'b',
    'c',
  ]);
});

test('toCssRect maps canvas units onto the rendered canvas', () => {
  const geometry = {
    canvasWidth: 400,
    canvasHeight: 400,
    cssWidth: 400,
    cssHeight: 400,
    offsetLeft: 100,
    offsetTop: 0,
  };
  assert.deepEqual(
    toCssRect({ left: 0, top: 0, width: 200, height: 200 }, geometry),
    {
      left: 100,
      top: 0,
      width: 200,
      height: 200,
    }
  );
  assert.deepEqual(
    toCssRect(
      { left: 40, top: 40, width: 200, height: -40 },
      { ...geometry, cssWidth: 300, cssHeight: 300, offsetLeft: 0 }
    ),
    { left: 30, top: 0, width: 150, height: 30 }
  );
});

function dragRenderer(options: Parameters<typeof buildRenderer>[0] = {}) {
  const restore = installFakeDocument();
  const events: string[][] = [];
  const { renderer } = buildRenderer({
    rooms: [room('r', [tA, tB])],
    dragToSelect: true,
    onSelectionChange: (ids: string[]) => events.push(ids),
    ...options,
  });
  renderer.canvasSize = 400;
  const canvas = stubCanvas(renderer);
  const mount = new FakeElement();
  mount.rect = { left: 0, top: 0, width: 400, height: 400 };
  const upper = new FakeElement();
  upper.rect = { left: 0, top: 0, width: 400, height: 400 };
  canvas.upperCanvasEl = upper;
  canvas.getPointer = (e: { clientX: number; clientY: number }) => ({
    x: e.clientX,
    y: e.clientY,
  });
  renderer.overlayMount = () => mount;
  const trace: string[] = [];
  renderer.render = () => trace.push('render');
  const originalSelect = renderer.handleTableSelect.bind(renderer);
  renderer.handleTableSelect = (opt: unknown) => {
    trace.push('tap');
    originalSelect(opt);
  };
  return { renderer, events, mount, trace, restore };
}

test('a touch drag at fit zoom neither boxes nor prevents scrolling', () => {
  const { renderer, events, mount, restore } = dragRenderer();
  try {
    const moves = [touchEvent([[10, 10]]), touchEvent([[150, 150]])];
    renderer.onPointerDown({
      e: { ...touchEvent([[10, 10]]), type: 'touchstart' },
      target: null,
    });
    moves.forEach((e) =>
      renderer.onPointerMove({ e: { ...e, type: 'touchmove' }, target: null })
    );
    renderer.onPointerUp({
      e: { ...touchEvent([]), type: 'touchend' },
      target: null,
    });
    assert.equal(
      moves.reduce((sum, e) => sum + e.prevented, 0),
      0
    );
    assert.equal(mount.children.length, 0);
    assert.deepEqual(events, []);
  } finally {
    restore();
  }
});

test('while pinching, nothing is selected and no tap fires', () => {
  const { renderer, events, trace, restore } = dragRenderer();
  try {
    renderer.isPinching = true;
    renderer.onPointerDown({
      e: { ...mouseEvent(10, 10), type: 'mousedown', button: 0 },
    });
    renderer.onPointerMove({
      e: { ...mouseEvent(200, 200), type: 'mousemove' },
    });
    renderer.onPointerUp({ e: { ...mouseEvent(200, 200), type: 'mouseup' } });
    assert.deepEqual(events, []);
    assert.equal(trace.includes('tap'), false);
  } finally {
    restore();
  }
});

test('a mouse drag from empty canvas selects the tables in the box', () => {
  const { renderer, events, mount, trace, restore } = dragRenderer();
  try {
    const move = { ...mouseEvent(200, 200), type: 'mousemove' };
    renderer.onPointerDown({
      e: { ...mouseEvent(10, 10), type: 'mousedown', button: 0 },
      target: null,
    });
    renderer.onPointerMove({ e: move, target: null });
    assert.ok(move.prevented > 0);
    assert.equal(mount.children.length, 1);
    assert.equal(mount.children[0].className, 'floorplan-box-select');
    renderer.onPointerUp({
      e: { ...mouseEvent(200, 200), type: 'mouseup' },
      target: null,
    });

    assert.deepEqual(events, [['a']]);
    assert.deepEqual(renderer.selectedTableIds, ['a']);
    assert.equal(mount.children.length, 0);
    assert.equal(trace.includes('tap'), false);
    assert.equal(trace.filter((t) => t === 'render').length, 1);
  } finally {
    restore();
  }
});

test('a mouse press on a table taps it as before, without a box', () => {
  const { renderer, events, mount, trace, restore } = dragRenderer();
  try {
    const target = tableGroupFor(tA);
    renderer.onPointerDown({
      e: { ...mouseEvent(100, 100), type: 'mousedown', button: 0 },
      target,
    });
    renderer.onPointerUp({
      e: { ...mouseEvent(100, 100), type: 'mouseup' },
      target,
    });
    assert.equal(mount.children.length, 0);
    assert.deepEqual(events, []);
    assert.ok(trace.includes('tap'));
    assert.deepEqual(renderer.selectedTableIds, ['a']);
  } finally {
    restore();
  }
});

test('dragToSelect off keeps today’s behaviour', () => {
  const { renderer, events, mount, restore } = dragRenderer({
    dragToSelect: false,
  });
  try {
    const move = { ...mouseEvent(200, 200), type: 'mousemove' };
    renderer.onPointerDown({
      e: { ...mouseEvent(10, 10), type: 'mousedown', button: 0 },
      target: null,
    });
    renderer.onPointerMove({ e: move, target: null });
    renderer.onPointerUp({
      e: { ...mouseEvent(200, 200), type: 'mouseup' },
      target: null,
    });
    assert.equal(move.prevented, 0);
    assert.equal(mount.children.length, 0);
    assert.deepEqual(events, []);
  } finally {
    restore();
  }
});
