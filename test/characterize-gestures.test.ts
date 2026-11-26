import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildRenderer,
  mouseEvent,
  stubCanvas,
  table,
  tableGroupFor,
  touchEvent,
} from './support/renderer';

// Characterization: tap vs drag vs pan vs pinch, as the booking widget gets it.

function gestures({ zoom = 1 } = {}) {
  const { renderer } = buildRenderer();
  const canvas = stubCanvas(renderer, { zoom });
  const trace: string[] = [];
  renderer.handleTableSelect = () => trace.push('select');
  renderer.schedulePan = () => trace.push('pan');
  return { renderer, canvas, trace };
}

function drag(renderer: any, distance: number, target: unknown = null) {
  const down = mouseEvent(0, 0);
  const move = mouseEvent(distance, 0);
  const up = mouseEvent(distance, 0);
  renderer.onPointerDown({ e: down, target });
  renderer.onPointerMove({ e: move, target });
  renderer.onPointerUp({ e: up, target });
  return { down, move, up };
}

test('a drag of exactly DRAG_THRESHOLD (5px) is still a tap', () => {
  const { renderer, trace } = gestures();
  drag(renderer, 5);
  assert.deepEqual(trace, ['select']);
});

test('a drag past the threshold does not select', () => {
  const { renderer, trace } = gestures();
  drag(renderer, 6);
  assert.deepEqual(trace, []);
});

test('at fit zoom a drag never prevents default or pans (page scrolls)', () => {
  const { renderer, trace } = gestures({ zoom: 1 });
  const { move } = drag(renderer, 40);
  assert.equal(move.prevented, 0);
  assert.deepEqual(trace, []);
});

test('zoomed in, a drag prevents default and pans', () => {
  const { renderer, trace } = gestures({ zoom: 2 });
  const { move } = drag(renderer, 40);
  assert.equal(move.prevented, 1);
  assert.deepEqual(trace, ['pan']);
});

test('pointer-up clears the drag state', () => {
  const { renderer } = gestures({ zoom: 2 });
  drag(renderer, 40);
  assert.equal(renderer.lastPointer, null);
  assert.equal(renderer.isPanning, false);
  assert.equal(renderer.dragDistance, 0);
});

test('a multi-touch pointer event neither pans nor selects', () => {
  const { renderer, trace } = gestures({ zoom: 2 });
  const twoFingers = touchEvent([
    [0, 0],
    [50, 0],
  ]);
  renderer.onPointerDown({ e: twoFingers });
  renderer.onPointerMove({ e: twoFingers });
  renderer.onPointerUp({ e: twoFingers });
  assert.deepEqual(trace, []);
});

test('pinch lifecycle: zooms, and the trailing release selects nothing', () => {
  const { renderer, canvas, trace } = gestures({ zoom: 1 });
  [
    'clampPan',
    'syncBackgroundTransform',
    'syncMinimap',
    'syncZoomStepIndex',
    'updateZoomButtons',
  ].forEach((name) => {
    renderer[name] = () => trace.push(name);
  });

  renderer.onTouchStart(
    touchEvent([
      [100, 100],
      [140, 100],
    ])
  );
  assert.equal(renderer.isPinching, true);
  assert.equal(renderer.suppressTap, true);
  assert.equal(renderer.isPanning, false);

  const move = touchEvent([
    [80, 100],
    [160, 100],
  ]);
  renderer.onTouchMove(move);
  assert.equal(move.prevented, 1);
  assert.equal(canvas.zoom, 2);
  assert.ok(trace.includes('clampPan'));
  assert.ok(canvas.calls.some(([name]) => name === 'requestRenderAll'));
  assert.ok(trace.includes('syncBackgroundTransform'));
  assert.ok(trace.includes('syncMinimap'));

  renderer.onTouchEnd(touchEvent([]));
  assert.equal(renderer.isPinching, false);
  assert.equal(renderer.suppressTap, true);
  assert.ok(trace.includes('syncZoomStepIndex'));
  assert.ok(trace.includes('updateZoomButtons'));

  renderer.onPointerUp({
    e: mouseEvent(120, 100),
    target: tableGroupFor(table('t1')),
  });
  assert.equal(trace.includes('select'), false);
  assert.equal(renderer.suppressTap, false);
  assert.equal(renderer.lastPointer, null);
});

test('pinching back to fit zoom resets the viewport instead of clamping', () => {
  const { renderer, canvas, trace } = gestures({ zoom: 2 });
  ['clampPan', 'syncBackgroundTransform', 'syncMinimap'].forEach((name) => {
    renderer[name] = () => trace.push(name);
  });
  renderer.onTouchStart(
    touchEvent([
      [0, 0],
      [100, 0],
    ])
  );
  renderer.onTouchMove(
    touchEvent([
      [0, 0],
      [10, 0],
    ])
  );
  assert.equal(canvas.zoom, 1);
  assert.deepEqual(canvas.viewportTransform, [1, 0, 0, 1, 0, 0]);
  assert.equal(trace.includes('clampPan'), false);
});
