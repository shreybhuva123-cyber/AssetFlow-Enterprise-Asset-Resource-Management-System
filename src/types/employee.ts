import type { ID, Timestamp } from './api';
import type { UserRole } from './auth';

export interface Employee {
  id: ID;
  userId: ID;
  orgId: ID | null;
  departmentId: ID | null;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  phone: string | null;
  jobTitle: string | null;
  role: UserRole;
  isActive: boolean;
  lastSeenAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface EmployeeWithDepartment extends Employee {
  department: { id: ID; name: string } | null;
}

export interface EmployeeFilters {
  search?: string;
  role?: UserRole;
  departmentId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface UpdateEmployeeInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  jobTitle?: string;
  departmentId?: string | null;
  avatarUrl?: string | null;
  isActive?: boolean;
}

export interface PromoteEmployeeInput {
  role: UserRole;
}
