export const themeConfig = {
  defaultMode: 'system' as const,

  modes: ['light', 'dark', 'system'] as const,

  accentColors: [
    { name: 'Blue',   value: 'blue',   hsl: '221 83% 53%' },
    { name: 'Violet', value: 'violet', hsl: '263 70% 50%' },
    { name: 'Rose',   value: 'rose',   hsl: '347 77% 50%' },
    { name: 'Orange', value: 'orange', hsl: '24 95% 53%'  },
    { name: 'Green',  value: 'green',  hsl: '142 71% 45%' },
  ] as const,

  defaultAccentColor: 'blue',

  borderRadius: {
    none:  '0rem',
    sm:    '0.25rem',
    md:    '0.375rem',
    lg:    '0.5rem',
    xl:    '0.75rem',
    full:  '9999px',
  },

  defaultBorderRadius: 'md',

  fontSizes: {
    xs:   '0.75rem',
    sm:   '0.875rem',
    base: '1rem',
    lg:   '1.125rem',
    xl:   '1.25rem',
    '2xl':'1.5rem',
  },

  fontFamily: {
    sans: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif',
    mono: 'var(--font-mono), ui-monospace, monospace',
  },

  spacing: {
    sidebarWidth: '16rem',
    sidebarCollapsedWidth: '4rem',
    headerHeight: '3.5rem',
    contentMaxWidth: '80rem',
  },

  animation: {
    durationFast: '150ms',
    durationNormal: '200ms',
    durationSlow: '300ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  zIndex: {
    base:    0,
    raised:  10,
    dropdown: 100,
    sticky:  200,
    overlay: 300,
    modal:   400,
    toast:   500,
    tooltip: 600,
  },
} as const;

export type ThemeConfig = typeof themeConfig;
export type ThemeMode = typeof themeConfig.modes[number];
export type AccentColor = typeof themeConfig.accentColors[number]['value'];
