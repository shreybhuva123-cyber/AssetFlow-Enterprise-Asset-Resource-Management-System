import type { ID, Timestamp } from './api';

export type DynamicFieldType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'url';

export interface DynamicField {
  id: string;
  name: string;
  label: string;
  type: DynamicFieldType;
  required: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
}

export interface AssetCategory {
  id: ID;
  orgId: ID;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  dynamicFields: DynamicField[];
  isActive: boolean;
  sortOrder: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt: Timestamp | null;
}

export interface CreateAssetCategoryInput {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  dynamicFields?: DynamicField[];
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateAssetCategoryInput {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  dynamicFields?: DynamicField[];
  isActive?: boolean;
  sortOrder?: number;
}

export interface AssetCategoryFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}
