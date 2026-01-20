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

