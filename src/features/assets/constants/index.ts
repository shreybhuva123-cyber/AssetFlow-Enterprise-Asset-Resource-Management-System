import { AssetStatus } from '@/constants/status';

export const ASSET_STATUS_OPTIONS = [
  { value: AssetStatus.ACTIVE,        label: 'Active' },
  { value: AssetStatus.INACTIVE,      label: 'Inactive' },
  { value: AssetStatus.UNDER_MAINTENANCE, label: 'Under Maintenance' },
  { value: AssetStatus.RETIRED,       label: 'Retired' },
  { value: AssetStatus.DISPOSED,      label: 'Disposed' },
  { value: AssetStatus.LOST,          label: 'Lost' },
  { value: AssetStatus.STOLEN,        label: 'Stolen' },
] as const;

export const ASSET_SORT_OPTIONS = [
  { value: 'name:asc',        label: 'Name (A–Z)' },
  { value: 'name:desc',       label: 'Name (Z–A)' },
  { value: 'createdAt:desc',  label: 'Newest first' },
  { value: 'createdAt:asc',   label: 'Oldest first' },
  { value: 'code:asc',        label: 'Asset code' },
] as const;

export const ASSET_CODE_PREFIX = 'AST';
export const ASSET_QUERY_KEY = 'assets' as const;
