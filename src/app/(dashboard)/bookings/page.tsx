'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import { Plus, Search, List, Calendar, Clock, CheckCircle2 } from '@/lib/icons';
import { notify } from '@/lib/toast';
import { BOOKING_STATUS_CONFIG, statusBadgeClass, RESOURCE_TYPE_CONFIG } from '@/features/allocations/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface Booking {
  id: string; title: string; status: string; priority: string; startTime: string; endTime: string; attendeeCount?: number;
  resource: { id: string; name: string; resourceType: string; location?: string };
  bookedBy: { displayName: string; avatarUrl?: string };
  department?: { name: string };
}

// Lazy-load the calendar to avoid SSR issues
const BookingCalendar = dynamic(() => import('@/features/bookings/components/booking-calendar').then(m => m.BookingCalendar), {
  ssr: false,
  loading: () => <Skeleton className="h-[600px] w-full" />,
});

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [stats] = useState({ upcoming: 0, ongoing: 0, todayCount: 0 });

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      const res = await fetch(`/api/bookings?${params}`);
      const data = await res.json();
      setBookings(data.data ?? []);
    } catch { notify.error('Failed to load bookings'); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { void fetchBookings(); }, [fetchBookings]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resource Bookings</h1>
          <p className="text-muted-foreground text-sm">Schedule and manage shared resource bookings</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border p-1 gap-1">
            <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('list')} className="gap-2 h-7"><List className="h-3.5 w-3.5" />List</Button>
            <Button variant={view === 'calendar' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('calendar')} className="gap-2 h-7"><Calendar className="h-3.5 w-3.5" />Calendar</Button>
          </div>
          <Link href="/bookings/new"><Button className="gap-2"><Plus className="h-4 w-4" />New Booking</Button></Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Upcoming', value: stats.upcoming, icon: Clock, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' },
          { label: 'Ongoing', value: stats.ongoing, icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' },
          { label: "Today's Bookings", value: stats.todayCount, icon: Calendar, color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30' },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-4 flex items-center justify-between">
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-2xl font-bold">{s.value}</p></div>
            <div className={`p-2.5 rounded-xl ${s.color}`}><s.icon className="h-5 w-5" /></div>
          </CardContent></Card>
        ))}
      </div>

      {view === 'calendar' ? (
        <BookingCalendar onEventClick={(id) => router.push(`/bookings/${id}`)} onDateClick={(date) => router.push(`/bookings/new?date=${date.toISOString().split('T')[0]}`)} />
      ) : (
        <>
          <Card><CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search bookings..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
            </div>
          </CardContent></Card>
          <Card><CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Calendar className="mx-auto h-10 w-10 mb-3 opacity-40" />
                <p className="font-medium">No bookings found</p>
                <p className="text-sm">Create your first resource booking</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-3 font-medium">Booking</th>
                    <th className="text-left px-4 py-3 font-medium">Resource</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Date & Time</th>
                    <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Booked By</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-right px-4 py-3 font-medium">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium">{b.title}</div>
                          {b.attendeeCount && <div className="text-xs text-muted-foreground">{b.attendeeCount} attendees</div>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span>{RESOURCE_TYPE_CONFIG[b.resource.resourceType as keyof typeof RESOURCE_TYPE_CONFIG]?.icon ?? '📦'}</span>
                            <div>
                              <div className="font-medium text-xs">{b.resource.name}</div>
                              {b.resource.location && <div className="text-xs text-muted-foreground">{b.resource.location}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                          <div>{format(new Date(b.startTime), 'MMM d, yyyy')}</div>
                          <div className="text-xs">{format(new Date(b.startTime), 'HH:mm')} – {format(new Date(b.endTime), 'HH:mm')}</div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{b.bookedBy.displayName}</td>
                        <td className="px-4 py-3">
                          <span className={statusBadgeClass(b.status, BOOKING_STATUS_CONFIG)}>{BOOKING_STATUS_CONFIG[b.status as keyof typeof BOOKING_STATUS_CONFIG]?.label ?? b.status}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/bookings/${b.id}`)}>View</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent></Card>
        </>
      )}
    </div>
  );
}
