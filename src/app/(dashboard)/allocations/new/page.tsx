'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { notify } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, AlertTriangle, ArrowRight } from '@/lib/icons';
import Link from 'next/link';

interface Asset { id: string; assetTag: string; name: string; status: string; category?: { name: string } }
interface Profile { id: string; displayName: string; role: string }
interface Department { id: string; name: string }
interface ConflictInfo { holderName: string; departmentName?: string; assetTag: string; assetName: string; allocationId?: string }

export default function NewAllocationPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [conflict, setConflict] = useState<ConflictInfo | null>(null);
  const [showConflict, setShowConflict] = useState(false);

  const [form, setForm] = useState({
    assetId: '', employeeId: '', departmentId: '',
    allocationDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: '', purpose: '', notes: '', priority: 'NORMAL',
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/assets?limit=200').then(r => r.json()),
      fetch('/api/users?limit=200').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/departments?limit=100').then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([a, p, d]) => {
      setAssets(a.data ?? []);
      setProfiles(p.data ?? []);
      setDepartments(d.data ?? []);
    });
  }, []);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.assetId || !form.employeeId) { notify.error('Asset and Employee are required'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, departmentId: form.departmentId || undefined, expectedReturnDate: form.expectedReturnDate || undefined }),
      });
      const data = await res.json();
      if (res.status === 409 && data.conflict) {
        setConflict(data.conflict as ConflictInfo);
        setShowConflict(true);
        return;
      }
      if (!res.ok) throw new Error(data.error);
      notify.success('Asset allocated successfully');
      router.push(`/allocations/${data.data.id}`);
    } catch (e: unknown) {
      notify.error(e instanceof Error ? e.message : 'Failed to allocate');
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/allocations"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button></Link>
        <div>
          <h1 className="text-2xl font-bold">Allocate Asset</h1>
          <p className="text-sm text-muted-foreground">Assign an available asset to an employee</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Allocation Details</CardTitle><CardDescription>Fill in the allocation information below.</CardDescription></CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assetId">Asset *</Label>
                <Select value={form.assetId} onValueChange={v => setForm(f => ({ ...f, assetId: v }))}>
                  <SelectTrigger id="assetId"><SelectValue placeholder="Select an asset..." /></SelectTrigger>
                  <SelectContent>{assets.map(a => <SelectItem key={a.id} value={a.id}>{a.assetTag} — {a.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee *</Label>
                <Select value={form.employeeId} onValueChange={v => setForm(f => ({ ...f, employeeId: v }))}>
                  <SelectTrigger id="employeeId"><SelectValue placeholder="Select employee..." /></SelectTrigger>
                  <SelectContent>{profiles.map(p => <SelectItem key={p.id} value={p.id}>{p.displayName}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="departmentId">Department</Label>
                <Select value={form.departmentId} onValueChange={v => setForm(f => ({ ...f, departmentId: v }))}>
                  <SelectTrigger id="departmentId"><SelectValue placeholder="Select department..." /></SelectTrigger>
                  <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="allocationDate">Allocation Date *</Label>
                <Input id="allocationDate" type="date" value={form.allocationDate} onChange={set('allocationDate')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedReturnDate">Expected Return Date</Label>
                <Input id="expectedReturnDate" type="date" value={form.expectedReturnDate} onChange={set('expectedReturnDate')} min={form.allocationDate} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Textarea id="purpose" value={form.purpose} onChange={set('purpose')} placeholder="Reason for allocation..." rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea id="notes" value={form.notes} onChange={set('notes')} placeholder="Any internal notes..." rows={2} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-4">
          <Link href="/allocations"><Button variant="outline" type="button">Cancel</Button></Link>
          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? 'Allocating...' : <><span>Allocate Asset</span><ArrowRight className="h-4 w-4" /></>}
          </Button>
        </div>
      </form>

      {/* Conflict Dialog */}
      <Dialog open={showConflict} onOpenChange={setShowConflict}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" /><DialogTitle>Asset Already Allocated</DialogTitle></div>
            <DialogDescription>
              <strong>{conflict?.assetName}</strong> ({conflict?.assetTag}) is currently allocated to <strong>{conflict?.holderName}</strong>{conflict?.departmentName ? ` — ${conflict.departmentName}` : ''}. Create a transfer request to reassign this asset.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConflict(false)}>Cancel</Button>
            <Button onClick={() => { setShowConflict(false); router.push('/transfers/new?assetId=' + form.assetId); }}>Create Transfer Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
