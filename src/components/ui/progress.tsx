'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils/cn';

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'success' | 'warning' | 'destructive';
}

const sizeClasses = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
const colorClasses = {
  default:     'bg-primary',
  success:     'bg-success',
  warning:     'bg-warning',
  destructive: 'bg-destructive',
};

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, indicatorClassName, showLabel, size = 'md', color = 'default', ...props }, ref) => (
  <div className={cn('w-full', showLabel && 'space-y-1')}>
    {showLabel && (
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Progress</span>
        <span>{Math.round(value ?? 0)}%</span>
      </div>
    )}
    <ProgressPrimitive.Root
      ref={ref}
      className={cn('relative w-full overflow-hidden rounded-full bg-secondary', sizeClasses[size], className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn('h-full w-full flex-1 transition-all duration-500', colorClasses[color], indicatorClassName)}
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  </div>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
