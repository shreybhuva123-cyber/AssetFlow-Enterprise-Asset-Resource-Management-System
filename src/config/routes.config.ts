import { UserRole } from '@/types/auth';

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
    requiredRoles: [UserRole.EMPLOYEE, UserRole.DEPARTMENT_HEAD, UserRole.ASSET_MANAGER, UserRole.ADMIN],
    showInNav: true,
  },
  {
    path: '/maintenance',
    label: 'Maintenance',
    icon: 'Wrench',
    requiredRoles: [UserRole.DEPARTMENT_HEAD, UserRole.ASSET_MANAGER, UserRole.ADMIN],
    showInNav: true,
  },
  {
    path: '/procurement',
    label: 'Procurement',
    icon: 'ShoppingCart',
    requiredRoles: [UserRole.ASSET_MANAGER, UserRole.ADMIN],
    showInNav: true,
  },
  {
    path: '/depreciation',
    label: 'Depreciation',
    icon: 'TrendingDown',
    requiredRoles: [UserRole.ASSET_MANAGER, UserRole.ADMIN],
    showInNav: true,
  },
  {
    path: '/locations',
    label: 'Locations',
    icon: 'MapPin',
    requiredRoles: [UserRole.EMPLOYEE, UserRole.DEPARTMENT_HEAD, UserRole.ASSET_MANAGER, UserRole.ADMIN],
    showInNav: true,
  },
  {
    path: '/reports',
    label: 'Reports',
    icon: 'BarChart3',
    requiredRoles: [UserRole.ASSET_MANAGER, UserRole.ADMIN],
    showInNav: true,
  },
  {
    path: '/audit',
    label: 'Audit Log',
    icon: 'Shield',
    requiredRoles: [UserRole.ADMIN],
    showInNav: true,
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: 'Settings',
    requiredRoles: [UserRole.ADMIN],
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
