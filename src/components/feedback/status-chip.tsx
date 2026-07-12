'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import {
  AssetStatus,
  MaintenanceStatus,
  ProcurementStatus,
  ASSET_STATUS_LABELS,
  MAINTENANCE_STATUS_LABELS,
  PROCUREMENT_STATUS_LABELS,
} from '@/constants/status';

type BadgeVariant = 'success' | 'warning' | 'destructive' | 'info' | 'secondary' | 'muted';

const assetStatusVariants: Record<AssetStatus, BadgeVariant> = {
  [AssetStatus.AVAILABLE]:          'success',
  [AssetStatus.ALLOCATED]:          'info',
  [AssetStatus.RESERVED]:           'info',
  [AssetStatus.UNDER_MAINTENANCE]:  'warning',
  [AssetStatus.LOST]:               'destructive',
  [AssetStatus.RETIRED]:            'secondary',
  [AssetStatus.DISPOSED]:           'muted',
};

const maintenanceStatusVariants: Record<MaintenanceStatus, BadgeVariant> = {
  [MaintenanceStatus.PENDING]:     'muted',
  [MaintenanceStatus.SCHEDULED]:   'info',
  [MaintenanceStatus.IN_PROGRESS]: 'warning',
  [MaintenanceStatus.COMPLETED]:   'success',
  [MaintenanceStatus.CANCELLED]:   'destructive',
  [MaintenanceStatus.OVERDUE]:     'destructive',
  [MaintenanceStatus.ON_HOLD]:     'secondary',
};

const procurementStatusVariants: Record<ProcurementStatus, BadgeVariant> = {
  [ProcurementStatus.DRAFT]:              'muted',
  [ProcurementStatus.PENDING_APPROVAL]:   'warning',
  [ProcurementStatus.APPROVED]:           'info',
  [ProcurementStatus.REJECTED]:           'destructive',
  [ProcurementStatus.ORDERED]:            'info',
  [ProcurementStatus.PARTIALLY_RECEIVED]: 'warning',
  [ProcurementStatus.RECEIVED]:           'success',
  [ProcurementStatus.CANCELLED]:          'destructive',
};

interface AssetStatusChipProps { status: AssetStatus; className?: string; dot?: boolean }
export function AssetStatusChip({ status, className, dot }: AssetStatusChipProps) {
  return (
    <Badge variant={assetStatusVariants[status]} dot={dot} className={cn(className)}>
      {ASSET_STATUS_LABELS[status]}
    </Badge>
  );
}

interface MaintenanceStatusChipProps { status: MaintenanceStatus; className?: string; dot?: boolean }
export function MaintenanceStatusChip({ status, className, dot }: MaintenanceStatusChipProps) {
  return (
    <Badge variant={maintenanceStatusVariants[status]} dot={dot} className={cn(className)}>
      {MAINTENANCE_STATUS_LABELS[status]}
    </Badge>
  );
}

interface ProcurementStatusChipProps { status: ProcurementStatus; className?: string; dot?: boolean }
export function ProcurementStatusChip({ status, className, dot }: ProcurementStatusChipProps) {
  return (
    <Badge variant={procurementStatusVariants[status]} dot={dot} className={cn(className)}>
      {PROCUREMENT_STATUS_LABELS[status]}
    </Badge>
  );
}
