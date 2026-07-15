import assert from 'node:assert/strict';

import { sortTablesByRenderOrder } from '../src/helpers/tables';
import { Table } from '../src/types';

const table = (id: string, type: Table['type'] = 'Table'): Table => ({
  id,
  max_covers: 4,
  min_covers: 1,
  number: id,
  type,
  x: 0.5,
  y: 0.5,
});

const selected = table('selected');
const overlapping = table('overlapping');
const shape = table('shape', 'Shape');

const result = sortTablesByRenderOrder(
  [selected, overlapping, shape],
  [],
  [selected.id]
);

assert.deepEqual(
  result.map(({ id }) => id),
  [shape.id, overlapping.id, selected.id]
);
