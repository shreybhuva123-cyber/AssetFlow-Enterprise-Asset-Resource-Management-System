import { MaintenanceStatus, MaintenanceType, WorkOrderPriority } from '@/constants/status';

export const MAINTENANCE_STATUS_OPTIONS = [
  { value: MaintenanceStatus.PENDING,     label: 'Pending' },
  { value: MaintenanceStatus.APPROVED,    label: 'Approved' },
  { value: MaintenanceStatus.IN_PROGRESS, label: 'In Progress' },
  { value: MaintenanceStatus.ON_HOLD,     label: 'On Hold' },
  { value: MaintenanceStatus.COMPLETED,   label: 'Completed' },
  { value: MaintenanceStatus.CANCELLED,   label: 'Cancelled' },
] as const;

export const MAINTENANCE_TYPE_OPTIONS = [
  { value: MaintenanceType.PREVENTIVE,  label: 'Preventive' },
  { value: MaintenanceType.CORRECTIVE,  label: 'Corrective' },
  { value: MaintenanceType.PREDICTIVE,  label: 'Predictive' },
  { value: MaintenanceType.EMERGENCY,   label: 'Emergency' },
  { value: MaintenanceType.INSPECTION,  label: 'Inspection' },
] as const;

export const PRIORITY_OPTIONS = [
  { value: WorkOrderPriority.LOW,      label: 'Low' },
  { value: WorkOrderPriority.MEDIUM,   label: 'Medium' },
  { value: WorkOrderPriority.HIGH,     label: 'High' },
  { value: WorkOrderPriority.CRITICAL, label: 'Critical' },
] as const;

export const MAINTENANCE_QUERY_KEY = 'maintenance' as const;
export const MAINTENANCE_ORDER_PREFIX = 'WO';
