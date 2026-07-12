import type { DepreciationMethod } from '@/constants/status';

export interface DepreciationSchedule {
  id: string;
  orgId: string;
  assetId: string;
  method: DepreciationMethod;
  purchasePriceCents: number;
  salvageValueCents: number;
  usefulLifeYears: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  entries: DepreciationEntry[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DepreciationEntry {
  id: string;
  scheduleId: string;
  orgId: string;
  assetId: string;
  period: string;
  periodDate: Date;
  openingBookValueCents: number;
  depreciationCents: number;
  closingBookValueCents: number;
  isPosted: boolean;
  postedAt?: Date | null;
  postedById?: string | null;
  createdAt: Date;
}

export interface CreateDepreciationScheduleInput {
  assetId: string;
  method: DepreciationMethod;
  purchasePriceCents: number;
  salvageValueCents: number;
  usefulLifeYears: number;
  startDate: Date;
}

export interface DepreciationFilters {
  assetId?: string;
  method?: DepreciationMethod;
  isActive?: boolean;
  from?: Date;
  to?: Date;
}
