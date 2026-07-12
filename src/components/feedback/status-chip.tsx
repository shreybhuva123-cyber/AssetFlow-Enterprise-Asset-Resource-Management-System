'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import type { AssetStatus, MaintenanceStatus, ProcurementStatus, WorkOrderStatus } from '@/types';

const assetStatusConfig: Record<AssetStatus, { label: string; variant: 'success' | 'warning' | 'destructive' | 'info' | 'secondary' | 'muted' }> = {
  ACTIVE: { label: 'Active', variant: 'success' },
  INACTIVE: { label: 'Inactive', variant: 'muted' },
  UNDER_MAINTENANCE: { label: 'In Maintenance', variant: 'warning' },
  DISPOSED: { label: 'Disposed', variant: 'destructive' },
  LOST: { label: 'Lost', variant: 'destructive' },
  RESERVED: { label: 'Reserved', variant: 'info' },
  IN_TRANSIT: { label: 'In Transit', variant: 'info' },
  RETIRED: { label: 'Retired', variant: 'secondary' },
};

const maintenanceStatusConfig: Record<MaintenanceStatus, { label: string; variant: 'success' | 'warning' | 'destructive' | 'info' | 'secondary' | 'muted' }> = {
  DRAFT: { label: 'Draft', variant: 'muted' },
  SCHEDULED: { label: 'Scheduled', variant: 'info' },
  IN_PROGRESS: { label: 'In Progress', variant: 'warning' },
  ON_HOLD: { label: 'On Hold', variant: 'secondary' },
  COMPLETED: { label: 'Completed', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
  OVERDUE: { label: 'Overdue', variant: 'destructive' },
};

const procurementStatusConfig: Record<ProcurementStatus, { label: string; variant: 'success' | 'warning' | 'destructive' | 'info' | 'secondary' | 'muted' }> = {
  DRAFT: { label: 'Draft', variant: 'muted' },
  PENDING_APPROVAL: { label: 'Pending Approval', variant: 'warning' },
  APPROVED: { label: 'Approved', variant: 'info' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  ORDERED: { label: 'Ordered', variant: 'info' },
  PARTIALLY_RECEIVED: { label: 'Partial', variant: 'warning' },
  RECEIVED: { label: 'Received', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
  CLOSED: { label: 'Closed', variant: 'secondary' },
};

const workOrderStatusConfig: Record<WorkOrderStatus, { label: string; variant: 'success' | 'warning' | 'destructive' | 'info' | 'secondary' | 'muted' }> = {
  OPEN: { label: 'Open', variant: 'info' },
  IN_PROGRESS: { label: 'In Progress', variant: 'warning' },
  PENDING_PARTS: { label: 'Pending Parts', variant: 'warning' },
  ON_HOLD: { label: 'On Hold', variant: 'secondary' },
  COMPLETED: { label: 'Completed', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
};

interface AssetStatusChipProps {
  status: AssetStatus;
  className?: string;
  dot?: boolean;
}

export function AssetStatusChip({ status, className, dot }: AssetStatusChipProps) {
  const config = assetStatusConfig[status];
  return (
    <Badge variant={config.variant} dot={dot} className={cn(className)}>
      {config.label}
    </Badge>
  );
}

interface MaintenanceStatusChipProps {
  status: MaintenanceStatus;
  className?: string;
  dot?: boolean;
}

export function MaintenanceStatusChip({ status, className, dot }: MaintenanceStatusChipProps) {
  const config = maintenanceStatusConfig[status];
  return (
    <Badge variant={config.variant} dot={dot} className={cn(className)}>
      {config.label}
    </Badge>
  );
}

interface ProcurementStatusChipProps {
  status: ProcurementStatus;
  className?: string;
  dot?: boolean;
}

export function ProcurementStatusChip({ status, className, dot }: ProcurementStatusChipProps) {
  const config = procurementStatusConfig[status];
  return (
    <Badge variant={config.variant} dot={dot} className={cn(className)}>
      {config.label}
    </Badge>
  );
}

interface WorkOrderStatusChipProps {
  status: WorkOrderStatus;
  className?: string;
  dot?: boolean;
}

export function WorkOrderStatusChip({ status, className, dot }: WorkOrderStatusChipProps) {
  const config = workOrderStatusConfig[status];
  return (
    <Badge variant={config.variant} dot={dot} className={cn(className)}>
      {config.label}
    </Badge>
  );
}
