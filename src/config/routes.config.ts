import type { UserRole } from '@/types/auth';

export interface RouteConfig {
  path: string;
  label: string;
  icon?: string;
  requiredRoles?: UserRole[];
  isPublic?: boolean;
  showInNav?: boolean;
}

export const publicRoutes: string[] = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/unauthorized',
  '/maintenance',
];

export const authRoutes: string[] = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

export const protectedRoutes: RouteConfig[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    showInNav: true,
  },
  {
    path: '/assets',
    label: 'Assets',
    icon: 'Package',
    requiredRoles: ['VIEWER', 'TECHNICIAN', 'ASSET_MANAGER', 'ORG_ADMIN', 'SUPER_ADMIN'],
    showInNav: true,
  },
  {
    path: '/maintenance',
    label: 'Maintenance',
    icon: 'Wrench',
    requiredRoles: ['TECHNICIAN', 'ASSET_MANAGER', 'ORG_ADMIN', 'SUPER_ADMIN'],
    showInNav: true,
  },
  {
    path: '/procurement',
    label: 'Procurement',
    icon: 'ShoppingCart',
    requiredRoles: ['ASSET_MANAGER', 'ORG_ADMIN', 'SUPER_ADMIN'],
    showInNav: true,
  },
  {
    path: '/depreciation',
    label: 'Depreciation',
    icon: 'TrendingDown',
    requiredRoles: ['ASSET_MANAGER', 'ORG_ADMIN', 'SUPER_ADMIN'],
    showInNav: true,
  },
  {
    path: '/locations',
    label: 'Locations',
    icon: 'MapPin',
    requiredRoles: ['VIEWER', 'TECHNICIAN', 'ASSET_MANAGER', 'ORG_ADMIN', 'SUPER_ADMIN'],
    showInNav: true,
  },
  {
    path: '/reports',
    label: 'Reports',
    icon: 'BarChart3',
    requiredRoles: ['ASSET_MANAGER', 'ORG_ADMIN', 'SUPER_ADMIN'],
    showInNav: true,
  },
  {
    path: '/audit',
    label: 'Audit Log',
    icon: 'Shield',
    requiredRoles: ['ORG_ADMIN', 'SUPER_ADMIN'],
    showInNav: true,
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: 'Settings',
    requiredRoles: ['ORG_ADMIN', 'SUPER_ADMIN'],
    showInNav: true,
  },
  {
    path: '/admin',
    label: 'Admin',
    icon: 'Crown',
    requiredRoles: ['SUPER_ADMIN'],
    showInNav: true,
  },
];

export const routesConfig = {
  public: publicRoutes,
  auth: authRoutes,
  protected: protectedRoutes,

  defaultRedirect: '/dashboard',
  loginPath: '/login',
  logoutPath: '/login',
  notFoundPath: '/not-found',
  errorPath: '/error',
  unauthorizedPath: '/unauthorized',
  onboardingPath: '/onboarding',

  api: {
    prefix: '/api',
    version: 'v1',
    baseUrl: '/api',
  },
} as const;

export type RoutesConfig = typeof routesConfig;
