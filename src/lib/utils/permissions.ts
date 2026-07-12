import type { UserRole } from '@/types/auth';
import { Permission, ROLE_PERMISSIONS } from '@/constants/permissions';
import { ROLE_WEIGHT } from '@/constants/roles';

export function getUserPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function userHasPermission(role: UserRole, permission: Permission): boolean {
  return getUserPermissions(role).includes(permission);
}

export function userHasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  const userPerms = getUserPermissions(role);
  return permissions.every((p) => userPerms.includes(p));
}

export function userHasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  const userPerms = getUserPermissions(role);
  return permissions.some((p) => userPerms.includes(p));
}

export function isAtLeastRole(role: UserRole, minimum: UserRole): boolean {
  return (ROLE_WEIGHT[role] ?? 0) >= (ROLE_WEIGHT[minimum] ?? 0);
}

export function canManageRole(actorRole: UserRole, targetRole: UserRole): boolean {
  const actorWeight = ROLE_WEIGHT[actorRole] ?? 0;
  const targetWeight = ROLE_WEIGHT[targetRole] ?? 0;
  return actorWeight > targetWeight;
}

export function getHighestRole(roles: UserRole[]): UserRole | null {
  if (roles.length === 0) return null;
  return roles.reduce((highest, role) =>
    (ROLE_WEIGHT[role] ?? 0) > (ROLE_WEIGHT[highest] ?? 0) ? role : highest,
  );
}

export function filterPermissionsForRole(
  permissions: Permission[],
  role: UserRole,
): Permission[] {
  const rolePerms = new Set(getUserPermissions(role));
  return permissions.filter((p) => rolePerms.has(p));
}
