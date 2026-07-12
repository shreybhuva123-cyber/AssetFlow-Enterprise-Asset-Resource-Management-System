// Semantic color tokens — reference CSS custom properties defined in globals.css
// Components should use Tailwind classes (bg-primary, text-muted-foreground, etc.)
// These tokens are for non-Tailwind usage and documentation

export const colorTokens = {
  // Core backgrounds
  background:         'hsl(var(--background))',
  foreground:         'hsl(var(--foreground))',

  // Surface layers
  card:               'hsl(var(--card))',
  cardForeground:     'hsl(var(--card-foreground))',
  popover:            'hsl(var(--popover))',
  popoverForeground:  'hsl(var(--popover-foreground))',

  // Brand
  primary:            'hsl(var(--primary))',
  primaryForeground:  'hsl(var(--primary-foreground))',

  // Neutral
  secondary:          'hsl(var(--secondary))',
  secondaryForeground:'hsl(var(--secondary-foreground))',
  muted:              'hsl(var(--muted))',
  mutedForeground:    'hsl(var(--muted-foreground))',
  accent:             'hsl(var(--accent))',
  accentForeground:   'hsl(var(--accent-foreground))',

  // Destructive
  destructive:        'hsl(var(--destructive))',
  destructiveForeground:'hsl(var(--destructive-foreground))',

  // Borders & inputs
  border:             'hsl(var(--border))',
  input:              'hsl(var(--input))',
  ring:               'hsl(var(--ring))',

  // Sidebar
  sidebarBackground:  'hsl(var(--sidebar-background))',
  sidebarForeground:  'hsl(var(--sidebar-foreground))',
  sidebarPrimary:     'hsl(var(--sidebar-primary))',
  sidebarPrimaryForeground: 'hsl(var(--sidebar-primary-foreground))',
  sidebarAccent:      'hsl(var(--sidebar-accent))',
  sidebarAccentForeground: 'hsl(var(--sidebar-accent-foreground))',
  sidebarBorder:      'hsl(var(--sidebar-border))',
  sidebarRing:        'hsl(var(--sidebar-ring))',

  // Semantic status
  success:            'hsl(var(--success))',
  successForeground:  'hsl(var(--success-foreground))',
  warning:            'hsl(var(--warning))',
  warningForeground:  'hsl(var(--warning-foreground))',
  info:               'hsl(var(--info))',
  infoForeground:     'hsl(var(--info-foreground))',
} as const;

// Tailwind class mappings for semantic states
export const statusColorClasses = {
  success: {
    bg:   'bg-success',
    text: 'text-success-foreground',
    border: 'border-success',
    badge: 'bg-success/10 text-success border-success/20',
  },
  warning: {
    bg:   'bg-warning',
    text: 'text-warning-foreground',
    border: 'border-warning',
    badge: 'bg-warning/10 text-warning border-warning/20',
  },
  danger: {
    bg:   'bg-destructive',
    text: 'text-destructive-foreground',
    border: 'border-destructive',
    badge: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  info: {
    bg:   'bg-info',
    text: 'text-info-foreground',
    border: 'border-info',
    badge: 'bg-info/10 text-info border-info/20',
  },
  neutral: {
    bg:   'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-border',
    badge: 'bg-muted text-muted-foreground border-border',
  },
} as const;

export type StatusColor = keyof typeof statusColorClasses;
