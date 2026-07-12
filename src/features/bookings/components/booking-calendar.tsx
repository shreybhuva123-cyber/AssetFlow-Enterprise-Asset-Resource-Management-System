'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export interface CalendarEvent {
  id: string; title: string; start: string; end: string;
  backgroundColor?: string; borderColor?: string; textColor?: string;
  extendedProps?: Record<string, unknown>;
}

// Dynamic import to avoid SSR issues with FullCalendar
const FullCalendarDynamic = dynamic(
  async () => {
    const { default: FullCalendar } = await import('@fullcalendar/react');
    const { default: dayGridPlugin } = await import('@fullcalendar/daygrid');
    const { default: timeGridPlugin } = await import('@fullcalendar/timegrid');
    const { default: listPlugin } = await import('@fullcalendar/list');
    const { default: interactionPlugin } = await import('@fullcalendar/interaction');

    return function InnerCalendar({ events, onEventClick, onDateClick }: { events: CalendarEvent[]; onEventClick?: (id: string) => void; onDateClick?: (date: Date) => void }) {
      return (
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' }}
          events={events}
          height="auto"
          nowIndicator
          weekNumbers
          allDaySlot={false}
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          eventClick={(info) => onEventClick?.(info.event.id)}
          dateClick={(info) => onDateClick?.(info.date)}
          eventDisplay="block"
          eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        />
      );
    };
  },
  { ssr: false, loading: () => <Skeleton className="h-[600px] w-full rounded-xl" /> }
);

interface Props {
  onEventClick?: (id: string) => void;
  onDateClick?: (date: Date) => void;
  resourceId?: string;
}

export function BookingCalendar({ onEventClick, onDateClick, resourceId }: Props) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const to   = new Date(now.getFullYear(), now.getMonth() + 3, 0).toISOString();
    const params = new URLSearchParams({ from, to });
    if (resourceId) params.set('resourceId', resourceId);
    fetch(`/api/bookings/calendar?${params}`)
      .then(r => r.json())
      .then(d => setEvents(d.data ?? []))
      .finally(() => setLoading(false));
  }, [resourceId]);

  if (loading) return <Skeleton className="h-[600px] w-full rounded-xl" />;

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <style>{`
        .fc { font-family: inherit; }
        .fc .fc-button { border-radius: 0.5rem; font-size: 0.8rem; padding: 0.25rem 0.75rem; }
        .fc .fc-button-primary { background-color: hsl(var(--primary)); border-color: hsl(var(--primary)); }
        .fc .fc-button-primary:hover { background-color: hsl(var(--primary) / 0.9); }
        .fc .fc-event { border-radius: 4px; font-size: 0.8rem; cursor: pointer; }
        .fc .fc-day-today { background: hsl(var(--primary) / 0.05) !important; }
        .fc-theme-standard td, .fc-theme-standard th { border-color: hsl(var(--border)); }
        .fc-scrollgrid { border-color: hsl(var(--border)); }
      `}</style>
      <FullCalendarDynamic events={events} onEventClick={onEventClick} onDateClick={onDateClick} />
    </div>
  );
}
