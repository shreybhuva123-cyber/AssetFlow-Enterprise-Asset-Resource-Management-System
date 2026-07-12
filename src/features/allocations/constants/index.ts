import { cn } from '@/lib/utils/cn';

export const ALLOCATION_STATUS_CONFIG = {
  ACTIVE:           { label: 'Active',           color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  RETURNED:         { label: 'Returned',         color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  PENDING_APPROVAL: { label: 'Pending Approval', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  CANCELLED:        { label: 'Cancelled',        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  OVERDUE:          { label: 'Overdue',          color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
} as const;

export const TRANSFER_STATUS_CONFIG = {
  REQUESTED:        { label: 'Requested',        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  PENDING_APPROVAL: { label: 'Pending Approval', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  APPROVED:         { label: 'Approved',         color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  REJECTED:         { label: 'Rejected',         color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  COMPLETED:        { label: 'Completed',        color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  CANCELLED:        { label: 'Cancelled',        color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
} as const;

export const BOOKING_STATUS_CONFIG = {
  UPCOMING:  { label: 'Upcoming',  color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  ONGOING:   { label: 'Ongoing',   color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  COMPLETED: { label: 'Completed', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  EXPIRED:   { label: 'Expired',   color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
} as const;

export const PRIORITY_CONFIG = {
  LOW:    { label: 'Low',    color: 'text-slate-500' },
  NORMAL: { label: 'Normal', color: 'text-blue-500' },
  HIGH:   { label: 'High',   color: 'text-amber-500' },
  URGENT: { label: 'Urgent', color: 'text-red-500' },
} as const;

export const RESOURCE_TYPE_CONFIG = {
  MEETING_ROOM:         { label: 'Meeting Room',         icon: '🏢' },
  PROJECTOR:            { label: 'Projector',            icon: '📽️' },
  VEHICLE:              { label: 'Vehicle',              icon: '🚗' },
  CONFERENCE_EQUIPMENT: { label: 'Conference Equipment', icon: '🎙️' },
  SHARED_LAPTOP:        { label: 'Shared Laptop',        icon: '💻' },
  OTHER:                { label: 'Other',                icon: '📦' },
} as const;

export const RETURN_CONDITION_CONFIG = {
  EXCELLENT: { label: 'Excellent', color: 'text-emerald-600' },
  GOOD:      { label: 'Good',      color: 'text-blue-600' },
  FAIR:      { label: 'Fair',      color: 'text-amber-600' },
  POOR:      { label: 'Poor',      color: 'text-orange-600' },
  DAMAGED:   { label: 'Damaged',   color: 'text-red-600' },
  LOST:      { label: 'Lost',      color: 'text-red-800' },
} as const;

export function statusBadgeClass(status: string, config: Record<string, { color: string }>) {
  return cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', config[status]?.color ?? 'bg-slate-100 text-slate-600');
}
