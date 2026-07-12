import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
};

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-8 w-8 bg-muted rounded-lg" />
      </div>
      <div className="h-8 w-16 bg-muted rounded" />
      <div className="h-3 w-32 bg-muted rounded" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-5 w-36 bg-muted rounded" />
        <div className="h-8 w-24 bg-muted rounded-md" />
      </div>
      <div className="h-48 bg-muted rounded-lg" />
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 space-y-4 animate-pulse">
      <div className="h-5 w-32 bg-muted rounded" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-8 w-8 bg-muted rounded-full shrink-0" />
          <div className="flex-1 space-y-1">
            <div className="h-3 w-full bg-muted rounded" />
            <div className="h-3 w-2/3 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your assets, maintenance, and operations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <ActivitySkeleton />
      </div>
    </div>
  );
}
