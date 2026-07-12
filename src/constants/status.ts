// Asset Status — Phase 3 enterprise states
export enum AssetStatus {
  AVAILABLE         = 'AVAILABLE',
  ALLOCATED         = 'ALLOCATED',
  RESERVED          = 'RESERVED',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
  LOST              = 'LOST',
  RETIRED           = 'RETIRED',
  DISPOSED          = 'DISPOSED',
}

export enum AssetCondition {
  EXCELLENT = 'EXCELLENT',
  GOOD      = 'GOOD',
  FAIR      = 'FAIR',
  POOR      = 'POOR',
  DAMAGED   = 'DAMAGED',
  LOST      = 'LOST',
  DISPOSED  = 'DISPOSED',
}

export enum MaintenanceStatus {
  PENDING     = 'PENDING',
  SCHEDULED   = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED   = 'COMPLETED',
  CANCELLED   = 'CANCELLED',
  OVERDUE     = 'OVERDUE',
  ON_HOLD     = 'ON_HOLD',
}

export enum ProcurementStatus {
  DRAFT              = 'DRAFT',
  PENDING_APPROVAL   = 'PENDING_APPROVAL',
  APPROVED           = 'APPROVED',
  REJECTED           = 'REJECTED',
  ORDERED            = 'ORDERED',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  RECEIVED           = 'RECEIVED',
  CANCELLED          = 'CANCELLED',
}

export enum WorkOrderPriority {
  LOW       = 'LOW',
  MEDIUM    = 'MEDIUM',
  HIGH      = 'HIGH',
  CRITICAL  = 'CRITICAL',
  EMERGENCY = 'EMERGENCY',
}

export enum MaintenanceType {
  PREVENTIVE      = 'PREVENTIVE',
  CORRECTIVE      = 'CORRECTIVE',
  PREDICTIVE      = 'PREDICTIVE',
  CONDITION_BASED = 'CONDITION_BASED',
  EMERGENCY       = 'EMERGENCY',
}

export enum DepreciationMethod {
  STRAIGHT_LINE       = 'STRAIGHT_LINE',
  DECLINING_BALANCE   = 'DECLINING_BALANCE',
  DOUBLE_DECLINING    = 'DOUBLE_DECLINING',
  SUM_OF_YEARS_DIGITS = 'SUM_OF_YEARS_DIGITS',
  UNITS_OF_PRODUCTION = 'UNITS_OF_PRODUCTION',
}

// ─── Labels ────────────────────────────────────────────────────────────────

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  [AssetStatus.AVAILABLE]:          'Available',
  [AssetStatus.ALLOCATED]:          'Allocated',
  [AssetStatus.RESERVED]:           'Reserved',
  [AssetStatus.UNDER_MAINTENANCE]:  'Under Maintenance',
  [AssetStatus.LOST]:               'Lost',
  [AssetStatus.RETIRED]:            'Retired',
  [AssetStatus.DISPOSED]:           'Disposed',
};

export const ASSET_CONDITION_LABELS: Record<AssetCondition, string> = {
  [AssetCondition.EXCELLENT]: 'Excellent',
  [AssetCondition.GOOD]:      'Good',
  [AssetCondition.FAIR]:      'Fair',
  [AssetCondition.POOR]:      'Poor',
  [AssetCondition.DAMAGED]:   'Damaged',
  [AssetCondition.LOST]:      'Lost',
  [AssetCondition.DISPOSED]:  'Disposed',
};

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceStatus, string> = {
  [MaintenanceStatus.PENDING]:     'Pending',
  [MaintenanceStatus.SCHEDULED]:   'Scheduled',
  [MaintenanceStatus.IN_PROGRESS]: 'In Progress',
  [MaintenanceStatus.COMPLETED]:   'Completed',
  [MaintenanceStatus.CANCELLED]:   'Cancelled',
  [MaintenanceStatus.OVERDUE]:     'Overdue',
  [MaintenanceStatus.ON_HOLD]:     'On Hold',
};

export const PROCUREMENT_STATUS_LABELS: Record<ProcurementStatus, string> = {
  [ProcurementStatus.DRAFT]:              'Draft',
  [ProcurementStatus.PENDING_APPROVAL]:   'Pending Approval',
  [ProcurementStatus.APPROVED]:           'Approved',
  [ProcurementStatus.REJECTED]:           'Rejected',
  [ProcurementStatus.ORDERED]:            'Ordered',
  [ProcurementStatus.PARTIALLY_RECEIVED]: 'Partially Received',
  [ProcurementStatus.RECEIVED]:           'Received',
  [ProcurementStatus.CANCELLED]:          'Cancelled',
};

export const PRIORITY_LABELS: Record<WorkOrderPriority, string> = {
  [WorkOrderPriority.LOW]:       'Low',
  [WorkOrderPriority.MEDIUM]:    'Medium',
  [WorkOrderPriority.HIGH]:      'High',
  [WorkOrderPriority.CRITICAL]:  'Critical',
  [WorkOrderPriority.EMERGENCY]: 'Emergency',
};

// ─── Tailwind color classes ─────────────────────────────────────────────────

export const ASSET_STATUS_COLORS: Record<AssetStatus, string> = {
  [AssetStatus.AVAILABLE]:          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  [AssetStatus.ALLOCATED]:          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  [AssetStatus.RESERVED]:           'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  [AssetStatus.UNDER_MAINTENANCE]:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  [AssetStatus.LOST]:               'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  [AssetStatus.RETIRED]:            'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  [AssetStatus.DISPOSED]:           'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export const ASSET_CONDITION_COLORS: Record<AssetCondition, string> = {
  [AssetCondition.EXCELLENT]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  [AssetCondition.GOOD]:      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  [AssetCondition.FAIR]:      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  [AssetCondition.POOR]:      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  [AssetCondition.DAMAGED]:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  [AssetCondition.LOST]:      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  [AssetCondition.DISPOSED]:  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export const MAINTENANCE_STATUS_COLORS: Record<MaintenanceStatus, string> = {
  [MaintenanceStatus.PENDING]:     'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  [MaintenanceStatus.SCHEDULED]:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  [MaintenanceStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  [MaintenanceStatus.COMPLETED]:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  [MaintenanceStatus.CANCELLED]:   'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  [MaintenanceStatus.OVERDUE]:     'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  [MaintenanceStatus.ON_HOLD]:     'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

export const PRIORITY_COLORS: Record<WorkOrderPriority, string> = {
  [WorkOrderPriority.LOW]:       'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  [WorkOrderPriority.MEDIUM]:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  [WorkOrderPriority.HIGH]:      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  [WorkOrderPriority.CRITICAL]:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  [WorkOrderPriority.EMERGENCY]: 'bg-red-600 text-white dark:bg-red-700',
};

// ─── State Machine ──────────────────────────────────────────────────────────
// Defines allowed transitions for the Asset status state machine.
// Key = current status, Value = allowed next statuses.

export const ASSET_STATUS_TRANSITIONS: Record<AssetStatus, AssetStatus[]> = {
  [AssetStatus.AVAILABLE]:         [AssetStatus.ALLOCATED, AssetStatus.RESERVED, AssetStatus.UNDER_MAINTENANCE, AssetStatus.RETIRED, AssetStatus.LOST],
  [AssetStatus.ALLOCATED]:         [AssetStatus.AVAILABLE, AssetStatus.UNDER_MAINTENANCE, AssetStatus.LOST],
  [AssetStatus.RESERVED]:          [AssetStatus.AVAILABLE, AssetStatus.ALLOCATED],
  [AssetStatus.UNDER_MAINTENANCE]: [AssetStatus.AVAILABLE, AssetStatus.RETIRED, AssetStatus.DISPOSED],
  [AssetStatus.LOST]:              [AssetStatus.AVAILABLE, AssetStatus.DISPOSED],
  [AssetStatus.RETIRED]:           [AssetStatus.DISPOSED],
  [AssetStatus.DISPOSED]:          [],
};
