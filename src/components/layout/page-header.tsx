import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, actions, badge, className, children }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 pb-6', className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {badge}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>
      {children}
    </div>
  );
}

interface PageHeaderSkeletonProps {
  hasDescription?: boolean;
  hasActions?: boolean;
}

export function PageHeaderSkeleton({ hasDescription = true, hasActions = true }: PageHeaderSkeletonProps) {
  return (
    <div className="flex flex-col gap-4 pb-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
          {hasDescription && <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />}
        </div>
        {hasActions && (
          <div className="flex gap-2">
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
            <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
          </div>
        )}
      </div>
    </div>
  );
}
