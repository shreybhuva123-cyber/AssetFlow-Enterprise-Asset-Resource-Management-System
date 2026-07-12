import { UserRole, ROLE_HIERARCHY } from '@/types/auth';
import type { UserProfile } from '@/types/auth';

export function isAdmin(profile: UserProfile): boolean {
  return profile.role === UserRole.ADMIN;
}

export function isAtLeastRole(profile: UserProfile, minimum: UserRole): boolean {
  return ROLE_HIERARCHY[profile.role] >= ROLE_HIERARCHY[minimum];
}

export function canPromoteUser(actor: UserProfile, targetCurrentRole: UserRole, targetNewRole: UserRole): boolean {
  // Only ADMIN can promote
  if (!isAdmin(actor)) return false;
  // Cannot promote to ADMIN via the user management endpoint (must be done directly)
  if (targetNewRole === UserRole.ADMIN) return false;
  return true;
}

export function canDemoteUser(actor: UserProfile, targetCurrentRole: UserRole): boolean {
  return isAdmin(actor);
}

export function canManageEmployee(actor: UserProfile): boolean {
  return isAdmin(actor);
}

export function canManageDepartments(actor: UserProfile): boolean {
  return isAdmin(actor) || actor.role === UserRole.ASSET_MANAGER;
}

export function canManageCategories(actor: UserProfile): boolean {
  return isAdmin(actor) || actor.role === UserRole.ASSET_MANAGER;
}
