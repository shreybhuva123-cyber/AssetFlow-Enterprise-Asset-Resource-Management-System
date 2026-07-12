import type { ID, Timestamp } from './api';

// Roles exactly as defined in the hackathon problem statement
export enum UserRole {
  ADMIN = 'ADMIN',
  ASSET_MANAGER = 'ASSET_MANAGER',
  DEPARTMENT_HEAD = 'DEPARTMENT_HEAD',
  EMPLOYEE = 'EMPLOYEE',
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Admin',
  [UserRole.ASSET_MANAGER]: 'Asset Manager',
  [UserRole.DEPARTMENT_HEAD]: 'Department Head',
  [UserRole.EMPLOYEE]: 'Employee',
};

// Higher number = more privilege
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.ADMIN]: 4,
  [UserRole.ASSET_MANAGER]: 3,
  [UserRole.DEPARTMENT_HEAD]: 2,
  [UserRole.EMPLOYEE]: 1,
};

export interface User {
  id: ID;
  email: string;
  emailVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastSignInAt: Timestamp | null;
}

export interface UserProfile {
  id: ID;
  userId: ID;
  orgId: ID | null;
  departmentId: ID | null;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl: string | null;
  phone: string | null;
  jobTitle: string | null;
  timezone: string;
  locale: string;
  role: UserRole;
  isActive: boolean;
  preferences: Record<string, unknown>;
  lastSeenAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithProfile extends User {
  profile: UserProfile | null;
}

export interface AuthSession {
  user: User;
  profile: UserProfile | null;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface JWTPayload {
  sub: ID;
  email: string;
  role: UserRole;
  orgId: ID | null;
  departmentId: ID | null;
  iat: number;
  exp: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Signup always creates an EMPLOYEE — no role selector
export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordUpdateRequest {
  password: string;
  confirmPassword: string;
  token: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: AuthSession | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  isLoading: boolean;
}
