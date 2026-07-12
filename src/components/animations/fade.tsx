'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { motionVariants } from '@/styles/tokens/motion';
import { usePrefersReducedMotion } from '@/hooks/use-media-query';

interface FadeInProps extends HTMLMotionProps<'div'> {
  delay?: number;
  duration?: number;
}

export function FadeIn({ children, delay = 0, duration = 0.2, ...props }: FadeInProps) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { delay, duration } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface FadeInUpProps extends HTMLMotionProps<'div'> {
  delay?: number;
}

export function FadeInUp({ children, delay = 0, ...props }: FadeInUpProps) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: motionVariants.fadeInUp.initial,
        visible: {
          ...motionVariants.fadeInUp.animate,
          transition: { ...motionVariants.fadeInUp.transition, delay },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps extends HTMLMotionProps<'div'> {
  staggerDelay?: number;
}

export function StaggerContainer({ children, staggerDelay = 0.05, ...props }: StaggerContainerProps) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: staggerDelay },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
