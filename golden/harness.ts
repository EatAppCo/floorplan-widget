// Golden harness page script. `@renderer` is aliased at build time to either the
// baseline tree's or the candidate's `src/index.ts` (see tsup.golden.ts).
import { FloorplanRenderer } from '@renderer';

import { baseOptions, rooms, stateOptions, tableById } from './fixtures';

declare global {
  interface Window {
    __golden: {
      ready: boolean;
      renderer: any;
      errors: string[];
      selectionEvents: string[][];
      tableById: typeof tableById;
    };
  }
}

const golden: Window['__golden'] = {
  ready: false,
  renderer: null,
  errors: [],
  selectionEvents: [],
  tableById,
};
window.__golden = golden;
window.addEventListener('error', (event) =>
  golden.errors.push(String(event.message))
);

const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));

async function start() {
  const state = new URLSearchParams(location.search).get('state') || 'fit';
  const extra = stateOptions[state];
  if (!extra) throw new Error(`Unknown golden state: ${state}`);

  // Fonts and the background image settle before Fabric measures anything.
  await document.fonts.ready;
  const background = new Image();
  background.src = 'assets/bg.png';
  await background.decode();

  golden.renderer = new FloorplanRenderer({
    containerElement: document.getElementById('floorplan'),
    rooms: rooms as any,
    ...baseOptions,
    ...extra,
    onError: (error: Error) => golden.errors.push(error.message),
  } as any);

  await frame();
  await frame();
  golden.ready = true;
}

start().catch((error) => golden.errors.push(String(error && error.message)));
