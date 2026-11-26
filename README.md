# @eat/floorplan-widget

A framework-agnostic floorplan renderer for the Widget using Fabric.js. Display restaurant table layouts with interactive selection.

## Installation

```bash
npm install @eat/floorplan-widget
```

## Usage

```typescript
import { FloorplanRenderer } from '@eat/floorplan-widget';
import '@eat/floorplan-widget/dist/index.css';

const floorplan = new FloorplanRenderer({
  containerElement: document.getElementById('floorplan'),
  rooms: rooms,
  blockedTableIds: ['table-1', 'table-2'],
  preferredTableIds: ['table-3', 'table-4'],
  onTableClick: (clickedTable, selectedTableIds) => {
    console.log(clickedTable, selectedTableIds);
  },
  onRoomChange: (room) => {
    console.log(room);
  },
  onError: (error) => {
    console.log(error);
  },
});
```

## Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `containerElement` | `HTMLElement` | Yes | DOM element to render the floorplan |
| `rooms` | `Room[]` | Yes | Array of rooms with tables |
| `blockedTableIds` | `string[]` | No | Table IDs that cannot be selected |
| `preferredTableIds` | `string[]` | No | Table IDs that show preference indicator |
| `onTableClick` | `Function` | No | Called when a table is clicked |
| `onRoomChange` | `Function` | No | Called when room tab is changed |
| `onError` | `Function` | No | Called when an error occurs |

### Opt-in options (1.1.0)

All of these default to the original behaviour, so existing hosts are unaffected.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `tableContent` | `'badge' \| 'inside'` | `'badge'` | `'inside'` draws the number and covers inside each table, sized to fit; tables too small for the text fall back to the number badge |
| `selectedAppearance` | `'tint' \| 'solid'` | `'tint'` | `'solid'` fills selected tables green with white text |
| `tableRings` | `Record<string, string>` | `{}` | Table id → ring colour, drawn behind the table (e.g. sections) |
| `tableLabels` | `Record<string, string[]>` | `{}` | Table id → labels shown as pills under the table (3 max, then `+N`) |
| `showRoomTabs` | `boolean` | `true` | `false` hides the room tab bar, for hosts with their own room navigation |
| `dragToSelect` | `boolean` | `false` | Mouse-drag on empty canvas (fit zoom, multi mode) selects every table in the box; touch still scrolls |
| `onSelectionChange` | `(ids: string[]) => void` | — | Called once per completed drag-to-select box |

## Methods

| Method | Description |
|--------|-------------|
| `getSelectedTableIds()` | The current selection (a copy) |
| `setSelectedTableIds(ids)` | Replace the selection; drops blocked ids, applies `maxSelectable`, keeps zoom/pan, fires no callbacks |
| `setTableRings(rings)` | Replace the rings (`{}` removes them); keeps zoom/pan |
| `setTableLabels(labels)` | Replace the labels (`{}` removes them); keeps zoom/pan |
| `destroy()` | Tear down the canvas, DOM and listeners |


## Development

```bash
npm test             # unit + characterization tests (Node)
npm run golden:check # pixel A/B of default rendering vs the baseline commit
```

`golden:check` renders the fixture rooms in `golden/fixtures.ts` in several
states (fit, tap, single, covers, zoomed, zoomed-pan, emojis hidden, pinch) with
your local Chrome (`CHROME_PATH` overrides the macOS default). It renders both
the commit in `golden/config.json` (`baseSha`, or `GOLDEN_BASE_SHA`) — built in
a temporary git worktree — and the working tree, on the same machine, and fails
on any differing pixel or failed state assertion. Diffs are written to
`.golden/diff-<state>.png`. Pixels depend on the browser and fonts, so reference
images are never committed.
