export const typography = {
  fontFamily: {
    sans: 'var(--font-inter), ui-sans-serif, system-ui, -apple-system, sans-serif',
    mono: 'var(--font-mono), ui-monospace, "Cascadia Code", "Fira Code", monospace',
  },

  fontSize: {
    '2xs': ['0.625rem',  { lineHeight: '0.875rem', letterSpacing: '0.025em' }],
    xs:    ['0.75rem',   { lineHeight: '1rem',     letterSpacing: '0.01em'  }],
    sm:    ['0.875rem',  { lineHeight: '1.25rem',  letterSpacing: '0'       }],
    base:  ['1rem',      { lineHeight: '1.5rem',   letterSpacing: '0'       }],
    lg:    ['1.125rem',  { lineHeight: '1.75rem',  letterSpacing: '-0.01em' }],
    xl:    ['1.25rem',   { lineHeight: '1.75rem',  letterSpacing: '-0.01em' }],
    '2xl': ['1.5rem',    { lineHeight: '2rem',     letterSpacing: '-0.02em' }],
    '3xl': ['1.875rem',  { lineHeight: '2.25rem',  letterSpacing: '-0.02em' }],
    '4xl': ['2.25rem',   { lineHeight: '2.5rem',   letterSpacing: '-0.03em' }],
    '5xl': ['3rem',      { lineHeight: '1',        letterSpacing: '-0.04em' }],
  },

  fontWeight: {
    normal:   '400',
    medium:   '500',
    semibold: '600',
    bold:     '700',
  },

  // Semantic text styles
  styles: {
    display: {
      fontSize: '2.25rem',
      fontWeight: '700',
      lineHeight: '2.5rem',
      letterSpacing: '-0.03em',
    },
    h1: {
      fontSize: '1.875rem',
      fontWeight: '700',
      lineHeight: '2.25rem',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: '600',
      lineHeight: '2rem',
      letterSpacing: '-0.02em',
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: '600',
      lineHeight: '1.75rem',
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: '600',
      lineHeight: '1.75rem',
      letterSpacing: '-0.01em',
    },
    bodyLg: {
      fontSize: '1rem',
      fontWeight: '400',
      lineHeight: '1.75rem',
      letterSpacing: '0',
    },
    body: {
      fontSize: '0.875rem',
      fontWeight: '400',
      lineHeight: '1.5rem',
      letterSpacing: '0',
    },
    bodySm: {
      fontSize: '0.8125rem',
      fontWeight: '400',
      lineHeight: '1.25rem',
      letterSpacing: '0',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: '400',
      lineHeight: '1rem',
      letterSpacing: '0.01em',
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      lineHeight: '1.25rem',
      letterSpacing: '0',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: '500',
      lineHeight: '1.25rem',
      letterSpacing: '0',
    },
    tableHeader: {
      fontSize: '0.75rem',
      fontWeight: '600',
      lineHeight: '1rem',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
    tableCell: {
      fontSize: '0.875rem',
      fontWeight: '400',
      lineHeight: '1.25rem',
      letterSpacing: '0',
    },
    code: {
      fontSize: '0.8125rem',
      fontWeight: '400',
      lineHeight: '1.5rem',
      fontFamily: 'var(--font-mono)',
    },
  },
} as const;

// Tailwind class shortcuts for semantic typography
export const textStyles = {
  display:     'text-4xl font-bold tracking-tight',
  h1:          'text-3xl font-bold tracking-tight',
  h2:          'text-2xl font-semibold tracking-tight',
  h3:          'text-xl font-semibold tracking-tight',
  h4:          'text-lg font-semibold tracking-tight',
  bodyLg:      'text-base leading-relaxed',
  body:        'text-sm leading-normal',
  bodySm:      'text-[0.8125rem] leading-5',
  caption:     'text-xs text-muted-foreground',
  label:       'text-sm font-medium',
  button:      'text-sm font-medium',
  tableHeader: 'text-xs font-semibold uppercase tracking-widest text-muted-foreground',
  tableCell:   'text-sm',
  code:        'font-mono text-[0.8125rem]',
} as const;
