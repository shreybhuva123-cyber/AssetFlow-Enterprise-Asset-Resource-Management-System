// Border radius tokens — referenced from CSS variable --radius (0.375rem = md)
export const radius = {
  none: '0px',
  sm:   'calc(var(--radius) - 4px)',   // ~2px
  md:   'calc(var(--radius) - 2px)',   // ~4px
  DEFAULT: 'var(--radius)',             // 6px (set in globals.css)
  lg:   'var(--radius)',                // 6px
  xl:   'calc(var(--radius) + 4px)',   // ~10px
  '2xl':'calc(var(--radius) + 8px)',   // ~14px
  full: '9999px',
} as const;

// Component-specific radius
export const componentRadius = {
  button:   'var(--radius)',
  input:    'var(--radius)',
  card:     'var(--radius)',
  badge:    '9999px',
  chip:     '9999px',
  avatar:   '9999px',
  dialog:   'calc(var(--radius) + 4px)',
  dropdown: 'calc(var(--radius) + 2px)',
  tooltip:  'calc(var(--radius) - 2px)',
  table:    'var(--radius)',
  tag:      'calc(var(--radius) - 2px)',
} as const;
