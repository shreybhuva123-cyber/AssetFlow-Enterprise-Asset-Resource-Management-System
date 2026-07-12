'use client';

import { cn } from '@/lib/utils/cn';
import {
  AssetStatus,
  ASSET_STATUS_LABELS,
  ASSET_STATUS_COLORS,
} from '@/constants/status';
import {
  CheckCircle,
  UserCheck,
  Clock,
  Wrench,
  AlertTriangle,
  Archive,
  Trash2,
} from 'lucide-react';

const STATUS_ICONS: Record<AssetStatus, React.ComponentType<{ className?: string }>> = {
  [AssetStatus.AVAILABLE]:          CheckCircle,
  [AssetStatus.ALLOCATED]:          UserCheck,
  [AssetStatus.RESERVED]:           Clock,
  [AssetStatus.UNDER_MAINTENANCE]:  Wrench,
  [AssetStatus.LOST]:               AlertTriangle,
  [AssetStatus.RETIRED]:            Archive,
  [AssetStatus.DISPOSED]:           Trash2,
};

interface AssetStatusBadgeProps {
  status:    AssetStatus;
  showIcon?: boolean;
  size?:     'sm' | 'md' | 'lg';
  className?: string;
}

export function AssetStatusBadge({
  status,
  showIcon = true,
  size     = 'md',
  className,
}: AssetStatusBadgeProps) {
  const Icon  = STATUS_ICONS[status];
  const label = ASSET_STATUS_LABELS[status];
  const color = ASSET_STATUS_COLORS[status];

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  const iconSizes = { sm: 'h-3 w-3', md: 'h-3.5 w-3.5', lg: 'h-4 w-4' };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        sizeClasses[size],
        color,
        className,
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {label}
    </span>
  );
}
