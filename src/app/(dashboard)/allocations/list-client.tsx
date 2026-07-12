'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  RefreshCw,
  Eye,
  RotateCcw,
  PackageCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  Loader2,
} from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/features/allocations/components/status-badge';
import { ReturnDialog } from '@/features/allocations/components/return-dialog';
import { notify } from '@/lib/toast';

interface AllocationStats {
  active: number;
  overdue: number;
  pendingApproval: number;
  returnedThisMonth: number;
}

interface Allocation {
  id: string;
  asset: { id: string; assetTag: string; name: string };
  assignedTo: { id: string; name: string; email: string };
  department?: { id: string; name: string } | null;
  allocationDate: string;
  expectedReturnDate?: string | null;
  status: string;
  purpose?: string | null;
}

interface PaginatedResponse {
  data: Allocation[];
  total: number;
  page: number;
  pageSize: number;
}

function StatCard({
  title,
  value,
  icon: Icon,
  colorClass,
  loading,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  colorClass: string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`rounded-lg p-2 ${colorClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-16 animate-pulse rounded bg-muted" />
        ) : (
          <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        )}
      </CardContent>
    </Card>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 overflow-hidden">
      <div className="bg-muted/30 h-12 border-b border-border/60 animate-pulse" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-14 border-b border-border/30 animate-pulse" />
      ))}
    </div>
  );
}

export function AllocationListClient() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<AllocationStats>({
    active: 0,
    overdue: 0,
    pendingApproval: 0,
    returnedThisMonth: 0,
  });
  const [loadingList, setLoadingList] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);

  const pageSize = 10;

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await fetch('/api/allocations/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // silently fail stats
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchAllocations = useCallback(async () => {
    setLoadingList(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (search) params.set('search', search);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);

      const res = await fetch(`/api/allocations?${params}`);
      if (!res.ok) throw new Error('Failed to fetch allocations');
      const json: PaginatedResponse = await res.json();
      setAllocations(json.data);
      setTotal(json.total);
    } catch {
      notify.error('Failed to load allocations');
    } finally {
      setLoadingList(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const timer = setTimeout(() => fetchAllocations(), 300);
    return () => clearTimeout(timer);
  }, [fetchAllocations]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Allocations"
          value={stats.active}
          icon={PackageCheck}
          colorClass="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          loading={loadingStats}
        />
        <StatCard
          title="Overdue Returns"
          value={stats.overdue}
          icon={AlertCircle}
          colorClass="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
          loading={loadingStats}
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApproval}
          icon={Clock}
          colorClass="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          loading={loadingStats}
        />
        <StatCard
          title="Returned This Month"
          value={stats.returnedThisMonth}
          icon={CheckCircle2}
          colorClass="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          loading={loadingStats}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="allocation-search"
            placeholder="Search by asset, tag, or employee..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger id="allocation-status-filter" className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
            <SelectItem value="OVERDUE">Overdue</SelectItem>
            <SelectItem value="RETURNED">Returned</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            fetchAllocations();
            fetchStats();
          }}
          id="allocation-refresh-btn"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      {loadingList ? (
        <TableSkeleton />
      ) : allocations.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card p-12 text-center">
          <PackageCheck className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold">No allocations found</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            {search || statusFilter !== 'ALL'
              ? 'Try adjusting your filters'
              : 'Get started by allocating an asset to an employee'}
          </p>
          {!search && statusFilter === 'ALL' && (
            <Button asChild className="mt-4" id="empty-allocate-btn">
              <Link href="/allocations/new">
                <Plus className="h-4 w-4 mr-2" />
                Allocate Asset
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Asset</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Assigned To
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                      Department
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">
                      Allocated
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">
                      Expected Return
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map((allocation) => (
                    <tr
                      key={allocation.id}
                      className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{allocation.asset.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {allocation.asset.assetTag}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{allocation.assignedTo.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {allocation.assignedTo.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                        {allocation.department?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                        {format(new Date(allocation.allocationDate), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                        {allocation.expectedReturnDate
                          ? format(new Date(allocation.expectedReturnDate), 'MMM d, yyyy')
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={allocation.status} type="allocation" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            id={`view-allocation-${allocation.id}`}
                          >
                            <Link href={`/allocations/${allocation.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {allocation.status === 'ACTIVE' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              id={`return-allocation-${allocation.id}`}
                              title="Return Asset"
                              onClick={() => {
                                setSelectedAllocation(allocation);
                                setReturnDialogOpen(true);
                              }}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  id="allocation-prev-page"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  id="allocation-next-page"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Return Dialog */}
      {selectedAllocation && (
        <ReturnDialog
          open={returnDialogOpen}
          onOpenChange={setReturnDialogOpen}
          allocationId={selectedAllocation.id}
          onSuccess={() => {
            setSelectedAllocation(null);
            fetchAllocations();
            fetchStats();
          }}
        />
      )}
    </div>
  );
}
