import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/get-session';
import { bookingRepository } from '@/lib/repositories/booking.repository';
import { bookingService } from '@/lib/services/booking.service';
import { updateBookingSchema, cancelBookingSchema } from '@/validators/booking';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = session.profile.orgId!;
  const { id } = await params;
  const booking = await bookingRepository.findById(id, orgId);
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  return NextResponse.json({ data: booking });
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = session.profile.orgId!;
  const actorId = session.profile.id;
  const { id } = await params;
  const body = await req.json();
  const parsed = updateBookingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation error', details: parsed.error.flatten() }, { status: 400 });
  try {
    const updated = await bookingService.updateBooking(orgId, id, actorId, parsed.data);
    return NextResponse.json({ data: updated, message: 'Booking updated' });
  } catch (e: unknown) {
    const err = e as Error & { code?: string; conflict?: unknown };
    if (err.code === 'BOOKING_CONFLICT') return NextResponse.json({ error: err.message, conflict: err.conflict }, { status: 409 });
    return NextResponse.json({ error: err.message ?? 'Failed' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = session.profile.orgId!;
  const actorId = session.profile.id;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = cancelBookingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'cancelReason required' }, { status: 400 });
  try {
    await bookingService.cancelBooking(orgId, id, actorId, parsed.data.cancelReason);
    return NextResponse.json({ message: 'Booking cancelled' });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message ?? 'Failed' }, { status: 400 });
  }
}
