import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, BarChart2 } from 'lucide-react';
import { DASHBOARD_ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { AssetDashboardClient } from './dashboard-client';

export const metadata: Metadata = {
  title:       'Asset Dashboard | AssetFlow',
  description: 'Enterprise asset management overview and statistics',
};

export default function AssetDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Asset Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Real-time snapshot of your enterprise asset portfolio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 h-9" asChild id="view-all-assets-btn">
            <Link href={DASHBOARD_ROUTES.ASSETS.LIST}>
              <BarChart2 className="h-4 w-4" />
              View All Assets
            </Link>
          </Button>
          <Button size="sm" className="gap-2 h-9" asChild id="register-asset-dashboard-btn">
            <Link href={DASHBOARD_ROUTES.ASSETS.NEW}>
              <Plus className="h-4 w-4" />
              Register Asset
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <AssetDashboardClient />
      </Suspense>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-border/60 bg-card/50 animate-pulse" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 rounded-xl border border-border/60 bg-card/50 animate-pulse" />
        <div className="h-72 rounded-xl border border-border/60 bg-card/50 animate-pulse" />
      </div>
    </div>
  );
}
