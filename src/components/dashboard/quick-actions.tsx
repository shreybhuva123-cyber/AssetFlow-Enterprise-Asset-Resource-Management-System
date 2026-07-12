'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

export interface QuickAction {
  label: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  icon: LucideIcon;
  color?: string;
  disabled?: boolean;
}

interface QuickActionsProps {
  title?: string;
  actions: QuickAction[];
  cols?: 2 | 3 | 4;
  className?: string;
}

function ActionItem({ action }: { action: QuickAction }) {
  const Icon = action.icon;
  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-lg border bg-card p-4 text-center transition-all',
        'hover:bg-accent hover:border-primary/30 hover:shadow-sm',
        action.disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        !action.disabled && 'cursor-pointer',
      )}
    >
      <div className={cn('rounded-md bg-muted p-2.5', action.color ?? 'text-primary')}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium leading-snug">{action.label}</p>
        {action.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
        )}
      </div>
    </div>
  );

  if (action.href) {
    return <Link href={action.href} aria-disabled={action.disabled}>{content}</Link>;
  }

  return (
    <button
      type="button"
      onClick={action.onClick}
      disabled={action.disabled}
      aria-label={action.label}
      className="text-left"
    >
      {content}
    </button>
  );
}

export function QuickActions({ title = 'Quick Actions', actions, cols = 3, className }: QuickActionsProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            'grid gap-3',
            cols === 2 && 'grid-cols-2',
            cols === 3 && 'grid-cols-2 sm:grid-cols-3',
            cols === 4 && 'grid-cols-2 sm:grid-cols-4',
          )}
        >
          {actions.map((action) => (
            <ActionItem key={action.label} action={action} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
