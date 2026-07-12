export enum FeatureFlag {
  REALTIME_DASHBOARD = 'realtime_dashboard',
  ADVANCED_ANALYTICS = 'advanced_analytics',
  BULK_IMPORT = 'bulk_import',
  QR_CODE_ASSET_TAGS = 'qr_code_asset_tags',
  MAINTENANCE_NOTIFICATIONS = 'maintenance_notifications',
  DEPRECIATION_AUTO_POST = 'depreciation_auto_post',
  MULTI_CURRENCY = 'multi_currency',
  MOBILE_APP_SYNC = 'mobile_app_sync',
  AI_PREDICTIVE_MAINTENANCE = 'ai_predictive_maintenance',
  CALENDAR_INTEGRATION = 'calendar_integration',
  PDF_REPORTS = 'pdf_reports',
  BULK_EXPORT = 'bulk_export',
}

export const DEFAULT_FEATURE_FLAGS: Record<FeatureFlag, boolean> = {
  [FeatureFlag.REALTIME_DASHBOARD]: true,
  [FeatureFlag.ADVANCED_ANALYTICS]: true,
  [FeatureFlag.BULK_IMPORT]: true,
  [FeatureFlag.QR_CODE_ASSET_TAGS]: true,
  [FeatureFlag.MAINTENANCE_NOTIFICATIONS]: true,
  [FeatureFlag.DEPRECIATION_AUTO_POST]: false,
  [FeatureFlag.MULTI_CURRENCY]: false,
  [FeatureFlag.MOBILE_APP_SYNC]: false,
  [FeatureFlag.AI_PREDICTIVE_MAINTENANCE]: false,
  [FeatureFlag.CALENDAR_INTEGRATION]: true,
  [FeatureFlag.PDF_REPORTS]: true,
  [FeatureFlag.BULK_EXPORT]: true,
};

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  const envKey = `NEXT_PUBLIC_FF_${flag.toUpperCase()}`;
  const envValue = typeof process !== 'undefined' ? process.env[envKey] : undefined;
  if (envValue !== undefined) return envValue === 'true';
  return DEFAULT_FEATURE_FLAGS[flag] ?? false;
}
