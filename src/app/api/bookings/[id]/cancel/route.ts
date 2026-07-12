import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/get-session';
import { bookingService } from '@/lib/services/booking.service';
import { cancelBookingSchema } from '@/validators/booking';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = session.profile.orgId!;
  const actorId = session.profile.id;
  const { id } = await params;
  const body = await req.json();
  const parsed = cancelBookingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'cancelReason is required' }, { status: 400 });
  try {
    await bookingService.cancelBooking(orgId, id, actorId, parsed.data.cancelReason);
    return NextResponse.json({ message: 'Booking cancelled' });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message ?? 'Failed' }, { status: 400 });
  }
}
