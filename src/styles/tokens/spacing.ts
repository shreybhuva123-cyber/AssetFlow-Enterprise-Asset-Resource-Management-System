// 8-point grid spacing system
// All values are multiples of 4px (0.25rem) aligned to an 8pt grid

export const spacing = {
  px:   '1px',
  0:    '0px',
  0.5:  '0.125rem',  // 2px
  1:    '0.25rem',   // 4px
  1.5:  '0.375rem',  // 6px
  2:    '0.5rem',    // 8px  ← grid unit
  2.5:  '0.625rem',  // 10px
  3:    '0.75rem',   // 12px
  3.5:  '0.875rem',  // 14px
  4:    '1rem',      // 16px ← 2× grid
  5:    '1.25rem',   // 20px
  6:    '1.5rem',    // 24px ← 3× grid
  7:    '1.75rem',   // 28px
  8:    '2rem',      // 32px ← 4× grid
  9:    '2.25rem',   // 36px
  10:   '2.5rem',    // 40px ← 5× grid
  11:   '2.75rem',   // 44px
  12:   '3rem',      // 48px ← 6× grid
  14:   '3.5rem',    // 56px
  16:   '4rem',      // 64px ← 8× grid
  20:   '5rem',      // 80px
  24:   '6rem',      // 96px
  28:   '7rem',      // 112px
  32:   '8rem',      // 128px
  36:   '9rem',      // 144px
  40:   '10rem',     // 160px
  48:   '12rem',     // 192px
  56:   '14rem',     // 224px
  64:   '16rem',     // 256px
  72:   '18rem',     // 288px
  80:   '20rem',     // 320px
  96:   '24rem',     // 384px
} as const;

// Semantic spacing aliases
export const layoutSpacing = {
  pageX:          '1.5rem',  // Horizontal page padding (mobile)
  pageXMd:        '2rem',    // Horizontal page padding (tablet)
  pageXLg:        '2.5rem',  // Horizontal page padding (desktop)
  pageY:          '1.5rem',  // Vertical page padding
  sectionGap:     '2rem',    // Gap between page sections
  cardPadding:    '1.5rem',  // Card internal padding
  cardPaddingSm:  '1rem',    // Compact card padding
  inputPaddingX:  '0.75rem', // Input horizontal padding
  inputPaddingY:  '0.5rem',  // Input vertical padding
  buttonPaddingX: '1rem',    // Button horizontal padding
  buttonPaddingY: '0.5rem',  // Button vertical padding
  tableCell:      '0.75rem', // Table cell padding
  sidebarX:       '0.75rem', // Sidebar item horizontal padding
} as const;

export type SpacingKey = keyof typeof spacing;
