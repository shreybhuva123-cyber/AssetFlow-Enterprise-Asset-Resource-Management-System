export const PUBLIC_ROUTES = ['/'] as const;

export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
} as const;

export const DASHBOARD_ROUTES = {
  HOME: '/dashboard',
  ASSETS: {
    LIST: '/dashboard/assets',
    NEW: '/dashboard/assets/new',
    DETAIL: (id: string) => `/dashboard/assets/${id}` as const,
    EDIT: (id: string) => `/dashboard/assets/${id}/edit` as const,
    IMPORT: '/dashboard/assets/import',
  },
  MAINTENANCE: {
    LIST: '/dashboard/maintenance',
    NEW: '/dashboard/maintenance/new',
    DETAIL: (id: string) => `/dashboard/maintenance/${id}` as const,
    CALENDAR: '/dashboard/maintenance/calendar',
  },
  PROCUREMENT: {
    LIST: '/dashboard/procurement',
    NEW: '/dashboard/procurement/new',
    DETAIL: (id: string) => `/dashboard/procurement/${id}` as const,
  },
  DEPRECIATION: {
    LIST: '/dashboard/depreciation',
    SCHEDULES: '/dashboard/depreciation/schedules',
    DETAIL: (id: string) => `/dashboard/depreciation/${id}` as const,
  },
  LOCATIONS: {
    LIST: '/dashboard/locations',
    NEW: '/dashboard/locations/new',
    DETAIL: (id: string) => `/dashboard/locations/${id}` as const,
  },
  REPORTS: {
    HOME: '/dashboard/reports',
    ASSETS: '/dashboard/reports/assets',
    MAINTENANCE: '/dashboard/reports/maintenance',
    DEPRECIATION: '/dashboard/reports/depreciation',
    UTILIZATION: '/dashboard/reports/utilization',
  },
  AUDIT: '/dashboard/audit',
  SETTINGS: {
    HOME: '/dashboard/settings',
    PROFILE: '/dashboard/settings/profile',
    ORGANIZATION: '/dashboard/settings/organization',
    TEAM: '/dashboard/settings/team',
    NOTIFICATIONS: '/dashboard/settings/notifications',
    SECURITY: '/dashboard/settings/security',
  },
} as const;

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
    PROFILE: '/api/auth/profile',
  },
  ASSETS: '/api/assets',
  ASSET: (id: string) => `/api/assets/${id}` as const,
  MAINTENANCE: '/api/maintenance',
  MAINTENANCE_ITEM: (id: string) => `/api/maintenance/${id}` as const,
  PROCUREMENT: '/api/procurement',
  PROCUREMENT_ITEM: (id: string) => `/api/procurement/${id}` as const,
  DEPRECIATION: '/api/depreciation',
  LOCATIONS: '/api/locations',
  REPORTS: '/api/reports',
  AUDIT: '/api/audit',
  AUDIT_BATCH: '/api/audit/batch',
  USERS: '/api/users',
  ORGANIZATIONS: '/api/organizations',
  UPLOAD: '/api/upload',
  EXPORT: '/api/export',
} as const;
