import type { ID, Timestamp } from './api';

export type { ID, Timestamp };

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export interface BaseEntity {
  id: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt: Timestamp | null;
  createdBy: ID | null;
}

export interface Timestamped {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SoftDeletable {
  deletedAt: Timestamp | null;
}

export interface Auditable extends Timestamped, SoftDeletable {
  createdBy: ID | null;
  updatedBy: ID | null;
}

export interface OwnedByOrg {
  orgId: ID;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface SortParams<T = string> {
  sortBy: T;
  sortDirection: SortDirection;
}

export enum FilterOperator {
  EQUALS = 'eq',
  NOT_EQUALS = 'neq',
  CONTAINS = 'contains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  GREATER_THAN = 'gt',
  LESS_THAN = 'lt',
  GREATER_OR_EQUAL = 'gte',
  LESS_OR_EQUAL = 'lte',
  IN = 'in',
  NOT_IN = 'notIn',
  IS_NULL = 'isNull',
  IS_NOT_NULL = 'isNotNull',
}

export interface FilterParams<T = Record<string, unknown>> {
  field: keyof T & string;
  operator: FilterOperator;
  value?: unknown;
}

export interface QueryOptions<T = Record<string, unknown>> {
  pagination?: PaginationParams;
  sort?: SortParams;
  filters?: FilterParams<T>[];
  includeDeleted?: boolean;
  search?: string;
}
