import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildRenderer,
  FakeElement,
  installFakeDocument,
} from './support/renderer';

function tabsAppended(options: Parameters<typeof buildRenderer>[0]) {
  const restore = installFakeDocument();
  try {
    const { renderer } = buildRenderer(options);
    renderer.containerElement = new FakeElement();
    renderer.renderTabs();
    return {
      children: renderer.containerElement.children as FakeElement[],
      tabs: renderer.tabsContainerElement,
    };
  } finally {
    restore();
  }
}

test('room tabs render by default', () => {
  const { children } = tabsAppended({});
  assert.equal(children.length, 1);
  assert.equal(children[0].className, 'floorplan-tabs-container');
});

test('showRoomTabs: false renders no tab bar at all', () => {
  const { children, tabs } = tabsAppended({ showRoomTabs: false });
  assert.equal(children.length, 0);
  assert.equal(tabs, null);
});
