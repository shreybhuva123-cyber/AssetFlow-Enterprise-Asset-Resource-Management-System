export enum AssetStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
  RETIRED = 'RETIRED',
  DISPOSED = 'DISPOSED',
  LOST = 'LOST',
  IN_TRANSIT = 'IN_TRANSIT',
}

export enum MaintenanceStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE',
  ON_HOLD = 'ON_HOLD',
}

export enum ProcurementStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ORDERED = 'ORDERED',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

export enum WorkOrderPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
  EMERGENCY = 'EMERGENCY',
}

export enum MaintenanceType {
  PREVENTIVE = 'PREVENTIVE',
  CORRECTIVE = 'CORRECTIVE',
  PREDICTIVE = 'PREDICTIVE',
  CONDITION_BASED = 'CONDITION_BASED',
  EMERGENCY = 'EMERGENCY',
}

export enum DepreciationMethod {
  STRAIGHT_LINE = 'STRAIGHT_LINE',
  DECLINING_BALANCE = 'DECLINING_BALANCE',
  DOUBLE_DECLINING = 'DOUBLE_DECLINING',
  SUM_OF_YEARS_DIGITS = 'SUM_OF_YEARS_DIGITS',
  UNITS_OF_PRODUCTION = 'UNITS_OF_PRODUCTION',
}

// Labels
export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  [AssetStatus.ACTIVE]: 'Active',
  [AssetStatus.INACTIVE]: 'Inactive',
  [AssetStatus.UNDER_MAINTENANCE]: 'Under Maintenance',
  [AssetStatus.RETIRED]: 'Retired',
  [AssetStatus.DISPOSED]: 'Disposed',
  [AssetStatus.LOST]: 'Lost',
  [AssetStatus.IN_TRANSIT]: 'In Transit',
};

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceStatus, string> = {
  [MaintenanceStatus.PENDING]: 'Pending',
  [MaintenanceStatus.SCHEDULED]: 'Scheduled',
  [MaintenanceStatus.IN_PROGRESS]: 'In Progress',
  [MaintenanceStatus.COMPLETED]: 'Completed',
  [MaintenanceStatus.CANCELLED]: 'Cancelled',
  [MaintenanceStatus.OVERDUE]: 'Overdue',
  [MaintenanceStatus.ON_HOLD]: 'On Hold',
};

export const PROCUREMENT_STATUS_LABELS: Record<ProcurementStatus, string> = {
  [ProcurementStatus.DRAFT]: 'Draft',
  [ProcurementStatus.PENDING_APPROVAL]: 'Pending Approval',
  [ProcurementStatus.APPROVED]: 'Approved',
  [ProcurementStatus.REJECTED]: 'Rejected',
  [ProcurementStatus.ORDERED]: 'Ordered',
  [ProcurementStatus.PARTIALLY_RECEIVED]: 'Partially Received',
  [ProcurementStatus.RECEIVED]: 'Received',
  [ProcurementStatus.CANCELLED]: 'Cancelled',
};

export const PRIORITY_LABELS: Record<WorkOrderPriority, string> = {
  [WorkOrderPriority.LOW]: 'Low',
  [WorkOrderPriority.MEDIUM]: 'Medium',
  [WorkOrderPriority.HIGH]: 'High',
  [WorkOrderPriority.CRITICAL]: 'Critical',
  [WorkOrderPriority.EMERGENCY]: 'Emergency',
};

// Tailwind color classes for badges
export const ASSET_STATUS_COLORS: Record<AssetStatus, string> = {
  [AssetStatus.ACTIVE]: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  [AssetStatus.INACTIVE]: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  [AssetStatus.UNDER_MAINTENANCE]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  [AssetStatus.RETIRED]: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  [AssetStatus.DISPOSED]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  [AssetStatus.LOST]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  [AssetStatus.IN_TRANSIT]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

export const MAINTENANCE_STATUS_COLORS: Record<MaintenanceStatus, string> = {
  [MaintenanceStatus.PENDING]: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  [MaintenanceStatus.SCHEDULED]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  [MaintenanceStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  [MaintenanceStatus.COMPLETED]: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  [MaintenanceStatus.CANCELLED]: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  [MaintenanceStatus.OVERDUE]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  [MaintenanceStatus.ON_HOLD]: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

export const PRIORITY_COLORS: Record<WorkOrderPriority, string> = {
  [WorkOrderPriority.LOW]: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  [WorkOrderPriority.MEDIUM]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  [WorkOrderPriority.HIGH]: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  [WorkOrderPriority.CRITICAL]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  [WorkOrderPriority.EMERGENCY]: 'bg-red-600 text-white dark:bg-red-700',
};
