'use client';

import { motion } from 'framer-motion';
import {
  Package, CheckCircle, UserCheck, Wrench, Archive, AlertTriangle, Trash2, TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface AssetStatsData {
  total:     number;
  byStatus: {
    available:        number;
    allocated:        number;
    reserved:         number;
    underMaintenance: number;
    lost:             number;
    retired:          number;
    disposed:         number;
  };
}

interface StatCardProps {
  label:   string;
  value:   number;
  icon:    React.ComponentType<{ className?: string }>;
  color:   string;
  bgColor: string;
  delay?:  number;
  change?: number;
}

function StatCard({ label, value, icon: Icon, color, bgColor, delay = 0, change }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="group rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-5 hover:border-border/80 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight">{value.toLocaleString()}</p>
          {change !== undefined && (
            <div className={cn('flex items-center gap-1 text-xs', change >= 0 ? 'text-emerald-600' : 'text-red-600')}>
              <TrendingUp className={cn('h-3 w-3', change < 0 && 'rotate-180')} />
              <span>{change >= 0 ? '+' : ''}{change} this month</span>
            </div>
          )}
        </div>
        <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform', bgColor)}>
          <Icon className={cn('h-5 w-5', color)} />
        </div>
      </div>
    </motion.div>
  );
}

interface AssetStatsWidgetsProps {
  stats:       AssetStatsData;
  isLoading?:  boolean;
}

export function AssetStatsWidgets({ stats, isLoading }: AssetStatsWidgetsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-card/50 p-5 animate-pulse">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-7 w-12 bg-muted rounded" />
              </div>
              <div className="h-10 w-10 rounded-xl bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards: StatCardProps[] = [
    { label: 'Total Assets',       value: stats.total,                   icon: Package,       color: 'text-indigo-600',   bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',  delay: 0.00 },
    { label: 'Available',          value: stats.byStatus.available,       icon: CheckCircle,   color: 'text-emerald-600',  bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', delay: 0.05 },
    { label: 'Allocated',          value: stats.byStatus.allocated,       icon: UserCheck,     color: 'text-blue-600',     bgColor: 'bg-blue-100 dark:bg-blue-900/30',       delay: 0.10 },
    { label: 'Under Maintenance',  value: stats.byStatus.underMaintenance,icon: Wrench,        color: 'text-amber-600',    bgColor: 'bg-amber-100 dark:bg-amber-900/30',     delay: 0.15 },
    { label: 'Reserved',           value: stats.byStatus.reserved,        icon: Archive,       color: 'text-violet-600',   bgColor: 'bg-violet-100 dark:bg-violet-900/30',   delay: 0.20 },
    { label: 'Lost',               value: stats.byStatus.lost,            icon: AlertTriangle, color: 'text-red-600',      bgColor: 'bg-red-100 dark:bg-red-900/30',         delay: 0.25 },
    { label: 'Retired',            value: stats.byStatus.retired,         icon: Archive,       color: 'text-orange-600',   bgColor: 'bg-orange-100 dark:bg-orange-900/30',   delay: 0.30 },
    { label: 'Disposed',           value: stats.byStatus.disposed,        icon: Trash2,        color: 'text-gray-500',     bgColor: 'bg-gray-100 dark:bg-gray-800',          delay: 0.35 },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => <StatCard key={card.label} {...card} />)}
    </div>
  );
}
