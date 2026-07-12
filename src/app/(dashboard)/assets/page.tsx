import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, Download } from 'lucide-react';
import { DASHBOARD_ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { AssetListClient } from './list-client';

export const metadata: Metadata = {
  title:       'Assets | AssetFlow',
  description: 'Manage and track all enterprise assets',
};

export default function AssetsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Asset Directory</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Search, filter, and manage all enterprise assets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 h-9" id="export-assets-btn" asChild>
            <a href="/api/assets/export?format=csv" download>
              <Download className="h-4 w-4" />
              Export
            </a>
          </Button>
          <Button asChild size="sm" className="gap-2 h-9" id="register-asset-btn">
            <Link href={DASHBOARD_ROUTES.ASSETS.NEW}>
              <Plus className="h-4 w-4" />
              Register Asset
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<AssetListSkeleton />}>
        <AssetListClient />
      </Suspense>
    </div>
  );
}

function AssetListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-full bg-muted animate-pulse rounded-lg" />
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <div className="bg-muted/30 h-12 border-b border-border/60 animate-pulse" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 border-b border-border/30 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
