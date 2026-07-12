import {
  format,
  formatDistanceToNow,
  formatDistance,
  isAfter,
  isBefore,
  isValid,
  parseISO,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addDays,
  addMonths,
  addYears,
  subDays,
  subMonths,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
} from 'date-fns';

export function formatDate(date: Date | string | null | undefined, pattern = 'MMM d, yyyy'): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '—';
  return format(d, pattern);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  return formatDate(date, 'MMM d, yyyy h:mm a');
}

export function formatDateShort(date: Date | string | null | undefined): string {
  return formatDate(date, 'MM/dd/yyyy');
}

export function formatRelative(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '—';
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatDuration(start: Date | string, end: Date | string): string {
  const s = typeof start === 'string' ? parseISO(start) : start;
  const e = typeof end === 'string' ? parseISO(end) : end;
  return formatDistance(s, e);
}

export function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const d = typeof value === 'string' ? parseISO(value) : value;
  return isValid(d) ? d : null;
}

export function isDateAfter(date: Date | string, reference: Date | string): boolean {
  return isAfter(
    typeof date === 'string' ? parseISO(date) : date,
    typeof reference === 'string' ? parseISO(reference) : reference,
  );
}

export function isDateBefore(date: Date | string, reference: Date | string): boolean {
  return isBefore(
    typeof date === 'string' ? parseISO(date) : date,
    typeof reference === 'string' ? parseISO(reference) : reference,
  );
}

export function isDateValid(value: unknown): boolean {
  if (!value) return false;
  if (value instanceof Date) return isValid(value);
  if (typeof value === 'string') return isValid(parseISO(value));
  return false;
}

export { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear };
export { addDays, addMonths, addYears, subDays, subMonths };
export { differenceInDays, differenceInMonths, differenceInYears };

export function getDateRangePresets(): Array<{ label: string; from: Date; to: Date }> {
  const now = new Date();
  return [
    { label: 'Today',        from: startOfDay(now),             to: endOfDay(now) },
    { label: 'Last 7 days',  from: startOfDay(subDays(now, 6)), to: endOfDay(now) },
    { label: 'Last 30 days', from: startOfDay(subDays(now, 29)),to: endOfDay(now) },
    { label: 'This month',   from: startOfMonth(now),           to: endOfMonth(now) },
    { label: 'This year',    from: startOfYear(now),            to: endOfYear(now) },
  ];
}
