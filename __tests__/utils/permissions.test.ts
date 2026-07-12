import { userHasPermission } from '../../src/lib/utils/permissions';
import { Permission } from '../../src/constants/permissions';
import { UserRole } from '@prisma/client';

describe('Permissions Utility', () => {
  it('SUPER_ADMIN should have all permissions', () => {
    expect(userHasPermission('SUPER_ADMIN' as UserRole, Permission.ASSETS_CREATE)).toBe(true);
    expect(userHasPermission('SUPER_ADMIN' as UserRole, Permission.SETTINGS_MANAGE)).toBe(true);
  });

  it('EMPLOYEE should not have admin permissions', () => {
    expect(userHasPermission('EMPLOYEE' as UserRole, Permission.SETTINGS_MANAGE)).toBe(false);
  });

  it('EMPLOYEE should have read permissions', () => {
    expect(userHasPermission('EMPLOYEE' as UserRole, Permission.ASSETS_READ)).toBe(true);
  });
});
