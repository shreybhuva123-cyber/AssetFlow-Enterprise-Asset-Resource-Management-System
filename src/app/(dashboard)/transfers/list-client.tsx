'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Search,
  RefreshCw,
  Eye,
  ArrowRight,
  Clock,
  CheckCircle2,
  CheckCircle,
  Loader2,
  Send,
  Check,
  X,
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
import { notify } from '@/lib/toast';
import { useAuthStore } from '@/store/auth.store';

interface TransferStats {
  pending: number;
  approved: number;
  completed: number;
}

interface Transfer {
  id: string;
  asset: { id: string; assetTag: string; name: string };
  fromEmployee: { id: string; name: string };
  toEmployee: { id: string; name: string };
  fromDepartment?: { name: string } | null;
  toDepartment?: { name: string } | null;
  status: string;
  requestedAt: string;
  reason?: string | null;
}

interface PaginatedResponse {
  data: Transfer[];
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

export function TransferListClient() {
  const { profile } = useAuthStore();
  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'ASSET_MANAGER';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<TransferStats>({ pending: 0, approved: 0, completed: 0 });
  const [loadingList, setLoadingList] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const pageSize = 10;

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/transfers/stats');
      if (res.ok) setStats(await res.json());
    } catch {
      // ignore
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchTransfers = useCallback(async () => {
    setLoadingList(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (search) params.set('search', search);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      const res = await fetch(`/api/transfers?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json: PaginatedResponse = await res.json();
      setTransfers(json.data);
      setTotal(json.total);
    } catch {
      notify.error('Failed to load transfer requests');
    } finally {
      setLoadingList(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => {
    const t = setTimeout(fetchTransfers, 300);
    return () => clearTimeout(t);
  }, [fetchTransfers]);

  async function handleApprove(id: string) {
    setApprovingId(id);
    try {
      const res = await fetch(`/api/transfers/${id}/approve`, { method: 'POST' });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to approve');
      notify.success('Transfer approved');
      fetchTransfers();
      fetchStats();
    } catch (e) {
      notify.error(e instanceof Error ? e.message : 'Failed to approve transfer');
    } finally {
      setApprovingId(null);
    }
  }

  async function handleReject(id: string) {
    setApprovingId(id);
    try {
      const res = await fetch(`/api/transfers/${id}/reject`, { method: 'POST' });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to reject');
      notify.success('Transfer rejected');
      fetchTransfers();
      fetchStats();
    } catch (e) {
      notify.error(e instanceof Error ? e.message : 'Failed to reject transfer');
    } finally {
      setApprovingId(null);
    }
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Pending Requests" value={stats.pending} icon={Clock} colorClass="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" loading={loadingStats} />
        <StatCard title="Approved" value={stats.approved} icon={CheckCircle2} colorClass="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" loading={loadingStats} />
        <StatCard title="Completed" value={stats.completed} icon={CheckCircle} colorClass="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" loading={loadingStats} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="transfer-search"
            placeholder="Search by asset or employee..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger id="transfer-status-filter" className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="REQUESTED">Requested</SelectItem>
            <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => { fetchTransfers(); fetchStats(); }} id="transfer-refresh-btn" title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      {loadingList ? (
        <div className="rounded-xl border border-border/60 overflow-hidden">
          <div className="bg-muted/30 h-12 border-b animate-pulse" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 border-b animate-pulse" />
          ))}
        </div>
      ) : transfers.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card p-12 text-center">
          <Send className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold">No transfer requests found</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            {search || statusFilter !== 'ALL' ? 'Try adjusting your filters' : 'No transfer requests have been submitted yet'}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Asset</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Transfer</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Requested</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((t) => (
                    <tr key={t.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium">{t.asset.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{t.asset.assetTag}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm">
                          <span className="font-medium">{t.fromEmployee.name}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="font-medium">{t.toEmployee.name}</span>
                        </div>
                        {(t.fromDepartment || t.toDepartment) && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {t.fromDepartment?.name} → {t.toDepartment?.name}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                        {format(new Date(t.requestedAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={t.status} type="transfer" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" asChild id={`view-transfer-${t.id}`}>
                            <Link href={`/transfers/${t.id}`}><Eye className="h-4 w-4" /></Link>
                          </Button>
                          {isAdmin && t.status === 'PENDING_APPROVAL' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                id={`approve-transfer-${t.id}`}
                                title="Approve"
                                disabled={approvingId === t.id}
                                onClick={() => handleApprove(t.id)}
                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                              >
                                {approvingId === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                id={`reject-transfer-${t.id}`}
                                title="Reject"
                                disabled={approvingId === t.id}
                                onClick={() => handleReject(t.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} id="transfer-prev-page">Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} id="transfer-next-page">Next</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
