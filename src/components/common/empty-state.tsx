import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: { wrapper: 'py-8', icon: 'h-8 w-8',  title: 'text-sm',  description: 'text-xs' },
  md: { wrapper: 'py-12', icon: 'h-10 w-10', title: 'text-base', description: 'text-sm' },
  lg: { wrapper: 'py-16', icon: 'h-12 w-12', title: 'text-lg',  description: 'text-sm' },
} as const;

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  size = 'md',
}: EmptyStateProps) {
  const styles = sizeStyles[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        styles.wrapper,
        className,
      )}
      role="status"
      aria-label={title}
    >
      <div className="rounded-full bg-muted p-3 mb-4">
        <Icon className={cn(styles.icon, 'text-muted-foreground')} aria-hidden="true" />
      </div>

      <p className={cn('font-medium text-foreground', styles.title)}>{title}</p>

      {description && (
        <p className={cn('mt-1 text-muted-foreground max-w-sm', styles.description)}>
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
