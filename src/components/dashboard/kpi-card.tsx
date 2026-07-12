import { type LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Card, CardContent } from '@/components/ui/card';
import { formatCompact } from '@/lib/utils/currency';

interface KpiCardProps {
  title: string;
  value: number | string;
  format?: 'number' | 'currency' | 'percent' | 'raw';
  trend?: number;
  trendLabel?: string;
  icon?: LucideIcon;
  iconColor?: string;
  description?: string;
  isLoading?: boolean;
  className?: string;
}

function TrendBadge({ trend }: { trend: number }) {
  const isPositive = trend > 0;
  const isNeutral = trend === 0;
  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-medium',
        isNeutral && 'text-muted-foreground',
        isPositive && 'text-success',
        !isPositive && !isNeutral && 'text-destructive',
      )}
      aria-label={`${isPositive ? 'Up' : isNeutral ? 'No change' : 'Down'} ${Math.abs(trend)}%`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {Math.abs(trend).toFixed(1)}%
    </span>
  );
}

function formatValue(value: number | string, format: KpiCardProps['format']): string {
  if (typeof value === 'string') return value;
  switch (format) {
    case 'currency': return `$${formatCompact(value)}`;
    case 'percent':  return `${value.toFixed(1)}%`;
    case 'number':   return formatCompact(value);
    default:         return String(value);
  }
}

export function KpiCard({
  title,
  value,
  format = 'number',
  trend,
  trendLabel = 'vs last period',
  icon: Icon,
  iconColor = 'text-primary',
  description,
  isLoading,
  className,
}: KpiCardProps) {
  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-8 w-8 bg-muted rounded-lg" />
          </div>
          <div className="h-8 w-20 bg-muted rounded" />
          <div className="h-3 w-32 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('group', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground leading-none">{title}</p>
          {Icon && (
            <div className={cn('rounded-lg bg-muted p-2 shrink-0 transition-colors group-hover:bg-primary/10', iconColor)}>
              <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
          )}
        </div>

        <p className="mt-3 text-2xl font-bold tracking-tight tabular-nums">
          {formatValue(value, format)}
        </p>

        {(trend !== undefined || description) && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            {trend !== undefined && <TrendBadge trend={trend} />}
            <span>{trendLabel ?? description}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function KpiCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('animate-pulse', className)}>
      <CardContent className="p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-8 w-8 bg-muted rounded-lg" />
        </div>
        <div className="h-8 w-20 bg-muted rounded" />
        <div className="h-3 w-32 bg-muted rounded" />
      </CardContent>
    </Card>
  );
}

