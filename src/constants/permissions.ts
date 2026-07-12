import { UserRole } from '@/types/auth';

export enum Permission {
  // Assets
  ASSETS_CREATE = 'assets.create',
  ASSETS_READ = 'assets.read',
  ASSETS_UPDATE = 'assets.update',
  ASSETS_DELETE = 'assets.delete',
  ASSETS_EXPORT = 'assets.export',
  ASSETS_IMPORT = 'assets.import',
  ASSETS_RETIRE = 'assets.retire',
  ASSETS_TRANSFER = 'assets.transfer',
  // Maintenance
  MAINTENANCE_CREATE = 'maintenance.create',
  MAINTENANCE_READ = 'maintenance.read',
  MAINTENANCE_UPDATE = 'maintenance.update',
  MAINTENANCE_DELETE = 'maintenance.delete',
  MAINTENANCE_ASSIGN = 'maintenance.assign',
  MAINTENANCE_APPROVE = 'maintenance.approve',
  // Procurement
  PROCUREMENT_CREATE = 'procurement.create',
  PROCUREMENT_READ = 'procurement.read',
  PROCUREMENT_UPDATE = 'procurement.update',
  PROCUREMENT_DELETE = 'procurement.delete',
  PROCUREMENT_APPROVE = 'procurement.approve',
  PROCUREMENT_REJECT = 'procurement.reject',
  // Depreciation
  DEPRECIATION_READ = 'depreciation.read',
  DEPRECIATION_MANAGE = 'depreciation.manage',
  DEPRECIATION_POST = 'depreciation.post',
  // Locations
  LOCATIONS_CREATE = 'locations.create',
  LOCATIONS_READ = 'locations.read',
  LOCATIONS_UPDATE = 'locations.update',
  LOCATIONS_DELETE = 'locations.delete',
  // Reports
  REPORTS_VIEW = 'reports.view',
  REPORTS_EXPORT = 'reports.export',
  REPORTS_SCHEDULE = 'reports.schedule',
  // Audit
  AUDIT_READ = 'audit.read',
  AUDIT_EXPORT = 'audit.export',
  // Users
  USERS_CREATE = 'users.create',
  USERS_READ = 'users.read',
  USERS_UPDATE = 'users.update',
  USERS_DELETE = 'users.delete',
  USERS_MANAGE_ROLES = 'users.manage_roles',
  // Organization
  ORG_READ = 'org.read',
  ORG_UPDATE = 'org.update',
  ORG_MANAGE_SETTINGS = 'org.manage_settings',
  // Settings
  SETTINGS_READ = 'settings.read',
  SETTINGS_UPDATE = 'settings.update',
}

const VIEWER_PERMISSIONS: Permission[] = [
  Permission.ASSETS_READ,
  Permission.MAINTENANCE_READ,
  Permission.PROCUREMENT_READ,
  Permission.DEPRECIATION_READ,
  Permission.LOCATIONS_READ,
  Permission.REPORTS_VIEW,
  Permission.ORG_READ,
  Permission.SETTINGS_READ,
];

const TECHNICIAN_PERMISSIONS: Permission[] = [
  ...VIEWER_PERMISSIONS,
  Permission.MAINTENANCE_UPDATE,
  Permission.ASSETS_UPDATE,
];

const ASSET_MANAGER_PERMISSIONS: Permission[] = [
  ...TECHNICIAN_PERMISSIONS,
  Permission.ASSETS_CREATE,
  Permission.ASSETS_DELETE,
  Permission.ASSETS_EXPORT,
  Permission.ASSETS_IMPORT,
  Permission.ASSETS_RETIRE,
  Permission.ASSETS_TRANSFER,
  Permission.MAINTENANCE_CREATE,
  Permission.MAINTENANCE_DELETE,
  Permission.MAINTENANCE_ASSIGN,
  Permission.MAINTENANCE_APPROVE,
  Permission.PROCUREMENT_CREATE,
  Permission.PROCUREMENT_UPDATE,
  Permission.PROCUREMENT_DELETE,
  Permission.DEPRECIATION_MANAGE,
  Permission.LOCATIONS_CREATE,
  Permission.LOCATIONS_UPDATE,
  Permission.LOCATIONS_DELETE,
  Permission.REPORTS_EXPORT,
  Permission.AUDIT_READ,
  Permission.USERS_READ,
];

const ORG_ADMIN_PERMISSIONS: Permission[] = [
  ...ASSET_MANAGER_PERMISSIONS,
  Permission.PROCUREMENT_APPROVE,
  Permission.PROCUREMENT_REJECT,
  Permission.DEPRECIATION_POST,
  Permission.REPORTS_SCHEDULE,
  Permission.AUDIT_EXPORT,
  Permission.USERS_CREATE,
  Permission.USERS_UPDATE,
  Permission.USERS_DELETE,
  Permission.USERS_MANAGE_ROLES,
  Permission.ORG_UPDATE,
  Permission.ORG_MANAGE_SETTINGS,
  Permission.SETTINGS_UPDATE,
];

const SUPER_ADMIN_PERMISSIONS: Permission[] = Object.values(Permission);

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]:           ORG_ADMIN_PERMISSIONS,
  [UserRole.ASSET_MANAGER]:   ASSET_MANAGER_PERMISSIONS,
  [UserRole.DEPARTMENT_HEAD]: TECHNICIAN_PERMISSIONS,
  [UserRole.EMPLOYEE]:        VIEWER_PERMISSIONS,
};

export function hasPermission(
  userPermissions: Permission[],
  required: Permission
): boolean {
  return userPermissions.includes(required);
}

export function hasAllPermissions(
  userPermissions: Permission[],
  required: Permission[]
): boolean {
  const set = new Set(userPermissions);
  return required.every((p) => set.has(p));
}

export function hasAnyPermission(
  userPermissions: Permission[],
  required: Permission[]
): boolean {
  const set = new Set(userPermissions);
  return required.some((p) => set.has(p));
}

export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
