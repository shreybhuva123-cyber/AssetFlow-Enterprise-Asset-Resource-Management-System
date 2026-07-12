'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

export function LoadingSpinner({ size = 'md', className, label = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin text-muted-foreground', sizeClasses[size], className)}
      aria-label={label}
      role="status"
    />
  );
}

interface FullPageLoaderProps {
  label?: string;
}

export function FullPageLoader({ label = 'Loading...' }: FullPageLoaderProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <LoadingSpinner size="xl" className="text-primary" label={label} />
      <p className="text-sm text-muted-foreground animate-pulse">{label}</p>
    </div>
  );
}

interface InlineLoaderProps {
  label?: string;
  className?: string;
}

export function InlineLoader({ label = 'Loading...', className }: InlineLoaderProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2 py-8', className)} role="status">
      <LoadingSpinner size="md" label={label} />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

interface SectionLoaderProps {
  label?: string;
  minHeight?: string;
}

export function SectionLoader({ label = 'Loading...', minHeight = 'min-h-[200px]' }: SectionLoaderProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', minHeight)} role="status">
      <LoadingSpinner size="lg" className="text-primary" label={label} />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
