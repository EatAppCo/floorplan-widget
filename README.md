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
