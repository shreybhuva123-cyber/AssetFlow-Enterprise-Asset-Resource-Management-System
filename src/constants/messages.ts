export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back! You have been signed in.',
  LOGIN_FAILED: 'Invalid email or password. Please try again.',
  LOGOUT_SUCCESS: 'You have been signed out successfully.',
  REGISTER_SUCCESS: 'Account created successfully. Welcome to AssetFlow!',
  PASSWORD_RESET_SENT: 'Password reset instructions have been sent to your email.',
  PASSWORD_RESET_SUCCESS: 'Your password has been reset successfully.',
  EMAIL_VERIFICATION_SENT: 'Verification email sent. Please check your inbox.',
  EMAIL_VERIFIED: 'Email verified successfully.',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  UNAUTHORIZED: 'You must be signed in to access this resource.',
  FORBIDDEN: 'You do not have permission to perform this action.',
} as const;

export const ASSET_MESSAGES = {
  CREATED: 'Asset created successfully.',
  UPDATED: 'Asset updated successfully.',
  DELETED: 'Asset deleted successfully.',
  RETIRED: 'Asset has been retired.',
  TRANSFERRED: 'Asset transferred successfully.',
  NOT_FOUND: 'Asset not found.',
  IMPORT_SUCCESS: (count: number) => `${count} assets imported successfully.`,
  IMPORT_FAILED: 'Asset import failed. Please check your file and try again.',
  EXPORT_SUCCESS: 'Assets exported successfully.',
  QR_GENERATED: 'QR code generated successfully.',
} as const;

export const MAINTENANCE_MESSAGES = {
  ORDER_CREATED: 'Maintenance order created successfully.',
  ORDER_UPDATED: 'Maintenance order updated.',
  ORDER_COMPLETED: 'Maintenance order marked as complete.',
  ORDER_CANCELLED: 'Maintenance order cancelled.',
  ORDER_ASSIGNED: 'Technician assigned to maintenance order.',
  NOT_FOUND: 'Maintenance order not found.',
} as const;

export const PROCUREMENT_MESSAGES = {
  REQUEST_CREATED: 'Purchase request submitted successfully.',
  REQUEST_APPROVED: 'Purchase request approved.',
  REQUEST_REJECTED: 'Purchase request rejected.',
  REQUEST_UPDATED: 'Purchase request updated.',
  NOT_FOUND: 'Purchase request not found.',
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED: (field: string) => `${field} is required.`,
  MIN_LENGTH: (field: string, min: number) => `${field} must be at least ${min} characters.`,
  MAX_LENGTH: (field: string, max: number) => `${field} must not exceed ${max} characters.`,
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_URL: 'Please enter a valid URL.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  PASSWORDS_MISMATCH: 'Passwords do not match.',
  INVALID_DATE: 'Please enter a valid date.',
  DATE_RANGE_INVALID: 'End date must be after start date.',
  POSITIVE_NUMBER: 'Value must be a positive number.',
  INTEGER_REQUIRED: 'Please enter a whole number.',
} as const;

export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  SERVER: 'Server error. Our team has been notified.',
  NOT_FOUND_PAGE: 'The page you are looking for does not exist.',
  TIMEOUT: 'Request timed out. Please try again.',
  RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
  FILE_TOO_LARGE: (maxMb: number) => `File size must not exceed ${maxMb}MB.`,
  INVALID_FILE_TYPE: 'File type not supported.',
} as const;

export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully.',
  DELETED: 'Deleted successfully.',
  COPIED: 'Copied to clipboard.',
  EXPORTED: 'Export complete.',
  UPLOADED: 'File uploaded successfully.',
  INVITED: 'Invitation sent successfully.',
  SETTINGS_UPDATED: 'Settings updated successfully.',
} as const;

export const EMPTY_STATE_MESSAGES = {
  ASSETS: {
    title: 'No assets yet',
    description: 'Add your first asset to start tracking your organization\'s resources.',
  },
  MAINTENANCE: {
    title: 'No maintenance orders',
    description: 'Maintenance orders will appear here once created.',
  },
  PROCUREMENT: {
    title: 'No purchase requests',
    description: 'Submit a purchase request to begin the procurement workflow.',
  },
  DEPRECIATION: {
    title: 'No depreciation schedules',
    description: 'Depreciation schedules are generated when assets are created.',
  },
  LOCATIONS: {
    title: 'No locations defined',
    description: 'Add locations to organize and track where your assets are deployed.',
  },
  REPORTS: {
    title: 'No reports available',
    description: 'Reports will appear here once you have assets and activity.',
  },
  AUDIT: {
    title: 'No audit entries',
    description: 'Audit log entries are recorded automatically as your team works.',
  },
  SEARCH: {
    title: 'No results found',
    description: 'Try adjusting your search or filters to find what you\'re looking for.',
  },
} as const;

export const CONFIRMATION_MESSAGES = {
  DELETE_ASSET: 'Are you sure you want to delete this asset? This action cannot be undone.',
  RETIRE_ASSET: 'Retiring this asset will remove it from active service. Continue?',
  DELETE_MAINTENANCE: 'Delete this maintenance order permanently?',
  CANCEL_PROCUREMENT: 'Cancel this purchase request?',
  REMOVE_MEMBER: 'Remove this team member from your organization?',
  RESET_SETTINGS: 'Reset all settings to defaults? This cannot be undone.',
} as const;
