'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { notify } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from '@/lib/icons';
import Link from 'next/link';

interface Asset { id: string; assetTag: string; name: string }
interface Profile { id: string; displayName: string }
interface Department { id: string; name: string }

export default function NewTransferPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetAssetId = searchParams.get('assetId') ?? '';
  const [assets, setAssets] = useState<Asset[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ assetId: presetAssetId, toEmployeeId: '', toDepartmentId: '', reason: '', notes: '', scheduledDate: '' });

  useEffect(() => {
    Promise.all([
      fetch('/api/assets?limit=200').then(r => r.json()),
      fetch('/api/users?limit=200').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/departments?limit=100').then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([a, p, d]) => { setAssets(a.data ?? []); setProfiles(p.data ?? []); setDepartments(d.data ?? []); });
  }, []);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.assetId || !form.toEmployeeId || !form.reason) { notify.error('Asset, employee, and reason are required'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/transfers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, toDepartmentId: form.toDepartmentId || undefined, scheduledDate: form.scheduledDate || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      notify.success('Transfer request created');
      router.push('/transfers');
    } catch (e: unknown) { notify.error(e instanceof Error ? e.message : 'Failed to create transfer'); }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/transfers"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button></Link>
        <div>
          <h1 className="text-2xl font-bold">New Transfer Request</h1>
          <p className="text-sm text-muted-foreground">Request to reassign an asset to another employee</p>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Transfer Details</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Asset *</Label>
                <Select value={form.assetId} onValueChange={v => setForm(f => ({ ...f, assetId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select asset..." /></SelectTrigger>
                  <SelectContent>{assets.map(a => <SelectItem key={a.id} value={a.id}>{a.assetTag} — {a.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Transfer To *</Label>
                <Select value={form.toEmployeeId} onValueChange={v => setForm(f => ({ ...f, toEmployeeId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select employee..." /></SelectTrigger>
                  <SelectContent>{profiles.map(p => <SelectItem key={p.id} value={p.id}>{p.displayName}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={form.toDepartmentId} onValueChange={v => setForm(f => ({ ...f, toDepartmentId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select department..." /></SelectTrigger>
                  <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Scheduled Date</Label>
                <Input id="scheduledDate" type="date" value={form.scheduledDate} onChange={set('scheduledDate')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Textarea id="reason" value={form.reason} onChange={set('reason')} placeholder="Why is this transfer needed?" rows={3} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={form.notes} onChange={set('notes')} placeholder="Additional notes..." rows={2} />
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3 mt-4">
          <Link href="/transfers"><Button variant="outline" type="button">Cancel</Button></Link>
          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? 'Creating...' : <><span>Submit Transfer</span><ArrowRight className="h-4 w-4" /></>}
          </Button>
        </div>
      </form>
    </div>
  );
}
