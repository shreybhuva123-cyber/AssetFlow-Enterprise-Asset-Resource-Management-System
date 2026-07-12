export const zIndex = {
  base:       0,
  raised:     10,
  dropdown:   100,
  sticky:     200,
  overlay:    300,
  modal:      400,
  toast:      500,
  tooltip:    600,
  command:    700,
} as const;

export type ZIndexKey = keyof typeof zIndex;

// Tailwind z-index classes mapping
export const zClasses: Record<ZIndexKey, string> = {
  base:       'z-0',
  raised:     'z-10',
  dropdown:   'z-[100]',
  sticky:     'z-[200]',
  overlay:    'z-[300]',
  modal:      'z-[400]',
  toast:      'z-[500]',
  tooltip:    'z-[600]',
  command:    'z-[700]',
};
