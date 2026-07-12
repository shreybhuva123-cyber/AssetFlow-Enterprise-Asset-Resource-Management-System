import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils/cn';

interface ChartCardProps {
  title: string;
  description?: string;
  isLoading?: boolean;
  className?: string;
  headerAction?: React.ReactNode;
  height?: number;
  children: React.ReactNode;
}

export function ChartCard({
  title,
  description,
  isLoading,
  className,
  headerAction,
  height = 240,
  children,
}: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && <CardDescription className="mt-0.5">{description}</CardDescription>}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className={cn('w-full rounded-lg')} style={{ height }} aria-label="Loading chart" />
        ) : (
          <div style={{ height }}>{children}</div>
        )}
      </CardContent>
    </Card>
  );
}

// Chart color palette — consistent across all charts
export const CHART_COLORS = [
  'hsl(221, 83%, 53%)',   // primary blue
  'hsl(142, 71%, 45%)',   // success green
  'hsl(38, 92%, 50%)',    // warning amber
  'hsl(0, 84%, 60%)',     // danger red
  'hsl(263, 70%, 50%)',   // violet
  'hsl(199, 89%, 48%)',   // info cyan
  'hsl(24, 95%, 53%)',    // orange
  'hsl(316, 72%, 50%)',   // pink
] as const;

export const CHART_GRID_COLOR = 'hsl(var(--border))';
export const CHART_TICK_COLOR = 'hsl(var(--muted-foreground))';
export const CHART_FONT_SIZE = 11;
