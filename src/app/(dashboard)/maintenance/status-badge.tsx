import { cn } from '@/lib/utils/cn';

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    ASSIGNED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-purple-100 text-purple-800',
    PAUSED: 'bg-orange-100 text-orange-800',
    RESOLVED: 'bg-teal-100 text-teal-800',
    CLOSED: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={cn('px-2 py-1 text-xs font-medium rounded-full', colors[status] || 'bg-gray-100 text-gray-800')}>
      {status.replace('_', ' ')}
    </span>
  );
}
