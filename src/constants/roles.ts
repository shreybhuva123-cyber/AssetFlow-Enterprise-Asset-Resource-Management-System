import { UserRole } from '@/types/auth';

export { UserRole };

export const ROLE_WEIGHT: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.ORG_ADMIN]: 80,
  [UserRole.ASSET_MANAGER]: 60,
  [UserRole.TECHNICIAN]: 40,
  [UserRole.VIEWER]: 20,
};

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Administrator',
  [UserRole.ORG_ADMIN]: 'Organization Administrator',
  [UserRole.ASSET_MANAGER]: 'Asset Manager',
  [UserRole.TECHNICIAN]: 'Technician',
  [UserRole.VIEWER]: 'Viewer',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Full platform access across all organizations',
  [UserRole.ORG_ADMIN]: 'Full access within an organization, including user management',
  [UserRole.ASSET_MANAGER]: 'Create, update, and retire assets; approve maintenance requests',
  [UserRole.TECHNICIAN]: 'Update work orders and log maintenance activities',
  [UserRole.VIEWER]: 'Read-only access across all modules',
};

export const ROLE_BADGE_COLORS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300',
  [UserRole.ORG_ADMIN]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  [UserRole.ASSET_MANAGER]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  [UserRole.TECHNICIAN]: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  [UserRole.VIEWER]: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

// Defines which roles a given role can manage (create, update, delete)
export const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  [UserRole.SUPER_ADMIN]: [
    UserRole.ORG_ADMIN,
    UserRole.ASSET_MANAGER,
    UserRole.TECHNICIAN,
    UserRole.VIEWER,
  ],
  [UserRole.ORG_ADMIN]: [UserRole.ASSET_MANAGER, UserRole.TECHNICIAN, UserRole.VIEWER],
  [UserRole.ASSET_MANAGER]: [UserRole.TECHNICIAN, UserRole.VIEWER],
  [UserRole.TECHNICIAN]: [],
  [UserRole.VIEWER]: [],
};

export function canManageRole(actor: UserRole, target: UserRole): boolean {
  return ROLE_HIERARCHY[actor]?.includes(target) ?? false;
}

export function isAtLeastRole(role: UserRole, minimum: UserRole): boolean {
  return (ROLE_WEIGHT[role] ?? 0) >= (ROLE_WEIGHT[minimum] ?? 0);
}

export function compareRoles(a: UserRole, b: UserRole): number {
  return (ROLE_WEIGHT[a] ?? 0) - (ROLE_WEIGHT[b] ?? 0);
}
