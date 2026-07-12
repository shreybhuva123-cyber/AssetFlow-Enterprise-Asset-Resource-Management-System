'use client';
import { cn } from '@/lib/utils/cn';
import {
  ALLOCATION_STATUS_CONFIG,
  BOOKING_STATUS_CONFIG,
  TRANSFER_STATUS_CONFIG,
} from '../constants';

type StatusType = 'allocation' | 'booking' | 'transfer';

interface StatusBadgeProps {
  status: string;
  type: StatusType;
  className?: string;
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const configs = {
    allocation: ALLOCATION_STATUS_CONFIG,
    booking: BOOKING_STATUS_CONFIG,
    transfer: TRANSFER_STATUS_CONFIG,
  };
  const config = configs[type];
  const item = (config as Record<string, { label: string; color: string }>)[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        item?.color ?? 'bg-slate-100 text-slate-600',
        className,
      )}
    >
      {item?.label ?? status}
    </span>
  );
}
