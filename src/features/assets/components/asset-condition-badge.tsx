'use client';

import { cn } from '@/lib/utils/cn';
import { AssetCondition, ASSET_CONDITION_LABELS, ASSET_CONDITION_COLORS } from '@/constants/status';
import { Star, ThumbsUp, Minus, ThumbsDown, AlertOctagon, HelpCircle, Trash2 } from 'lucide-react';

const CONDITION_ICONS: Record<AssetCondition, React.ComponentType<{ className?: string }>> = {
  [AssetCondition.EXCELLENT]: Star,
  [AssetCondition.GOOD]:      ThumbsUp,
  [AssetCondition.FAIR]:      Minus,
  [AssetCondition.POOR]:      ThumbsDown,
  [AssetCondition.DAMAGED]:   AlertOctagon,
  [AssetCondition.LOST]:      HelpCircle,
  [AssetCondition.DISPOSED]:  Trash2,
};

interface AssetConditionBadgeProps {
  condition:  AssetCondition;
  showIcon?:  boolean;
  size?:      'sm' | 'md' | 'lg';
  className?: string;
}

export function AssetConditionBadge({
  condition,
  showIcon  = true,
  size      = 'md',
  className,
}: AssetConditionBadgeProps) {
  const Icon  = CONDITION_ICONS[condition];
  const label = ASSET_CONDITION_LABELS[condition];
  const color = ASSET_CONDITION_COLORS[condition];

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
