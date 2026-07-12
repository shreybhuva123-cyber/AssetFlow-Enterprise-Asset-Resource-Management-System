'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format, isAfter, parseISO } from 'date-fns';
import { Plus, Search, Filter, RotateCcw, Eye, AlertCircle, CheckCircle, Clock, Users } from '@/lib/icons';
import { notify } from '@/lib/toast';
import { ALLOCATION_STATUS_CONFIG, statusBadgeClass } from '@/features/allocations/constants';
import { ReturnDialog } from '@/features/allocations/components/return-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Allocation {
  id: string; status: string; priority: string; allocationDate: string; expectedReturnDate?: string;
  asset: { id: string; assetTag: string; name: string; category?: { name: string; icon?: string } };
  employee: { id: string; displayName: string; avatarUrl?: string };
  department?: { id: string; name: string };
  allocatedBy?: { displayName: string };
}
interface Stats { active: number; overdue: number; pendingApproval: number; returnedThisMonth: number; }

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${color}`}><Icon className="h-6 w-6" /></div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AllocationsPage() {
  const router = useRouter();
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [stats, setStats] = useState<Stats>({ active: 0, overdue: 0, pendingApproval: 0, returnedThisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [returnDialogId, setReturnDialogId] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const [activeRes, overdueRes] = await Promise.all([
        fetch('/api/allocations?status=ACTIVE&limit=1'),
        fetch('/api/allocations?overdue=true&limit=1'),
      ]);
      const [activeData, overdueData] = await Promise.all([activeRes.json(), overdueRes.json()]);
      setStats(prev => ({ ...prev, active: activeData.total ?? 0, overdue: overdueData.total ?? 0 }));
    } catch {}
  }, []);

  const fetchAllocations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const res = await fetch(`/api/allocations?${params}`);
      const data = await res.json();
      setAllocations(data.data ?? []);
      setTotal(data.total ?? 0);
    } catch { notify.error('Failed to load allocations'); }
    finally { setLoading(false); }
  }, [search, status, page]);

  useEffect(() => { void fetchAllocations(); void fetchStats(); }, [fetchAllocations, fetchStats]);

  const isOverdue = (a: Allocation) => a.expectedReturnDate && a.status === 'ACTIVE' && isAfter(new Date(), parseISO(a.expectedReturnDate));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Asset Allocations</h1>
          <p className="text-muted-foreground text-sm">Track and manage asset assignments across your organization</p>
        </div>
        <Link href="/allocations/new"><Button className="gap-2"><Plus className="h-4 w-4" />Allocate Asset</Button></Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Allocations" value={stats.active} icon={CheckCircle} color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" />
        <StatCard title="Overdue Returns" value={stats.overdue} icon={AlertCircle} color="bg-red-100 text-red-600 dark:bg-red-900/30" />
        <StatCard title="Pending Approval" value={stats.pendingApproval} icon={Clock} color="bg-amber-100 text-amber-600 dark:bg-amber-900/30" />
        <StatCard title="Returned This Month" value={stats.returnedThisMonth} icon={RotateCcw} color="bg-blue-100 text-blue-600 dark:bg-blue-900/30" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by asset or employee..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
            </div>
            <Select value={status} onValueChange={v => { setStatus(v === 'ALL' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {Object.entries(ALLOCATION_STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : allocations.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="mx-auto h-10 w-10 mb-3 opacity-40" />
              <p className="font-medium">No allocations found</p>
              <p className="text-sm">Start by allocating an asset to an employee</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-3 font-medium">Asset</th>
                  <th className="text-left px-4 py-3 font-medium">Assigned To</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Department</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Allocated</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Due Return</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr></thead>
                <tbody className="divide-y">
                  {allocations.map(a => (
                    <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{a.asset.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{a.asset.assetTag}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {a.employee.displayName.charAt(0)}
                          </div>
                          <span className="font-medium">{a.employee.displayName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{a.department?.name ?? '—'}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{format(parseISO(a.allocationDate), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {a.expectedReturnDate ? (
                          <span className={isOverdue(a) ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                            {format(parseISO(a.expectedReturnDate), 'MMM d, yyyy')}
                            {isOverdue(a) && ' ⚠️'}
                          </span>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={statusBadgeClass(a.status, ALLOCATION_STATUS_CONFIG)}>{ALLOCATION_STATUS_CONFIG[a.status as keyof typeof ALLOCATION_STATUS_CONFIG]?.label ?? a.status}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/allocations/${a.id}`)}><Eye className="h-4 w-4" /></Button>
                          {a.status === 'ACTIVE' && (
                            <Button variant="outline" size="sm" className="text-xs" onClick={() => setReturnDialogId(a.id)}><RotateCcw className="h-3 w-3 mr-1" />Return</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {total > 20 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, total)} of {total}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {returnDialogId && (
        <ReturnDialog open={!!returnDialogId} onOpenChange={(v) => !v && setReturnDialogId(null)} allocationId={returnDialogId} onSuccess={() => { setReturnDialogId(null); void fetchAllocations(); void fetchStats(); }} />
      )}
    </div>
  );
}
