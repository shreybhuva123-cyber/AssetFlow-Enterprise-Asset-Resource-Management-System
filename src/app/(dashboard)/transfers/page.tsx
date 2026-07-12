'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Plus, Search, Filter, ArrowRight, Eye, CheckCircle2, Clock, XCircle } from '@/lib/icons';
import { notify } from '@/lib/toast';
import { TRANSFER_STATUS_CONFIG, statusBadgeClass } from '@/features/allocations/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

interface Transfer {
  id: string; status: string; reason: string; requestedAt: string; scheduledDate?: string;
  asset: { assetTag: string; name: string };
  requestedBy: { displayName: string };
  fromEmployee?: { displayName: string };
  toEmployee: { displayName: string };
  fromDepartment?: { name: string };
  toDepartment?: { name: string };
}

export default function TransfersPage() {
  const router = useRouter();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [approveId, setApproveId] = useState<string | null>(null);
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [comments, setComments] = useState('');
  const [approving, setApproving] = useState(false);

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const res = await fetch(`/api/transfers?${params}`);
      const data = await res.json();
      setTransfers(data.data ?? []);
      setTotal(data.total ?? 0);
    } catch { notify.error('Failed to load transfers'); }
    finally { setLoading(false); }
  }, [search, status, page]);

  useEffect(() => { void fetchTransfers(); }, [fetchTransfers]);

  async function handleApprove() {
    if (!approveId) return;
    if (decision === 'REJECTED' && !comments.trim()) { notify.error('Comments required when rejecting'); return; }
    setApproving(true);
    try {
      const res = await fetch(`/api/transfers/${approveId}/approve`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, comments }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      notify.success(`Transfer ${decision.toLowerCase()} successfully`);
      setApproveId(null); setComments(''); setDecision('APPROVED');
      void fetchTransfers();
    } catch (e: unknown) { notify.error(e instanceof Error ? e.message : 'Failed'); }
    finally { setApproving(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transfer Requests</h1>
          <p className="text-muted-foreground text-sm">Manage asset transfers between employees and departments</p>
        </div>
        <Link href="/transfers/new"><Button className="gap-2"><Plus className="h-4 w-4" />New Transfer</Button></Link>
      </div>

      <Card><CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search transfers..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          </div>
          <Select value={status} onValueChange={v => { setStatus(v === 'ALL' ? '' : v); setPage(1); }}>
            <SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {Object.entries(TRANSFER_STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : transfers.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <ArrowRight className="mx-auto h-10 w-10 mb-3 opacity-40" />
            <p className="font-medium">No transfer requests</p>
            <p className="text-sm">Create a transfer to reassign an asset</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/40">
                <th className="text-left px-4 py-3 font-medium">Asset</th>
                <th className="text-left px-4 py-3 font-medium">Transfer</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Requested By</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr></thead>
              <tbody className="divide-y">
                {transfers.map(t => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium">{t.asset.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{t.asset.assetTag}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-muted-foreground">{t.fromEmployee?.displayName ?? 'Unassigned'}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="font-medium">{t.toEmployee.displayName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{t.requestedBy.displayName}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{format(new Date(t.requestedAt), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3">
                      <span className={statusBadgeClass(t.status, TRANSFER_STATUS_CONFIG)}>{TRANSFER_STATUS_CONFIG[t.status as keyof typeof TRANSFER_STATUS_CONFIG]?.label ?? t.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/transfers/${t.id}`)}><Eye className="h-4 w-4" /></Button>
                        {['REQUESTED', 'PENDING_APPROVAL'].includes(t.status) && (
                          <Button size="sm" variant="outline" className="text-xs" onClick={() => setApproveId(t.id)}>Review</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent></Card>

      {/* Approve Dialog */}
      <Dialog open={!!approveId} onOpenChange={(v) => !v && setApproveId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Review Transfer Request</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex gap-3">
              <Button variant={decision === 'APPROVED' ? 'default' : 'outline'} className="flex-1 gap-2" onClick={() => setDecision('APPROVED')}><CheckCircle2 className="h-4 w-4" />Approve</Button>
              <Button variant={decision === 'REJECTED' ? 'destructive' : 'outline'} className="flex-1 gap-2" onClick={() => setDecision('REJECTED')}><XCircle className="h-4 w-4" />Reject</Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Comments {decision === 'REJECTED' && '*'}</label>
              <Textarea value={comments} onChange={e => setComments(e.target.value)} placeholder={decision === 'REJECTED' ? 'Reason for rejection (required)...' : 'Optional comments...'} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveId(null)} disabled={approving}>Cancel</Button>
            <Button onClick={handleApprove} disabled={approving} variant={decision === 'REJECTED' ? 'destructive' : 'default'}>
              {approving ? 'Processing...' : `Confirm ${decision === 'APPROVED' ? 'Approval' : 'Rejection'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
