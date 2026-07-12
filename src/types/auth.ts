import type { ID, Timestamp } from './api';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  ASSET_MANAGER = 'ASSET_MANAGER',
  TECHNICIAN = 'TECHNICIAN',
  VIEWER = 'VIEWER',
}

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
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl: string | null;
  phone: string | null;
  timezone: string;
  locale: string;
  role: UserRole;
  orgId: ID | null;
  isActive: boolean;
  preferences: Record<string, unknown>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
  iat: number;
  exp: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  orgName?: string;
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
