import { UserRole } from '@/types/auth';

export { UserRole };

/** Numeric weight — higher = more privilege */
export const ROLE_WEIGHT: Record<UserRole, number> = {
  [UserRole.ADMIN]:           100,
  [UserRole.ASSET_MANAGER]:    60,
  [UserRole.DEPARTMENT_HEAD]:  40,
  [UserRole.EMPLOYEE]:         20,
};

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [UserRole.ADMIN]:           'Administrator',
  [UserRole.ASSET_MANAGER]:   'Asset Manager',
  [UserRole.DEPARTMENT_HEAD]: 'Department Head',
  [UserRole.EMPLOYEE]:        'Employee',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.ADMIN]:           'Full platform access — user management, all assets, all reports',
  [UserRole.ASSET_MANAGER]:   'Create, update, and retire assets; approve maintenance requests',
  [UserRole.DEPARTMENT_HEAD]: 'Manage department assets and view department reports',
  [UserRole.EMPLOYEE]:        'View assigned assets and submit maintenance requests',
};

export const ROLE_BADGE_COLORS: Record<UserRole, string> = {
  [UserRole.ADMIN]:           'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  [UserRole.ASSET_MANAGER]:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  [UserRole.DEPARTMENT_HEAD]: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  [UserRole.EMPLOYEE]:        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

/** Which roles a given role can promote/demote (management scope) */
export const ROLE_MANAGEMENT_SCOPE: Record<UserRole, UserRole[]> = {
  [UserRole.ADMIN]:           [UserRole.ASSET_MANAGER, UserRole.DEPARTMENT_HEAD, UserRole.EMPLOYEE],
  [UserRole.ASSET_MANAGER]:   [],
  [UserRole.DEPARTMENT_HEAD]: [],
  [UserRole.EMPLOYEE]:        [],
};

export function canManageRole(actor: UserRole, target: UserRole): boolean {
  return ROLE_MANAGEMENT_SCOPE[actor]?.includes(target) ?? false;
}

export function isAtLeastRole(role: UserRole, minimum: UserRole): boolean {
  return (ROLE_WEIGHT[role] ?? 0) >= (ROLE_WEIGHT[minimum] ?? 0);
}

export function compareRoles(a: UserRole, b: UserRole): number {
  return (ROLE_WEIGHT[a] ?? 0) - (ROLE_WEIGHT[b] ?? 0);
}
