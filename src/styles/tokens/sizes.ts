// Component size tokens — consistent sizing across all interactive elements

export const componentSizes = {
  // Button heights
  buttonSm:  'h-8',    // 32px
  buttonMd:  'h-9',    // 36px
  buttonLg:  'h-10',   // 40px
  buttonXl:  'h-11',   // 44px

  // Input heights
  inputSm:   'h-8',    // 32px
  inputMd:   'h-9',    // 36px
  inputLg:   'h-10',   // 40px

  // Avatar sizes
  avatarXs:  'h-6 w-6',   // 24px
  avatarSm:  'h-8 w-8',   // 32px
  avatarMd:  'h-10 w-10', // 40px
  avatarLg:  'h-12 w-12', // 48px
  avatarXl:  'h-16 w-16', // 64px

  // Icon sizes
  iconXs:    'h-3 w-3',   // 12px
  iconSm:    'h-4 w-4',   // 16px
  iconMd:    'h-5 w-5',   // 20px
  iconLg:    'h-6 w-6',   // 24px
  iconXl:    'h-8 w-8',   // 32px

  // Badge / chip heights
  badgeSm:   'h-5',    // 20px
  badgeMd:   'h-6',    // 24px

  // Table row heights (via padding)
  tableCompact:     'py-2',
  tableDefault:     'py-3',
  tableComfortable: 'py-4',
} as const;

// Layout dimension constants
export const layoutSizes = {
  sidebarExpanded:  '16rem',   // 256px
  sidebarCollapsed: '4rem',    // 64px
  headerHeight:     '3.5rem',  // 56px
  contentMaxWidth:  '80rem',   // 1280px
  dialogSm:         '24rem',   // 384px
  dialogMd:         '32rem',   // 512px
  dialogLg:         '42rem',   // 672px
  dialogXl:         '56rem',   // 896px
  drawerSm:         '20rem',   // 320px
  drawerMd:         '28rem',   // 448px
  drawerLg:         '36rem',   // 576px
} as const;

export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
