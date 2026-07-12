import type { MaintenanceStatus, MaintenanceType, WorkOrderPriority } from '@/constants/status';

export interface MaintenanceOrder {
  id: string;
  orgId: string;
  orderNumber: string;
  title: string;
  description?: string | null;
  type: MaintenanceType;
  status: MaintenanceStatus;
  priority: WorkOrderPriority;
  assetId: string;
  assignedToId?: string | null;
  requestedById: string;
  approvedById?: string | null;
  scheduledDate?: Date | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  estimatedDurationMinutes?: number | null;
  actualDurationMinutes?: number | null;
  estimatedCostCents?: number | null;
  actualCostCents?: number | null;
  notes?: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface CreateMaintenanceOrderInput {
  title: string;
  description?: string;
  type: MaintenanceType;
  priority?: WorkOrderPriority;
  assetId: string;
  assignedToId?: string;
  scheduledDate?: Date;
  estimatedDurationMinutes?: number;
  estimatedCostCents?: number;
  notes?: string;
}

export interface UpdateMaintenanceOrderInput extends Partial<CreateMaintenanceOrderInput> {
  status?: MaintenanceStatus;
  startedAt?: Date;
  completedAt?: Date;
  actualDurationMinutes?: number;
  actualCostCents?: number;
}

export interface MaintenanceFilters {
  status?: MaintenanceStatus | MaintenanceStatus[];
  type?: MaintenanceType;
  priority?: WorkOrderPriority;
  assetId?: string;
  assignedToId?: string;
  search?: string;
  from?: Date;
  to?: Date;
}
