import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/get-session';
import { bookingService } from '@/lib/services/booking.service';

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = session.profile.orgId!;
  const { searchParams } = req.nextUrl;
  const resourceId = searchParams.get('resourceId');
  const dateStr    = searchParams.get('date');
  if (!resourceId || !dateStr) return NextResponse.json({ error: 'resourceId and date are required' }, { status: 400 });
  try {
    const bookings = await bookingService.checkAvailability(resourceId, orgId, new Date(dateStr));
    return NextResponse.json({ data: bookings });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 });
  }
}
