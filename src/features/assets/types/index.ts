import type { AssetStatus } from '@/constants/status';

export interface Asset {
  id: string;
  orgId: string;
  code: string;
  name: string;
  description?: string | null;
  status: AssetStatus;
  categoryId?: string | null;
  locationId?: string | null;
  assignedToId?: string | null;
  serialNumber?: string | null;
  model?: string | null;
  manufacturer?: string | null;
  purchaseDate?: Date | null;
  purchasePriceCents?: number | null;
  warrantyExpiresAt?: Date | null;
  images: string[];
  documents: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface CreateAssetInput {
  name: string;
  description?: string;
  status?: AssetStatus;
  categoryId?: string;
  locationId?: string;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  purchaseDate?: Date;
  purchasePriceCents?: number;
  warrantyExpiresAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface UpdateAssetInput extends Partial<CreateAssetInput> {
  code?: string;
}

export interface AssetFilters {
  status?: AssetStatus | AssetStatus[];
  categoryId?: string;
  locationId?: string;
  assignedToId?: string;
  search?: string;
  from?: Date;
  to?: Date;
}

export interface AssetCategory {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  parentId?: string | null;
  icon?: string | null;
  color?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
