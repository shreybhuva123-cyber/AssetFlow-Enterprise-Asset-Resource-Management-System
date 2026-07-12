export const breakpoints = {
  sm:   640,   // Small tablets
  md:   768,   // Tablets
  lg:   1024,  // Laptops
  xl:   1280,  // Desktops
  '2xl':1536,  // Ultra-wide
} as const;

// Tailwind breakpoint prefixes (for documentation)
export const breakpointPrefixes = {
  sm:   'sm:',
  md:   'md:',
  lg:   'lg:',
  xl:   'xl:',
  '2xl':'2xl:',
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Media query strings for use in JS (e.g. matchMedia)
export const mediaQuery = {
  sm:   `(min-width: ${breakpoints.sm}px)`,
  md:   `(min-width: ${breakpoints.md}px)`,
  lg:   `(min-width: ${breakpoints.lg}px)`,
  xl:   `(min-width: ${breakpoints.xl}px)`,
  '2xl':`(min-width: ${breakpoints['2xl']}px)`,
  mobile:   `(max-width: ${breakpoints.sm - 1}px)`,
  tablet:   `(min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.lg - 1}px)`,
  desktop:  `(min-width: ${breakpoints.lg}px)`,
  reducedMotion: '(prefers-reduced-motion: reduce)',
} as const;

// Column counts for responsive grids
export const gridCols = {
  stats:  { default: 1, sm: 2, lg: 4 },
  cards:  { default: 1, sm: 2, xl: 3 },
  form:   { default: 1, md: 2 },
  detail: { default: 1, lg: 3 },
} as const;
