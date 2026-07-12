import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/get-session';
import { bookingRepository } from '@/lib/repositories/booking.repository';

const STATUS_COLORS: Record<string, string> = {
  UPCOMING:  '#3b82f6',
  ONGOING:   '#10b981',
  COMPLETED: '#6b7280',
  CANCELLED: '#ef4444',
  EXPIRED:   '#f59e0b',
};

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = session.profile.orgId!;
  const { searchParams } = req.nextUrl;
  const fromStr = searchParams.get('from');
  const toStr   = searchParams.get('to');
  if (!fromStr || !toStr) {
    // Default: current month
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const bookings = await bookingRepository.findCalendarEvents(orgId, from, to);
    return buildResponse(bookings);
  }
  const from = new Date(fromStr);
  const to   = new Date(toStr);
  const bookings = await bookingRepository.findCalendarEvents(orgId, from, to);
  return buildResponse(bookings);
}

function buildResponse(bookings: Awaited<ReturnType<typeof bookingRepository.findCalendarEvents>>) {
  const events = bookings.map((b) => ({
    id:              b.id,
    title:           b.title,
    start:           b.startTime.toISOString(),
    end:             b.endTime.toISOString(),
    backgroundColor: STATUS_COLORS[b.status] ?? '#6b7280',
    borderColor:     STATUS_COLORS[b.status] ?? '#6b7280',
    textColor:       '#ffffff',
    extendedProps: {
      status:       b.status,
      resourceId:   b.resourceId,
      resourceName: b.resource.name,
      resourceType: b.resource.resourceType,
      bookedBy:     b.bookedBy.displayName,
      bookedById:   b.bookedById,
      purpose:      b.purpose,
    },
  }));
  return NextResponse.json({ data: events });
}
