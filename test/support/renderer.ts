import { fabric } from 'fabric';

import { FloorplanRenderer } from '../../src/FloorplanRenderer';
import TableGroup from '../../src/objects/TableGroup';
import type { FloorplanRendererOptions, Room, Table } from '../../src/types';

/** A bookable table at the room centre unless overridden. */
export const table = (id: string, overrides: Partial<Table> = {}): Table => ({
  id,
  number: id,
  x: 0.5,
  y: 0.5,
  min_covers: 1,
  max_covers: 4,
  type: 'Table',
  shape: 'square',
  size: '6x6',
  rotation: 0,
  ...overrides,
});

export const room = (id: string, tables: Table[]): Room => ({
  id,
  name: id,
  background_image_url: null,
  background_image_sid: null,
  table_ids: tables.map((t) => t.id),
  tables,
});

export interface Built {
  renderer: any;
  initialized: boolean;
  errors: Error[];
}

/**
 * Build a renderer through the real constructor (so instance fields and option
 * normalization run), with `initialize` stubbed so no DOM or canvas is touched.
 */
export function buildRenderer(
  options: Partial<FloorplanRendererOptions> = {},
  { canvasSize = 640, withContainer = true } = {}
): Built {
  const proto = FloorplanRenderer.prototype as any;
  const original = proto.initialize;
  const errors: Error[] = [];
  let initialized = false;
  proto.initialize = function () {
    initialized = true;
  };

  let renderer: any;
  try {
    renderer = new FloorplanRenderer({
      containerElement: withContainer ? ({} as HTMLElement) : null,
      rooms: [room('r1', [table('t1')])],
      onError: (error: Error) => errors.push(error),
      ...options,
    } as FloorplanRendererOptions);
  } finally {
    proto.initialize = original;
  }

  renderer.canvasSize = canvasSize;
  return { renderer, initialized, errors };
}

export interface StubCanvas {
  zoom: number;
  viewportTransform: number[];
  added: any[];
  calls: any[][];
  [key: string]: any;
}

/** A Fabric canvas double that records every call it receives. */
export function stubCanvas(renderer: any, { zoom = 1 } = {}): StubCanvas {
  const canvas: StubCanvas = {
    zoom,
    viewportTransform: [zoom, 0, 0, zoom, 0, 0],
    added: [],
    calls: [],
    getZoom() {
      return this.zoom;
    },
    setViewportTransform(vpt: number[]) {
      this.viewportTransform = [...vpt];
      this.calls.push(['setViewportTransform', [...vpt]]);
    },
    zoomToPoint(_point: unknown, value: number) {
      this.zoom = value;
      this.viewportTransform[0] = value;
      this.viewportTransform[3] = value;
      this.calls.push(['zoomToPoint', value]);
    },
    requestRenderAll() {
      this.calls.push(['requestRenderAll']);
    },
    renderAll() {
      this.calls.push(['renderAll']);
    },
    clear() {
      this.added = [];
      this.calls.push(['clear']);
    },
    add(object: unknown) {
      this.added.push(object);
    },
    dispose() {
      this.calls.push(['dispose']);
    },
    relativePan() {
      this.calls.push(['relativePan']);
    },
  };
  renderer.canvas = canvas;
  return canvas;
}

/** A real TableGroup wrapping a Rect, usable as a Fabric event target in Node. */
export function tableGroupFor(t: Table): TableGroup {
  return new TableGroup([new fabric.Rect({ width: 10, height: 10 })], {
    tableContext: t,
  });
}

/** A mouse-like event that records preventDefault. */
export function mouseEvent(x: number, y: number) {
  return {
    clientX: x,
    clientY: y,
    prevented: 0,
    preventDefault() {
      this.prevented += 1;
    },
  };
}

/** A TouchEvent-like object with the given touch points. */
export function touchEvent(points: Array<[number, number]>) {
  const touches = points.map(([clientX, clientY]) => ({ clientX, clientY }));
  return {
    touches,
    changedTouches: touches,
    prevented: 0,
    preventDefault() {
      this.prevented += 1;
    },
  };
}

/** Minimal DOM element double for renderTabs/destroy. */
export class FakeElement {
  className = '';
  textContent = '';
  title = '';
  children: FakeElement[] = [];
  attributes: Record<string, string> = {};
  listeners: Record<string, unknown[]> = {};
  parentNode: FakeElement | null = null;
  removed: FakeElement[] = [];
  style: Record<string, string> = {};
  rect = { left: 0, top: 0, width: 0, height: 0 };
  classList = {
    add: (name: string) => {
      this.className = [this.className, name].filter(Boolean).join(' ');
    },
    contains: (name: string) => this.className.split(' ').includes(name),
  };

  set innerHTML(_value: string) {
    this.children = [];
  }

  appendChild(child: FakeElement) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child: FakeElement) {
    this.removed.push(child);
    this.children = this.children.filter((c) => c !== child);
    child.parentNode = null;
    return child;
  }

  getBoundingClientRect() {
    return this.rect;
  }

  setAttribute(name: string, value: string) {
    this.attributes[name] = value;
  }

  addEventListener(type: string, listener: unknown) {
    (this.listeners[type] ||= []).push(listener);
  }
}

/** Install a `document` global that creates FakeElements; returns a restore fn. */
export function installFakeDocument(): () => void {
  const g = globalThis as any;
  const previous = g.document;
  g.document = { createElement: () => new FakeElement() };
  return () => {
    if (previous === undefined) delete g.document;
    else g.document = previous;
  };
}
