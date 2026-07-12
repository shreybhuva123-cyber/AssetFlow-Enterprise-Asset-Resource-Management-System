'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ALLOCATION_STATUS_CONFIG, statusBadgeClass, RETURN_CONDITION_CONFIG } from '@/features/allocations/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, AlertCircle } from '@/lib/icons';
import { ReturnDialog } from '@/features/allocations/components/return-dialog';
import Link from 'next/link';

interface AllocationDetail {
  id: string; status: string; priority: string; purpose?: string; notes?: string; approvalStatus: string;
  allocationDate: string; expectedReturnDate?: string; actualReturnDate?: string;
  asset: { id: string; assetTag: string; name: string; status: string; category?: { name: string; icon?: string } };
  employee: { id: string; displayName: string; avatarUrl?: string; role: string };
  department?: { id: string; name: string };
  allocatedBy?: { displayName: string };
  approvedBy?: { displayName: string };
  approvedAt?: string;
  approvalNotes?: string;
  returns: { id: string; status: string; condition: string; returnDate: string }[];
}

export default function AllocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [allocation, setAllocation] = useState<AllocationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReturn, setShowReturn] = useState(false);
  const [id, setId] = useState('');

  useEffect(() => { params.then(p => setId(p.id)); }, [params]);
  useEffect(() => {
    if (!id) return;
    fetch(`/api/allocations/${id}`).then(r => r.json()).then(d => setAllocation(d.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!allocation) return <div className="text-center py-20"><p className="text-muted-foreground">Allocation not found</p><Link href="/allocations"><Button variant="outline" className="mt-4">Back</Button></Link></div>;

  const isOverdue = allocation.expectedReturnDate && allocation.status === 'ACTIVE' && new Date() > new Date(allocation.expectedReturnDate);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/allocations"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button></Link>
          <div>
            <h1 className="text-xl font-bold">{allocation.asset.name}</h1>
            <p className="text-sm text-muted-foreground font-mono">{allocation.asset.assetTag}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={statusBadgeClass(allocation.status, ALLOCATION_STATUS_CONFIG)}>{ALLOCATION_STATUS_CONFIG[allocation.status as keyof typeof ALLOCATION_STATUS_CONFIG]?.label ?? allocation.status}</span>
          {allocation.status === 'ACTIVE' && (
            <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowReturn(true)}><RotateCcw className="h-4 w-4" />Return</Button>
          )}
        </div>
      </div>

      {isOverdue && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium">This allocation is overdue. Expected return was {format(new Date(allocation.expectedReturnDate!), 'MMMM d, yyyy')}.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Asset Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Asset Tag</span><span className="font-mono font-medium">{allocation.asset.assetTag}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{allocation.asset.name}</span></div>
            {allocation.asset.category && <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span>{allocation.asset.category.name}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Asset Status</span><span className="font-medium capitalize">{allocation.asset.status.toLowerCase()}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Assigned To</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold">{allocation.employee.displayName.charAt(0)}</div>
              <div><div className="font-medium">{allocation.employee.displayName}</div><div className="text-xs text-muted-foreground capitalize">{allocation.employee.role.toLowerCase().replace('_', ' ')}</div></div>
            </div>
            {allocation.department && <div className="flex justify-between"><span className="text-muted-foreground">Department</span><span>{allocation.department.name}</span></div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Timeline</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Allocated On</span><span>{format(new Date(allocation.allocationDate), 'MMM d, yyyy')}</span></div>
            {allocation.expectedReturnDate && <div className="flex justify-between"><span className="text-muted-foreground">Expected Return</span><span className={isOverdue ? 'text-red-600 font-medium' : ''}>{format(new Date(allocation.expectedReturnDate), 'MMM d, yyyy')}</span></div>}
            {allocation.actualReturnDate && <div className="flex justify-between"><span className="text-muted-foreground">Actual Return</span><span>{format(new Date(allocation.actualReturnDate), 'MMM d, yyyy')}</span></div>}
            {allocation.allocatedBy && <div className="flex justify-between"><span className="text-muted-foreground">Allocated By</span><span>{allocation.allocatedBy.displayName}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Priority</span><span className="capitalize">{allocation.priority.toLowerCase()}</span></div>
          </CardContent>
        </Card>
        {allocation.purpose || allocation.notes ? (
          <Card>
            <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {allocation.purpose && <div><span className="text-muted-foreground block mb-1">Purpose</span><p>{allocation.purpose}</p></div>}
              {allocation.notes && <div><span className="text-muted-foreground block mb-1">Notes</span><p>{allocation.notes}</p></div>}
            </CardContent>
          </Card>
        ) : null}
      </div>

      {allocation.returns.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Return History</CardTitle></CardHeader>
          <CardContent>
            {allocation.returns.map(r => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
                <div>
                  <span className="font-medium">{RETURN_CONDITION_CONFIG[r.condition as keyof typeof RETURN_CONDITION_CONFIG]?.label ?? r.condition}</span>
                  <span className="text-muted-foreground ml-2">{format(new Date(r.returnDate), 'MMM d, yyyy')}</span>
                </div>
                <span className={`text-xs font-medium ${r.status === 'ACCEPTED' ? 'text-emerald-600' : r.status === 'REJECTED' ? 'text-red-600' : 'text-amber-600'}`}>{r.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {id && (
        <ReturnDialog
          open={showReturn}
          onOpenChange={setShowReturn}
          allocationId={id}
          onSuccess={() => { router.push('/allocations'); }}
        />
      )}
    </div>
  );
}
