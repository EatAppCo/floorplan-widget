// Fixed rooms for the golden renders. Positions are spread so every table is
// clickable on its own at fit zoom.

type Kind = 'Table' | 'Shape';

const t = (
  id: string,
  x: number,
  y: number,
  extra: Record<string, unknown> = {}
) => ({
  id,
  number: id,
  x,
  y,
  rotation: 0,
  min_covers: 1,
  max_covers: 4,
  shape: 'square',
  size: '6x6',
  type: 'Table' as Kind,
  room_id: 'main',
  ...extra,
});

export const mainTables = [
  t('sq', 0.15, 0.15),
  t('circ', 0.38, 0.15, { shape: 'circle' }),
  t('rot', 0.62, 0.15, { shape: 'rectangle', size: '4x8', rotation: 30 }),
  t('long', 0.85, 0.15, { shape: 'rectangle', size: '3x6' }),
  t('pref', 0.15, 0.45),
  t('paid', 0.38, 0.45),
  t('both', 0.62, 0.45),
  t('blocked', 0.85, 0.45),
  t('c4', 0.3, 0.75, { max_covers: 4 }),
  t('c4b', 0.45, 0.75, { max_covers: 4 }),
  t('Bar', 0.72, 0.75, {
    type: 'Shape',
    shape: 'rectangle',
    size: '10x4',
    color: '#E1E8F8',
  }),
  t('🌳', 0.9, 0.88, { type: 'Shape', size: '4x4', shape: 'square' }),
];

// Candidate-only feature room (tables sized for the inside-text rules).
export const featureTables = [
  t('T1', 0.25, 0.25, { size: '4.3x4.3', room_id: 'features' }),
  t('C1', 0.5, 0.25, { shape: 'circle', size: '2.6x2.6', room_id: 'features' }),
  t('X', 0.75, 0.25, { size: '1x1', room_id: 'features' }),
  t('TERRACE-12', 0.25, 0.6, { size: '4.3x4.3', room_id: 'features' }),
  t('R2', 0.6, 0.6, {
    shape: 'rectangle',
    size: '6x3',
    rotation: 30,
    room_id: 'features',
  }),
];

export const rooms = [
  {
    id: 'main',
    name: 'Main',
    background_image_url: 'assets/bg.png',
    background_image_sid: null,
    table_ids: mainTables.map((x) => x.id),
    tables: mainTables,
  },
  {
    id: 'closed',
    name: 'Closed',
    background_image_url: null,
    background_image_sid: null,
    table_ids: ['shut'],
    tables: [t('shut', 0.5, 0.5, { room_id: 'closed' })],
  },
  {
    id: 'features',
    name: 'Features',
    background_image_url: null,
    background_image_sid: null,
    table_ids: featureTables.map((x) => x.id),
    tables: featureTables,
  },
];

export const baseOptions = {
  blockedTableIds: ['blocked', 'shut'],
  preferredTableIds: ['pref', 'both'],
  paidTableIds: ['paid', 'both'],
  tableGroups: [['c4', 'c4b']],
};

/** Per-state option overrides; interactions live in run.mjs. */
export const stateOptions: Record<string, Record<string, unknown>> = {
  fit: {},
  tap: {},
  single: { selectionMode: 'single' },
  covers: { covers: 6 },
  zoomed: {},
  'zoomed-pan': {},
  'showEmojis-false': { showEmojis: false },
  pinch: {},
  'inside-text': { tableContent: 'inside', initialRoomId: 'features' },
  rings: {
    initialRoomId: 'features',
    tableRings: { T1: '#F5B94A', C1: '#7DB9F2', R2: '#F29BB0' },
  },
  labels: {
    initialRoomId: 'features',
    tableLabels: { T1: ['Garden terrace', 'Outdoor', 'Accessible'] },
  },
  'drag-select': { initialRoomId: 'features', dragToSelect: true },
  'solid-selected': {
    tableContent: 'inside',
    selectedAppearance: 'solid',
    initialRoomId: 'features',
  },
};

export const tableById = Object.fromEntries(
  [...mainTables, ...featureTables].map((x) => [x.id, x])
);
