import type { ProcurementStatus } from '@/constants/status';

export interface ProcurementRequest {
  id: string;
  orgId: string;
  requestNumber: string;
  title: string;
  description?: string | null;
  status: ProcurementStatus;
  requestedById: string;
  approvedById?: string | null;
  vendorName?: string | null;
  vendorContact?: string | null;
  lineItems: ProcurementLineItem[];
  totalCents: number;
  requiredByDate?: Date | null;
  approvedAt?: Date | null;
  rejectedAt?: Date | null;
  rejectionReason?: string | null;
  notes?: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface ProcurementLineItem {
  id: string;
  requestId: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  notes?: string | null;
}

export interface CreateProcurementInput {
  title: string;
  description?: string;
  vendorName?: string;
  vendorContact?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPriceCents: number;
    notes?: string;
  }>;
  requiredByDate?: Date;
  notes?: string;
}

export interface ProcurementFilters {
  status?: ProcurementStatus | ProcurementStatus[];
  requestedById?: string;
  search?: string;
  from?: Date;
  to?: Date;
}
