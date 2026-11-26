// Renders every golden state for one side (baseline or candidate) with the
// local Chrome, performing real input and asserting the resulting state before
// each screenshot. Usage: node golden/run.mjs <baseUrl> <outDir> [state,...]
import fs from 'node:fs';
import path from 'node:path';

import puppeteer from 'puppeteer-core';

const [baseUrl, outDir, only] = process.argv.slice(2);
if (!baseUrl || !outDir) {
  console.error('usage: node golden/run.mjs <baseUrl> <outDir> [states]');
  process.exit(2);
}

const CHROME =
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const ALL_STATES = [
  'fit',
  'tap',
  'single',
  'covers',
  'zoomed',
  'zoomed-pan',
  'showEmojis-false',
  'pinch',
];
// Candidate-only checks of opt-in features, run by `npm run golden:features`.
const FEATURE_STATES = ['inside-text', 'solid-selected', 'rings', 'labels'];
const states =
  only === 'features' ? FEATURE_STATES : only ? only.split(',') : ALL_STATES;

function check(condition, message) {
  if (!condition) throw new Error(message);
}

async function snapshot(page) {
  return page.evaluate(() => {
    const g = window.__golden;
    const r = g.renderer;
    const minimap = document.querySelector('.floorplan-minimap');
    const background = document.querySelector('.floorplan-background');
    return {
      errors: g.errors.slice(),
      canvasSize: r.canvasSize,
      lowerWidth: document.querySelector('canvas.lower-canvas').width,
      selected: r.selectedTableIds.slice(),
      zoom: r.canvas.getZoom(),
      vpt: r.canvas.viewportTransform.slice(),
      minimap: minimap ? getComputedStyle(minimap).display : null,
      background: background ? background.style.transform : null,
      emojiDrawn: r.canvas
        .getObjects()
        .some((o) => o.tableContext && o.tableContext.number === '🌳'),
    };
  });
}

async function tablePoint(page, id) {
  return page.evaluate((tableId) => {
    const g = window.__golden;
    const t = g.tableById[tableId];
    const rect = document
      .querySelector('canvas.upper-canvas')
      .getBoundingClientRect();
    return {
      x: Math.round(rect.left + t.x * rect.width),
      y: Math.round(rect.top + t.y * rect.height),
    };
  }, id);
}

async function canvasCentre(page) {
  return page.evaluate(() => {
    const rect = document
      .querySelector('canvas.upper-canvas')
      .getBoundingClientRect();
    return {
      x: Math.round(rect.left + rect.width / 2),
      y: Math.round(rect.top + rect.height / 2),
    };
  });
}

async function zoomIn(page) {
  await page.click('button[aria-label="Zoom in"]');
}

async function pinch(page, id) {
  const { x, y } = await tablePoint(page, id);
  const cdp = await page.createCDPSession();
  const points = (spread) => [
    { x: x - spread, y, id: 1 },
    { x: x + spread, y, id: 2 },
  ];
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: points(20),
  });
  for (const spread of [30, 40, 50]) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: points(spread),
    });
  }
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
}

const interactions = {
  fit: async () => {},
  tap: async (page) => {
    const p = await tablePoint(page, 'sq');
    await page.mouse.click(p.x, p.y);
  },
  single: async (page) => {
    const p = await tablePoint(page, 'sq');
    await page.mouse.click(p.x, p.y);
  },
  covers: async (page) => {
    const p = await tablePoint(page, 'c4');
    await page.mouse.click(p.x, p.y);
  },
  zoomed: async (page) => zoomIn(page),
  'zoomed-pan': async (page, before) => {
    await zoomIn(page);
    await zoomIn(page);
    before.vptBeforePan = (await snapshot(page)).vpt;
    const c = await canvasCentre(page);
    await page.mouse.move(c.x, c.y);
    await page.mouse.down();
    await page.mouse.move(c.x - 80, c.y - 80, { steps: 8 });
    await page.mouse.up();
  },
  'showEmojis-false': async () => {},
  pinch: async (page) => pinch(page, 'sq'),
  'inside-text': async () => {},
  rings: async () => {},
  labels: async () => {},
  'solid-selected': async (page) => {
    const p = await tablePoint(page, 'T1');
    await page.mouse.click(p.x, p.y);
  },
};

// Every canvas object in drawing order, classified.
async function layerList(page) {
  return page.evaluate(() =>
    window.__golden.renderer.canvas.getObjects().map((o, index) => {
      const rect = o.getBoundingRect(true, true);
      return {
        index,
        kind: o.tableContext
          ? 'table'
          : o._relatedTableId
            ? `label:${o._positionOnTable}`
            : 'other',
        id: o.tableContext ? o.tableContext.id : o._relatedTableId || null,
        stroke: o.stroke || null,
        evented: o.evented,
        top: rect.top,
        bottom: rect.top + rect.height,
        rects: (o._objects || []).filter((c) => c.type === 'rect').length,
      };
    })
  );
}

// Inspect the real Fabric objects for the feature room's tables.
async function tableObjects(page) {
  return page.evaluate(() => {
    const r = window.__golden.renderer;
    const objects = r.canvas.getObjects();
    const byId = {};
    objects.forEach((o, index) => {
      if (o.tableContext) {
        const children = o._objects || [];
        const shape = children[0];
        const interior = {
          width:
            Math.abs(shape.width) *
            (o.tableContext.shape === 'circle' ? 0.7 : 0.8),
          height:
            Math.abs(shape.height) *
            (o.tableContext.shape === 'circle' ? 0.7 : 0.8),
        };
        byId[o.tableContext.id] = {
          index,
          fill: shape.fill,
          texts: children
            .filter((c) => c.type === 'text')
            .map((c) => ({
              text: c.text,
              fill: c.fill,
              width: c.width,
              height: c.height,
            })),
          interior,
        };
      } else if (o._relatedTableId) {
        (byId[o._relatedTableId] ||= {}).badge = o._positionOnTable;
      }
    });
    return byId;
  });
}

const expectations = {
  fit: (s) => {
    check(s.zoom === 1, `fit zoom ${s.zoom}`);
    check(s.selected.length === 0, `fit selected ${s.selected}`);
    check(s.minimap === 'none', `fit minimap ${s.minimap}`);
    check(s.emojiDrawn, 'fit: emoji should be drawn');
  },
  tap: (s) => check(s.selected.join() === 'sq', `tap selected ${s.selected}`),
  single: (s) =>
    check(s.selected.join() === 'sq', `single selected ${s.selected}`),
  covers: (s) =>
    check(s.selected.join() === 'c4,c4b', `covers selected ${s.selected}`),
  zoomed: (s) => {
    check(s.zoom === 1.5, `zoomed zoom ${s.zoom}`);
    check(s.minimap === 'block', `zoomed minimap ${s.minimap}`);
  },
  'zoomed-pan': (s, before) => {
    check(s.zoom === 2, `pan zoom ${s.zoom}`);
    check(
      s.vpt[4] !== before.vptBeforePan[4] &&
        s.vpt[5] !== before.vptBeforePan[5],
      `pan did not move: ${before.vptBeforePan} -> ${s.vpt}`
    );
    check(
      s.background === `translate(${s.vpt[4]}px, ${s.vpt[5]}px) scale(2)`,
      `background ${s.background} vs vpt ${s.vpt}`
    );
    check(s.selected.length === 0, `pan selected ${s.selected}`);
  },
  'showEmojis-false': (s) => check(!s.emojiDrawn, 'emoji should be hidden'),
  pinch: (s) => {
    check(s.zoom > 1, `pinch zoom ${s.zoom}`);
    check(s.selected.length === 0, `pinch selected ${s.selected}`);
  },
  'inside-text': (s) => {
    const t = s.objects;
    check(
      t.T1.texts.map((x) => x.text).join() === 'T1,1–4',
      `T1 texts ${JSON.stringify(t.T1.texts)}`
    );
    check(
      t.C1.texts.map((x) => x.text).join() === 'C1',
      `C1 texts ${JSON.stringify(t.C1.texts)}`
    );
    check(
      t.X.texts.length === 0 && t.X.badge === 'bottom',
      `X should fall back to the badge: ${JSON.stringify(t.X)}`
    );
    check(
      t['TERRACE-12'].texts.length === 0 && t['TERRACE-12'].badge === 'bottom',
      `wide id should fall back: ${JSON.stringify(t['TERRACE-12'])}`
    );
    for (const [id, o] of Object.entries(t)) {
      (o.texts || []).forEach((x) =>
        check(
          x.width <= o.interior.width && x.height <= o.interior.height,
          `${id} text overflows: ${JSON.stringify(x)} vs ${JSON.stringify(o.interior)}`
        )
      );
    }
  },
  rings: (s) => {
    const rings = s.layers.filter(
      (l) =>
        l.kind === 'other' &&
        ['#F5B94A', '#7DB9F2', '#F29BB0'].includes(l.stroke)
    );
    check(rings.length === 3, `rings ${JSON.stringify(rings)}`);
    check(
      rings.every((r) => r.evented === false),
      'rings must not be interactive'
    );
    const firstTable = Math.min(
      ...s.layers.filter((l) => l.kind === 'table').map((l) => l.index)
    );
    check(
      rings.every((r) => r.index < firstTable),
      `a ring is drawn above a table: ${JSON.stringify(rings)} vs ${firstTable}`
    );
  },
  labels: (s) => {
    const below = s.layers.filter((l) => l.kind === 'label:below');
    check(
      below.length === 1 && below[0].id === 'T1',
      `below labels ${JSON.stringify(below)}`
    );
    check(below[0].rects === 3, `pills ${below[0].rects}`);
    const tables = s.layers.filter((l) => l.kind === 'table');
    check(
      tables.every((t) => t.index < below[0].index),
      'labels must be drawn above every table'
    );
    const t1 = tables.find((t) => t.id === 'T1');
    check(
      below[0].top >= t1.bottom,
      `labels top ${below[0].top} above table bottom ${t1.bottom}`
    );
  },
  'solid-selected': (s) => {
    check(s.selected.join() === 'T1', `selected ${s.selected}`);
    check(s.objects.T1.fill === '#128849', `T1 fill ${s.objects.T1.fill}`);
    check(
      s.objects.T1.texts.every((x) => x.fill === '#FFFFFF'),
      `T1 text fills ${JSON.stringify(s.objects.T1.texts)}`
    );
    check(
      s.objects.C1.fill === '#FFFFFF',
      `C1 should stay unselected: ${s.objects.C1.fill}`
    );
  },
};

fs.mkdirSync(outDir, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: [
    '--force-device-scale-factor=1',
    '--hide-scrollbars',
    '--disable-gpu',
    '--font-render-hinting=none',
  ],
});

let failed = false;
try {
  for (const state of states) {
    const page = await browser.newPage();
    await page.setViewport({ width: 700, height: 760, deviceScaleFactor: 1 });
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    try {
      await page.goto(`${baseUrl}/harness.html?state=${state}`, {
        waitUntil: 'load',
      });
      await page.waitForFunction(
        () =>
          window.__golden &&
          (window.__golden.ready || window.__golden.errors.length > 0),
        { timeout: 15000 }
      );
      const initial = await snapshot(page);
      check(initial.errors.length === 0, `errors: ${initial.errors}`);
      check(
        initial.lowerWidth === initial.canvasSize && initial.canvasSize > 0,
        `canvas ${initial.lowerWidth} vs ${initial.canvasSize}`
      );

      const before = {};
      await interactions[state](page, before);
      await page.evaluate(
        () =>
          new Promise((r) =>
            requestAnimationFrame(() => requestAnimationFrame(r))
          )
      );

      const after = await snapshot(page);
      if (FEATURE_STATES.includes(state)) {
        after.objects = await tableObjects(page);
        after.layers = await layerList(page);
      }
      check(after.errors.length === 0, `errors after input: ${after.errors}`);
      check(pageErrors.length === 0, `page errors: ${pageErrors}`);
      expectations[state](after, before);

      const element = await page.$('#floorplan');
      await element.screenshot({ path: path.join(outDir, `${state}.png`) });
      console.log(`ok   ${state}`);
    } catch (error) {
      failed = true;
      console.log(`FAIL ${state}: ${error.message}`);
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
}

process.exit(failed ? 1 : 0);
