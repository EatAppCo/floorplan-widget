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
};

export const tableById = Object.fromEntries(mainTables.map((x) => [x.id, x]));
