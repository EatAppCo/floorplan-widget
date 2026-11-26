import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  getCenterPoint,
  getDimensionsV2,
  getSize,
} from '../src/helpers/tables';
import { buildRenderer, room, table } from './support/renderer';

// Characterization: pins today's behaviour before the admin options land.

test('getSize scales the size string against the canvas side', () => {
  assert.deepEqual(getSize(table('t', { size: '6x6' }), 640), [60, 60]);
  assert.deepEqual(getSize(table('t', { size: '3x6' }), 640), [30, 60]);
});

test('getSize defaults a missing size to 6x6', () => {
  assert.deepEqual(getSize(table('t', { size: undefined }), 640), [60, 60]);
});

test('getCenterPoint floors the scaled position', () => {
  assert.deepEqual(
    getCenterPoint(table('t', { x: 0.333, y: 0.777 }), 100),
    [33, 77]
  );
});

test('getDimensionsV2 uses the centre point as left/top', () => {
  const dims = getDimensionsV2(table('t', { x: 0.25, y: 0.5 }), 400);
  assert.equal(dims.left, 100);
  assert.equal(dims.top, 200);
  assert.deepEqual(dims.centerPoint, [100, 200]);
  assert.equal(dims.width, 37);
  assert.equal(dims.height, 37);
});

test('initial selection drops blocked ids before applying the cap', () => {
  const rooms = [room('r1', [table('a'), table('b'), table('blocked')])];
  const { renderer, initialized } = buildRenderer({
    rooms,
    blockedTableIds: ['blocked'],
    initialSelectedTableIds: ['blocked', 'a', 'b'],
    maxSelectable: 1,
  });
  assert.equal(initialized, true);
  assert.deepEqual(renderer.selectedTableIds, ['a']);
});

test('option defaults', () => {
  const { renderer, initialized } = buildRenderer();
  assert.equal(initialized, true);
  assert.equal(renderer.selectionMode, 'multi');
  assert.equal(renderer.showBackgroundImage, true);
  assert.equal(renderer.showEmojis, true);
  assert.equal(renderer.maxSelectable, null);
  assert.equal(renderer.covers, 0);
  assert.deepEqual(renderer.tableGroups, []);
});

test('an unavailable initial room falls back to the first available room', () => {
  const rooms = [room('closed', [table('x')]), room('open', [table('y')])];
  const { renderer } = buildRenderer({
    rooms,
    blockedTableIds: ['x'],
    initialRoomId: 'closed',
  });
  assert.equal(renderer.selectedRoom.id, 'open');
});

test('when every room is unavailable the first room is kept', () => {
  const rooms = [room('r1', [table('x')]), room('r2', [table('y')])];
  const { renderer } = buildRenderer({
    rooms,
    blockedTableIds: ['x', 'y'],
    initialRoomId: 'r2',
  });
  assert.equal(renderer.selectedRoom.id, 'r1');
});

test('no rooms reports an Error and never initializes', () => {
  const { initialized, errors } = buildRenderer({ rooms: [] });
  assert.equal(initialized, false);
  assert.equal(errors.length, 1);
  assert.ok(errors[0] instanceof Error);
  assert.equal(errors[0].message, 'No rooms available.');
});

test('a missing container reports an Error and never initializes', () => {
  const { initialized, errors } = buildRenderer({}, { withContainer: false });
  assert.equal(initialized, false);
  assert.ok(errors[0] instanceof Error);
  assert.equal(errors[0].message, 'Container element is required.');
});

test('roomHasAvailability needs an unblocked Table', () => {
  const { renderer } = buildRenderer({ blockedTableIds: ['b'] });
  assert.equal(
    renderer.roomHasAvailability(room('s', [table('s1', { type: 'Shape' })])),
    false
  );
  assert.equal(renderer.roomHasAvailability(room('b', [table('b')])), false);
  assert.equal(renderer.roomHasAvailability(room('ok', [table('ok')])), true);
});
