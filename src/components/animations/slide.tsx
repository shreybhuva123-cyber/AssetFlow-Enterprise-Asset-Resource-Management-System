'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { motionVariants } from '@/styles/tokens/motion';
import { usePrefersReducedMotion } from '@/hooks/use-media-query';

type SlideDirection = 'left' | 'right' | 'up' | 'down';

const directionVariants: Record<SlideDirection, { x?: number; y?: number }> = {
  left: { x: -20 },
  right: { x: 20 },
  up: { y: -20 },
  down: { y: 20 },
};

interface SlideInProps extends HTMLMotionProps<'div'> {
  direction?: SlideDirection;
  delay?: number;
  duration?: number;
}

export function SlideIn({ children, direction = 'right', delay = 0, duration = 0.25, ...props }: SlideInProps) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
  }

  const offset = directionVariants[direction];

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}
