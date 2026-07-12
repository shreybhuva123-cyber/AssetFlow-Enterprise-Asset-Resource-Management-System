import { formatRelative } from '@/lib/utils/date';
import { UserAvatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils/cn';
import { Skeleton } from '@/components/ui/skeleton';

export interface ActivityItem {
  id: string;
  actor: { firstName: string; lastName: string; avatarUrl?: string | null };
  action: string;
  subject: string;
  createdAt: Date | string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  isLoading?: boolean;
  className?: string;
  maxItems?: number;
}

export function ActivityFeed({ items, isLoading, className, maxItems = 10 }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-4 p-4', className)} aria-label="Loading activity">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-8 text-sm text-muted-foreground', className)}>
        No recent activity
      </div>
    );
  }

  return (
    <ol className={cn('space-y-0', className)} aria-label="Activity feed">
      {items.slice(0, maxItems).map((item, index) => (
        <li key={item.id} className={cn('flex items-start gap-3 py-3', index !== 0 && 'border-t border-border/50')}>
          <UserAvatar
            src={item.actor.avatarUrl}
            firstName={item.actor.firstName}
            lastName={item.actor.lastName}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-snug">
              <span className="font-medium text-foreground">
                {item.actor.firstName} {item.actor.lastName}
              </span>{' '}
              <span className="text-muted-foreground">{item.action}</span>{' '}
              <span className="font-medium text-foreground truncate">{item.subject}</span>
            </p>
            <time
              dateTime={typeof item.createdAt === 'string' ? item.createdAt : item.createdAt.toISOString()}
              className="text-xs text-muted-foreground mt-0.5 block"
            >
              {formatRelative(item.createdAt)}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}
