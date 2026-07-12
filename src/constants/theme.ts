export const CSS_VARS = {
  BACKGROUND: '--background',
  FOREGROUND: '--foreground',
  PRIMARY: '--primary',
  PRIMARY_FOREGROUND: '--primary-foreground',
  SECONDARY: '--secondary',
  MUTED: '--muted',
  MUTED_FOREGROUND: '--muted-foreground',
  ACCENT: '--accent',
  BORDER: '--border',
  INPUT: '--input',
  RING: '--ring',
  RADIUS: '--radius',
  SIDEBAR_BACKGROUND: '--sidebar-background',
  SIDEBAR_FOREGROUND: '--sidebar-foreground',
} as const;

export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
  COMMAND_PALETTE: 1090,
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

export const SIDEBAR_WIDTH = 260;
export const SIDEBAR_COLLAPSED_WIDTH = 60;
export const HEADER_HEIGHT = 64;

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 200,
  SLOW: 300,
  VERY_SLOW: 500,
} as const;

export const TRANSITION_EASING = {
  DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  IN: 'cubic-bezier(0.4, 0, 1, 1)',
  OUT: 'cubic-bezier(0, 0, 0.2, 1)',
  IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;
