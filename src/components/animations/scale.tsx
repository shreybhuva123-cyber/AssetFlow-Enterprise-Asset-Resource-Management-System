'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/use-media-query';

interface ScaleInProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: React.ReactNode;
  delay?: number;
  duration?: number;
  from?: number;
}

export function ScaleIn({ children, delay = 0, duration = 0.2, from = 0.95, ...props }: ScaleInProps) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: from }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: from }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface PulseProps {
  children: React.ReactNode;
  className?: string;
}

export function Pulse({ children, className }: PulseProps) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      animate={{ scale: [1, 1.04, 1] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}
