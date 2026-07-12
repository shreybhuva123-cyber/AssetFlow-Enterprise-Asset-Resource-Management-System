import { AssetStatus, AssetCondition } from '@/constants/status';

export const ASSET_STATUS_OPTIONS = [
  { value: AssetStatus.AVAILABLE,         label: 'Available' },
  { value: AssetStatus.ALLOCATED,         label: 'Allocated' },
  { value: AssetStatus.RESERVED,          label: 'Reserved' },
  { value: AssetStatus.UNDER_MAINTENANCE, label: 'Under Maintenance' },
  { value: AssetStatus.LOST,              label: 'Lost' },
  { value: AssetStatus.RETIRED,           label: 'Retired' },
  { value: AssetStatus.DISPOSED,          label: 'Disposed' },
] as const;

export const ASSET_CONDITION_OPTIONS = [
  { value: AssetCondition.EXCELLENT, label: 'Excellent' },
  { value: AssetCondition.GOOD,      label: 'Good' },
  { value: AssetCondition.FAIR,      label: 'Fair' },
  { value: AssetCondition.POOR,      label: 'Poor' },
  { value: AssetCondition.DAMAGED,   label: 'Damaged' },
] as const;

export const ASSET_SORT_OPTIONS = [
  { value: 'name:asc',         label: 'Name (A–Z)' },
  { value: 'name:desc',        label: 'Name (Z–A)' },
  { value: 'createdAt:desc',   label: 'Newest first' },
  { value: 'createdAt:asc',    label: 'Oldest first' },
  { value: 'assetTag:asc',     label: 'Asset Tag (A–Z)' },
  { value: 'acquisitionCost:desc', label: 'Highest cost' },
] as const;

export const ASSET_TAG_PREFIX = 'AF';
export const ASSET_QUERY_KEY   = 'assets' as const;
