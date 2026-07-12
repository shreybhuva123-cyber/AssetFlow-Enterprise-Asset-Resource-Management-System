import { describe, it, expect } from 'vitest';
import { isAdmin, isAtLeastRole, canPromoteUser, canManageDepartments, canManageCategories } from '@/lib/auth/rbac';
import { UserRole } from '@/types/auth';
import type { UserProfile } from '@/types/auth';

function makeProfile(role: UserRole): UserProfile {
  return {
    id: 'test-id',
    userId: 'user-id',
    orgId: 'org-id',
    departmentId: null,
    firstName: 'Test',
    lastName: 'User',
    displayName: 'Test User',
    avatarUrl: null,
    phone: null,
    jobTitle: null,
    timezone: 'UTC',
    locale: 'en',
    role,
    isActive: true,
    preferences: {},
    lastSeenAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe('RBAC — isAdmin', () => {
  it('returns true only for ADMIN role', () => {
    expect(isAdmin(makeProfile(UserRole.ADMIN))).toBe(true);
    expect(isAdmin(makeProfile(UserRole.ASSET_MANAGER))).toBe(false);
    expect(isAdmin(makeProfile(UserRole.DEPARTMENT_HEAD))).toBe(false);
    expect(isAdmin(makeProfile(UserRole.EMPLOYEE))).toBe(false);
  });
});

describe('RBAC — isAtLeastRole', () => {
  it('respects hierarchy: ADMIN >= ASSET_MANAGER >= DEPARTMENT_HEAD >= EMPLOYEE', () => {
    const admin = makeProfile(UserRole.ADMIN);
    const am = makeProfile(UserRole.ASSET_MANAGER);
    const dh = makeProfile(UserRole.DEPARTMENT_HEAD);
    const emp = makeProfile(UserRole.EMPLOYEE);

    expect(isAtLeastRole(admin, UserRole.ADMIN)).toBe(true);
    expect(isAtLeastRole(admin, UserRole.EMPLOYEE)).toBe(true);
    expect(isAtLeastRole(am, UserRole.ASSET_MANAGER)).toBe(true);
    expect(isAtLeastRole(am, UserRole.ADMIN)).toBe(false);
    expect(isAtLeastRole(dh, UserRole.DEPARTMENT_HEAD)).toBe(true);
    expect(isAtLeastRole(dh, UserRole.ASSET_MANAGER)).toBe(false);
    expect(isAtLeastRole(emp, UserRole.EMPLOYEE)).toBe(true);
    expect(isAtLeastRole(emp, UserRole.DEPARTMENT_HEAD)).toBe(false);
  });
});

describe('RBAC — canPromoteUser', () => {
  const admin = makeProfile(UserRole.ADMIN);
  const am = makeProfile(UserRole.ASSET_MANAGER);

  it('only ADMIN can promote', () => {
    expect(canPromoteUser(admin, UserRole.EMPLOYEE, UserRole.DEPARTMENT_HEAD)).toBe(true);
    expect(canPromoteUser(am, UserRole.EMPLOYEE, UserRole.DEPARTMENT_HEAD)).toBe(false);
  });

  it('cannot promote to ADMIN via promotion endpoint', () => {
    expect(canPromoteUser(admin, UserRole.EMPLOYEE, UserRole.ADMIN)).toBe(false);
  });
});

describe('RBAC — canManageDepartments', () => {
  it('ADMIN and ASSET_MANAGER can manage departments', () => {
    expect(canManageDepartments(makeProfile(UserRole.ADMIN))).toBe(true);
    expect(canManageDepartments(makeProfile(UserRole.ASSET_MANAGER))).toBe(true);
    expect(canManageDepartments(makeProfile(UserRole.DEPARTMENT_HEAD))).toBe(false);
    expect(canManageDepartments(makeProfile(UserRole.EMPLOYEE))).toBe(false);
  });
});

describe('RBAC — canManageCategories', () => {
  it('ADMIN and ASSET_MANAGER can manage categories', () => {
    expect(canManageCategories(makeProfile(UserRole.ADMIN))).toBe(true);
    expect(canManageCategories(makeProfile(UserRole.ASSET_MANAGER))).toBe(true);
    expect(canManageCategories(makeProfile(UserRole.DEPARTMENT_HEAD))).toBe(false);
    expect(canManageCategories(makeProfile(UserRole.EMPLOYEE))).toBe(false);
  });
});
