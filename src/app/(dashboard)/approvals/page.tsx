'use client';
import { useState, useEffect, useCallback } from 'react';
import { notify } from '@/lib/toast';
import { format } from 'date-fns';
import { ALLOCATION_STATUS_CONFIG, TRANSFER_STATUS_CONFIG, statusBadgeClass } from '@/features/allocations/constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, XCircle, ClipboardList, ArrowRight } from '@/lib/icons';

interface PendingAllocation {
  id: string; approvalStatus: string; allocationDate: string; purpose?: string; priority: string;
  asset: { assetTag: string; name: string };
  employee: { displayName: string };
  allocatedBy?: { displayName: string };
}
interface PendingTransfer {
  id: string; status: string; requestedAt: string; reason: string;
  asset: { assetTag: string; name: string };
  requestedBy: { displayName: string };
  fromEmployee?: { displayName: string };
  toEmployee: { displayName: string };
  approvals: { id: string; decision: string; comments?: string; decidedAt: string; approver: { displayName: string } }[];
}

function ApprovalCard({ onApprove, onReject, title, subtitle, meta, tag }: { onApprove: () => void; onReject: () => void; title: string; subtitle: string; meta: string; tag: React.ReactNode }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{title}</div>
            <div className="text-sm text-muted-foreground truncate">{subtitle}</div>
            <div className="text-xs text-muted-foreground mt-1">{meta}</div>
            <div className="mt-2">{tag}</div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onApprove}><CheckCircle2 className="h-3.5 w-3.5" />Approve</Button>
            <Button size="sm" variant="outline" className="gap-1 text-red-600 border-red-200 hover:bg-red-50" onClick={onReject}><XCircle className="h-3.5 w-3.5" />Reject</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ApprovalsPage() {
  const [allocations, setAllocations] = useState<PendingAllocation[]>([]);
  const [transfers, setTransfers] = useState<PendingTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveTarget, setApproveTarget] = useState<{ type: 'allocation' | 'transfer'; id: string; decision: 'APPROVED' | 'REJECTED' } | null>(null);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [allRes, trRes] = await Promise.all([
        fetch('/api/allocations?status=PENDING_APPROVAL&limit=50'),
        fetch('/api/transfers?status=REQUESTED&limit=50'),
      ]);
      const [allData, trData] = await Promise.all([allRes.json(), trRes.json()]);
      setAllocations(allData.data ?? []);
      setTransfers(trData.data ?? []);
    } catch { notify.error('Failed to load approvals'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  async function handleApprove() {
    if (!approveTarget) return;
    if (approveTarget.decision === 'REJECTED' && !comments.trim()) { notify.error('Comments required when rejecting'); return; }
    setSubmitting(true);
    const { type, id, decision } = approveTarget;
    try {
      const url = type === 'allocation' ? `/api/allocations/${id}/approve` : `/api/transfers/${id}/approve`;
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ decision, comments, approvalNotes: comments }) });
      if (!res.ok) throw new Error((await res.json()).error);
      notify.success(`${type === 'allocation' ? 'Allocation' : 'Transfer'} ${decision.toLowerCase()}`);
      setApproveTarget(null); setComments('');
      void fetchAll();
    } catch (e: unknown) { notify.error(e instanceof Error ? e.message : 'Failed'); }
    finally { setSubmitting(false); }
  }

  const total = allocations.length + transfers.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Approval Queue</h1>
        <p className="text-muted-foreground text-sm">{total} item{total !== 1 ? 's' : ''} awaiting your review</p>
      </div>

      <Tabs defaultValue="allocations">
        <TabsList><TabsTrigger value="allocations">Allocation Approvals ({allocations.length})</TabsTrigger><TabsTrigger value="transfers">Transfer Approvals ({transfers.length})</TabsTrigger></TabsList>

        <TabsContent value="allocations" className="mt-4 space-y-3">
          {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />) :
            allocations.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground"><ClipboardList className="mx-auto h-10 w-10 mb-3 opacity-40" /><p className="font-medium">No pending allocation approvals</p></div>
            ) : allocations.map(a => (
              <ApprovalCard key={a.id}
                title={`${a.asset.name} → ${a.employee.displayName}`}
                subtitle={`${a.asset.assetTag} · ${a.purpose ?? 'No purpose specified'}`}
                meta={`Requested by ${a.allocatedBy?.displayName ?? 'System'} · ${format(new Date(a.allocationDate), 'MMM d, yyyy')} · Priority: ${a.priority}`}
                tag={<span className={statusBadgeClass(a.approvalStatus === 'PENDING' ? 'PENDING_APPROVAL' : a.approvalStatus, ALLOCATION_STATUS_CONFIG)}>{a.approvalStatus === 'PENDING' ? 'Pending Approval' : a.approvalStatus}</span>}
                onApprove={() => { setApproveTarget({ type: 'allocation', id: a.id, decision: 'APPROVED' }); setComments(''); }}
                onReject={() => { setApproveTarget({ type: 'allocation', id: a.id, decision: 'REJECTED' }); setComments(''); }}
              />
            ))}
        </TabsContent>

        <TabsContent value="transfers" className="mt-4 space-y-3">
          {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />) :
            transfers.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground"><ArrowRight className="mx-auto h-10 w-10 mb-3 opacity-40" /><p className="font-medium">No pending transfer approvals</p></div>
            ) : transfers.map(t => (
              <ApprovalCard key={t.id}
                title={`Transfer: ${t.asset.name}`}
                subtitle={`${t.fromEmployee?.displayName ?? 'Unassigned'} → ${t.toEmployee.displayName}`}
                meta={`Requested by ${t.requestedBy.displayName} · ${format(new Date(t.requestedAt), 'MMM d, yyyy')} · Reason: ${t.reason}`}
                tag={<span className={statusBadgeClass(t.status, TRANSFER_STATUS_CONFIG)}>{TRANSFER_STATUS_CONFIG[t.status as keyof typeof TRANSFER_STATUS_CONFIG]?.label ?? t.status}</span>}
                onApprove={() => { setApproveTarget({ type: 'transfer', id: t.id, decision: 'APPROVED' }); setComments(''); }}
                onReject={() => { setApproveTarget({ type: 'transfer', id: t.id, decision: 'REJECTED' }); setComments(''); }}
              />
            ))}
        </TabsContent>
      </Tabs>

      <Dialog open={!!approveTarget} onOpenChange={(v) => !v && setApproveTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{approveTarget?.decision === 'APPROVED' ? 'Confirm Approval' : 'Confirm Rejection'}</DialogTitle></DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-muted-foreground">Are you sure you want to {approveTarget?.decision === 'APPROVED' ? 'approve' : 'reject'} this {approveTarget?.type}?</p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Comments {approveTarget?.decision === 'REJECTED' && '*'}</label>
              <Textarea value={comments} onChange={e => setComments(e.target.value)} placeholder={approveTarget?.decision === 'REJECTED' ? 'Reason for rejection (required)...' : 'Optional comments...'} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveTarget(null)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleApprove} disabled={submitting} variant={approveTarget?.decision === 'REJECTED' ? 'destructive' : 'default'}>
              {submitting ? 'Processing...' : approveTarget?.decision === 'APPROVED' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
