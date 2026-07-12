'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { notify } from '@/lib/toast';
import { BOOKING_STATUS_CONFIG, statusBadgeClass, RESOURCE_TYPE_CONFIG } from '@/features/allocations/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, XCircle, Clock, MapPin, Users } from '@/lib/icons';
import Link from 'next/link';

interface BookingDetail {
  id: string; title: string; status: string; priority: string; purpose?: string; notes?: string;
  startTime: string; endTime: string; attendeeCount?: number; cancelReason?: string;
  resource: { id: string; name: string; resourceType: string; capacity?: number; location?: string };
  bookedBy: { id: string; displayName: string; avatarUrl?: string };
  department?: { name: string };
  participants: { id: string; role: string; profile: { id: string; displayName: string; avatarUrl?: string } }[];
}

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [id, setId] = useState('');

  useEffect(() => { params.then(p => setId(p.id)); }, [params]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/bookings/${id}`).then(r => r.json()).then(d => setBooking(d.data)).finally(() => setLoading(false));
  }, [id]);

  async function handleCancel() {
    if (!cancelReason.trim() || !id) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cancelReason }) });
      if (!res.ok) throw new Error((await res.json()).error);
      notify.success('Booking cancelled');
      setShowCancel(false);
      router.push('/bookings');
    } catch (e: unknown) { notify.error(e instanceof Error ? e.message : 'Failed to cancel'); }
    finally { setCancelling(false); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!booking) return <div className="text-center py-20"><p className="text-muted-foreground">Booking not found</p><Link href="/bookings"><Button variant="outline" className="mt-4">Back to Bookings</Button></Link></div>;

  const canCancel = !['CANCELLED', 'EXPIRED', 'COMPLETED'].includes(booking.status);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/bookings"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button></Link>
          <div>
            <h1 className="text-xl font-bold">{booking.title}</h1>
            <p className="text-sm text-muted-foreground">{booking.resource.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={statusBadgeClass(booking.status, BOOKING_STATUS_CONFIG)}>{BOOKING_STATUS_CONFIG[booking.status as keyof typeof BOOKING_STATUS_CONFIG]?.label ?? booking.status}</span>
          {canCancel && <Button variant="outline" size="sm" className="gap-1 text-red-600" onClick={() => setShowCancel(true)}><XCircle className="h-4 w-4" />Cancel</Button>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Time & Location</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{format(new Date(booking.startTime), 'EEEE, MMMM d, yyyy')}</p>
                <p className="text-sm text-muted-foreground">{format(new Date(booking.startTime), 'HH:mm')} – {format(new Date(booking.endTime), 'HH:mm')}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">{RESOURCE_TYPE_CONFIG[booking.resource.resourceType as keyof typeof RESOURCE_TYPE_CONFIG]?.icon ?? '📦'}</span>
              <div>
                <p className="font-medium">{booking.resource.name}</p>
                <p className="text-sm text-muted-foreground">{RESOURCE_TYPE_CONFIG[booking.resource.resourceType as keyof typeof RESOURCE_TYPE_CONFIG]?.label}</p>
              </div>
            </div>
            {booking.resource.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{booking.resource.location}</div>
            )}
            {booking.attendeeCount && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="h-4 w-4" />{booking.attendeeCount} attendees</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Booked By</span><span className="font-medium">{booking.bookedBy.displayName}</span></div>
            {booking.department && <div className="flex justify-between"><span className="text-muted-foreground">Department</span><span className="font-medium">{booking.department.name}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Priority</span><span className="font-medium capitalize">{booking.priority.toLowerCase()}</span></div>
            {booking.purpose && <div><span className="text-muted-foreground block mb-1">Purpose</span><p className="text-sm">{booking.purpose}</p></div>}
            {booking.notes && <div><span className="text-muted-foreground block mb-1">Notes</span><p className="text-sm">{booking.notes}</p></div>}
            {booking.cancelReason && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                <span className="text-red-600 dark:text-red-400 text-xs font-semibold uppercase block mb-1">Cancellation Reason</span>
                <p className="text-sm">{booking.cancelReason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {booking.participants.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Participants ({booking.participants.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {booking.participants.map(p => (
                <div key={p.id} className="flex items-center gap-2 bg-muted rounded-full px-3 py-1 text-sm">
                  <div className="h-5 w-5 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">{p.profile.displayName.charAt(0)}</div>
                  <span>{p.profile.displayName}</span>
                  {p.role === 'ORGANIZER' && <span className="text-xs text-blue-600 font-medium">(Organizer)</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showCancel} onOpenChange={setShowCancel}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Cancel Booking</DialogTitle><DialogDescription>This action cannot be undone. Please provide a reason.</DialogDescription></DialogHeader>
          <Textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Reason for cancellation (required)..." rows={3} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancel(false)} disabled={cancelling}>Keep Booking</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelling || !cancelReason.trim()}>{cancelling ? 'Cancelling...' : 'Cancel Booking'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
