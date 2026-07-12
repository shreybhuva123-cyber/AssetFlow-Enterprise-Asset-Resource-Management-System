'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ExternalLink, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { AssetStatsWidgets, type AssetStatsData } from '@/features/assets/components/asset-stats-widgets';
import { AssetStatusPieChart, AssetConditionBarChart } from '@/features/assets/components/asset-charts';
import { AssetStatusBadge } from '@/features/assets/components/asset-status-badge';
import { DASHBOARD_ROUTES } from '@/constants/routes';
import { AssetStatus } from '@/constants/status';

type AssetStatsFull = AssetStatsData & {
  byCondition:    Record<string, number>;
  byCategory:     { name: string; count: number }[];
  byDepartment:   { name: string; count: number }[];
  recentAssets:   {
    id: string; assetTag: string; name: string;
    status: AssetStatus; createdAt: string;
    category?: { name: string; icon?: string | null } | null;
  }[];
};

export function AssetDashboardClient() {
  const [stats,     setStats]     = useState<AssetStatsFull | null>(null);
  const [loading,   setLoading]   = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/assets/stats');
      if (!res.ok) return;
      const json = await res.json() as { data: AssetStatsFull };
      setStats(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchStats(); }, [fetchStats]);

  const statusDonutData: Record<string, number> = stats ? {
    [AssetStatus.AVAILABLE]:         stats.byStatus.available,
    [AssetStatus.ALLOCATED]:         stats.byStatus.allocated,
    [AssetStatus.RESERVED]:          stats.byStatus.reserved,
    [AssetStatus.UNDER_MAINTENANCE]: stats.byStatus.underMaintenance,
    [AssetStatus.LOST]:              stats.byStatus.lost,
    [AssetStatus.RETIRED]:           stats.byStatus.retired,
    [AssetStatus.DISPOSED]:          stats.byStatus.disposed,
  } : {};

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <AssetStatsWidgets stats={stats ?? {
        total: 0,
        byStatus: { available: 0, allocated: 0, reserved: 0, underMaintenance: 0, lost: 0, retired: 0, disposed: 0 },
      }} isLoading={loading} />

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Status Donut */}
        <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-5 space-y-3">
          <h3 className="text-sm font-semibold">Status Distribution</h3>
          {loading ? (
            <div className="h-[220px] flex items-center justify-center">
              <div className="h-20 w-20 rounded-full border-4 border-muted border-t-primary animate-spin" />
            </div>
          ) : (
            <AssetStatusPieChart data={statusDonutData} />
          )}
        </div>

        {/* Condition Bar */}
        <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-5 space-y-3">
          <h3 className="text-sm font-semibold">Condition Overview</h3>
          {loading ? (
            <div className="h-[220px] flex items-center justify-center">
              <div className="h-20 w-20 rounded-full border-4 border-muted border-t-primary animate-spin" />
            </div>
          ) : (
            <AssetConditionBarChart data={stats?.byCondition ?? {}} />
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Top Categories */}
        <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-5 space-y-3">
          <h3 className="text-sm font-semibold">Top Categories</h3>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {(stats?.byCategory ?? []).slice(0, 6).map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground truncate">{cat.name}</span>
                  <span className="font-medium ml-2 flex-shrink-0">{cat.count}</span>
                </motion.div>
              ))}
              {(stats?.byCategory ?? []).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No categories yet</p>
              )}
            </div>
          )}
        </div>

        {/* Top Departments */}
        <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-5 space-y-3">
          <h3 className="text-sm font-semibold">Assets by Department</h3>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {(stats?.byDepartment ?? []).slice(0, 6).map((dep, i) => (
                <motion.div
                  key={dep.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground truncate">{dep.name}</span>
                  <span className="font-medium ml-2 flex-shrink-0">{dep.count}</span>
                </motion.div>
              ))}
              {(stats?.byDepartment ?? []).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No departments yet</p>
              )}
            </div>
          )}
        </div>

        {/* Recent Assets */}
        <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recently Added</h3>
            <Link href={DASHBOARD_ROUTES.ASSETS.LIST} className="text-xs text-primary hover:underline flex items-center gap-0.5">
              View all <ExternalLink className="h-3 w-3 ml-0.5" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {(stats?.recentAssets ?? []).map((asset, i) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={DASHBOARD_ROUTES.ASSETS.DETAIL(asset.id)}
                    className="flex items-center gap-2.5 rounded-lg p-2 -mx-2 hover:bg-muted/40 transition-colors"
                    id={`recent-asset-${asset.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{asset.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{asset.assetTag}</p>
                    </div>
                    <AssetStatusBadge status={asset.status} size="sm" showIcon={false} />
                  </Link>
                </motion.div>
              ))}
              {(stats?.recentAssets ?? []).length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-xs">No assets registered yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
