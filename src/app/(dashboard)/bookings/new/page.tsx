'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { notify } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, AlertTriangle } from '@/lib/icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RESOURCE_TYPE_CONFIG } from '@/features/allocations/constants';
import Link from 'next/link';

interface Resource { id: string; name: string; resourceType: string; capacity?: number; location?: string }
interface ConflictInfo { bookingId: string; title: string; startTime: string; endTime: string; bookedBy: string }

export default function NewBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetDate = searchParams.get('date') ?? new Date().toISOString().split('T')[0];
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [conflict, setConflict] = useState<ConflictInfo | null>(null);
  const [form, setForm] = useState({
    resourceId: '', title: '', purpose: '', startDate: presetDate, startTime: '09:00', endTime: '10:00',
    priority: 'NORMAL', attendeeCount: '', notes: '',
  });

  useEffect(() => {
    fetch('/api/bookings/resources').then(r => r.json()).then(d => setResources(d.data ?? []));
  }, []);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.resourceId || !form.title) { notify.error('Resource and title are required'); return; }
    const startTime = `${form.startDate}T${form.startTime}:00+00:00`;
    const endTime   = `${form.startDate}T${form.endTime}:00+00:00`;
    if (new Date(endTime) <= new Date(startTime)) { notify.error('End time must be after start time'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId: form.resourceId, title: form.title, purpose: form.purpose || undefined, startTime, endTime, priority: form.priority, attendeeCount: form.attendeeCount ? Number(form.attendeeCount) : undefined, notes: form.notes || undefined, participantIds: [] }),
      });
      const data = await res.json();
      if (res.status === 409) { setConflict(data.conflict as ConflictInfo); return; }
      if (!res.ok) throw new Error(data.error);
      notify.success('Booking created successfully');
      router.push(`/bookings/${data.data.id}`);
    } catch (e: unknown) { notify.error(e instanceof Error ? e.message : 'Failed to create booking'); }
    finally { setLoading(false); }
  }

  const selectedResource = resources.find(r => r.id === form.resourceId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/bookings"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button></Link>
        <div><h1 className="text-2xl font-bold">New Booking</h1><p className="text-sm text-muted-foreground">Reserve a shared resource</p></div>
      </div>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Booking Details</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Resource *</Label>
              <Select value={form.resourceId} onValueChange={v => setForm(f => ({ ...f, resourceId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select a resource..." /></SelectTrigger>
                <SelectContent>
                  {resources.map(r => (
                    <SelectItem key={r.id} value={r.id}>
                      <span className="flex items-center gap-2">
                        <span>{RESOURCE_TYPE_CONFIG[r.resourceType as keyof typeof RESOURCE_TYPE_CONFIG]?.icon ?? '📦'}</span>
                        <span>{r.name}{r.location ? ` — ${r.location}` : ''}{r.capacity ? ` (cap. ${r.capacity})` : ''}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedResource && (
                <p className="text-xs text-muted-foreground pl-1">
                  {RESOURCE_TYPE_CONFIG[selectedResource.resourceType as keyof typeof RESOURCE_TYPE_CONFIG]?.label}
                  {selectedResource.location ? ` · ${selectedResource.location}` : ''}
                  {selectedResource.capacity ? ` · Capacity: ${selectedResource.capacity}` : ''}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={form.title} onChange={set('title')} placeholder="e.g. Weekly Team Standup" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date *</Label>
                <Input id="startDate" type="date" value={form.startDate} onChange={set('startDate')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input id="startTime" type="time" value={form.startTime} onChange={set('startTime')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input id="endTime" type="time" value={form.endTime} onChange={set('endTime')} required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem><SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem><SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendeeCount">Expected Attendees</Label>
                <Input id="attendeeCount" type="number" value={form.attendeeCount} onChange={set('attendeeCount')} placeholder="e.g. 10" min={1} max={selectedResource?.capacity ?? 999} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Textarea id="purpose" value={form.purpose} onChange={set('purpose')} placeholder="What is this booking for?" rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={form.notes} onChange={set('notes')} placeholder="Any additional notes..." rows={2} />
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3 mt-4">
          <Link href="/bookings"><Button variant="outline" type="button">Cancel</Button></Link>
          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? 'Booking...' : <><span>Confirm Booking</span><ArrowRight className="h-4 w-4" /></>}
          </Button>
        </div>
      </form>

      {/* Conflict Dialog */}
      <Dialog open={!!conflict} onOpenChange={(v) => !v && setConflict(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" /><DialogTitle>Time Slot Conflict</DialogTitle></div>
            <DialogDescription>
              This resource is already booked during your requested time:
              <br /><br />
              <strong>{conflict?.title}</strong> by <strong>{conflict?.bookedBy}</strong>
              <br />
              {conflict && <span className="text-sm">{format(new Date(conflict.startTime), 'MMM d, HH:mm')} – {format(new Date(conflict.endTime), 'HH:mm')}</span>}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setConflict(null)}>Choose Different Time</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
