import type { ID, Timestamp } from './api';
import type { UserProfile } from './auth';

export interface Department {
  id: ID;
  orgId: ID;
  parentId: ID | null;
  headId: ID | null;
  name: string;
  code: string | null;
  description: string | null;
  isActive: boolean;
  metadata: Record<string, unknown>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt: Timestamp | null;
}

export interface DepartmentWithRelations extends Department {
  parent: Department | null;
  children: Department[];
  head: Pick<UserProfile, 'id' | 'displayName' | 'avatarUrl' | 'role'> | null;
  _count: { members: number };
}

export interface CreateDepartmentInput {
  name: string;
  code?: string;
  description?: string;
  parentId?: string;
  headId?: string;
  isActive?: boolean;
}

export interface UpdateDepartmentInput {
  name?: string;
  code?: string;
  description?: string;
  parentId?: string | null;
  headId?: string | null;
  isActive?: boolean;
}

export interface DepartmentFilters {
  search?: string;
  isActive?: boolean;
  parentId?: string | null;
  page?: number;
  limit?: number;
}
