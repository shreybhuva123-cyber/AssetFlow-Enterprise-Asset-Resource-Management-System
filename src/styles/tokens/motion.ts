// Motion tokens — all durations/easings for Framer Motion and CSS transitions

export const duration = {
  instant:  0,
  fast:     100,  // ms — micro interactions (hover, focus)
  normal:   150,  // ms — standard transitions
  moderate: 200,  // ms — dialogs, drawers
  slow:     300,  // ms — page transitions
  slower:   400,  // ms — deliberate reveal animations
} as const;

export const easing = {
  linear:      [0, 0, 1, 1]             as const,
  standard:    [0.4, 0, 0.2, 1]         as const,  // Material standard
  decelerate:  [0, 0, 0.2, 1]           as const,  // Enter
  accelerate:  [0.4, 0, 1, 1]           as const,  // Exit
  spring:      { type: 'spring', stiffness: 350, damping: 30 } as const,
  springLight: { type: 'spring', stiffness: 250, damping: 25 } as const,
} as const;

// Framer Motion variants — reusable across components
export const motionVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] } },
    exit:    { opacity: 0, transition: { duration: 0.1,  ease: [0.4, 0, 1, 1] } },
  },

  fadeInUp: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } },
    exit:    { opacity: 0, y: 4, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } },
  },

  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } },
    exit:    { opacity: 0, x: 20, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } },
  },

  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } },
    exit:    { opacity: 0, x: -20, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } },
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] } },
    exit:    { opacity: 0, scale: 0.95, transition: { duration: 0.1, ease: [0.4, 0, 1, 1] } },
  },

  slideDown: {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: 'auto', transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } },
    exit:    { opacity: 0, height: 0, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } },
  },

  staggerChildren: {
    animate: { transition: { staggerChildren: 0.05 } },
  },

  listItem: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  },
} as const;

// CSS transition shorthand strings
export const transition = {
  fast:    'all 100ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal:  'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  moderate:'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow:    'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  colors:  'color 150ms, background-color 150ms, border-color 150ms',
  opacity: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  transform:'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;
