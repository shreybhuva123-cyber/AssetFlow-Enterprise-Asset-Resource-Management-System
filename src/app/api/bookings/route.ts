import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/get-session';
import { prisma } from '@/lib/prisma';
import { createBookingSchema } from '@/validators/booking';

const includeRelations = {
  resource:   { select: { id: true, name: true, resourceType: true, location: true, capacity: true } },
  bookedBy:   { select: { id: true, displayName: true, avatarUrl: true } },
  department: { select: { id: true, name: true } },
  participants:{ include: { profile: { select: { id: true, displayName: true, avatarUrl: true } } } },
} as const;

// GET /api/bookings — list bookings with filters & pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { profile } = session;
    if (!profile.orgId) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    const sp           = request.nextUrl.searchParams;
    const page         = Math.max(1, parseInt(sp.get('page')  ?? '1',  10));
    const limit        = Math.min(100, parseInt(sp.get('limit') ?? '20', 10));
    const skip         = (page - 1) * limit;
    const status       = sp.get('status')     ?? undefined;
    const resourceId   = sp.get('resourceId') ?? undefined;
    const bookedById   = sp.get('bookedById') ?? undefined;
    const from         = sp.get('from')        ?? undefined;
    const to           = sp.get('to')          ?? undefined;
    const search       = sp.get('search')      ?? undefined;

    const where: Record<string, unknown> = {
      orgId:     profile.orgId,
      deletedAt: null,
      ...(status     && { status }),
      ...(resourceId && { resourceId }),
      ...(bookedById && { bookedById }),
      ...(from || to ? {
        startTime: {
          ...(from && { gte: new Date(from) }),
          ...(to   && { lte: new Date(to)   }),
        },
      } : {}),
      ...(search && {
        OR: [
          { title:    { contains: search, mode: 'insensitive' } },
          { purpose:  { contains: search, mode: 'insensitive' } },
          { resource: { name: { contains: search, mode: 'insensitive' } } },
          { bookedBy: { displayName: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: includeRelations,
        orderBy: { startTime: 'asc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      data: bookings,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/bookings — create a booking
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { profile } = session;
    if (!profile.orgId) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    const body   = await request.json();
    const parsed = createBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const { resourceId, departmentId, title, purpose, startTime, endTime, priority, attendeeCount, notes, participantIds } = parsed.data;

    // Verify resource exists and is active
    const resource = await prisma.bookingResource.findFirst({
      where: { id: resourceId, orgId: profile.orgId, isActive: true, deletedAt: null },
    });
    if (!resource) return NextResponse.json({ error: 'Booking resource not found or inactive' }, { status: 404 });

    // Check for time conflicts
    const conflict = await prisma.booking.findFirst({
      where: {
        resourceId,
        deletedAt: null,
        status:    { in: ['UPCOMING', 'ONGOING'] },
        OR: [
          { startTime: { lt: new Date(endTime) },   endTime: { gt: new Date(startTime) } },
        ],
      },
    });
    if (conflict) {
      return NextResponse.json({ error: 'Resource is already booked during this time period', code: 'TIME_CONFLICT' }, { status: 409 });
    }

    const booking = await prisma.booking.create({
      data: {
        orgId:         profile.orgId,
        resourceId,
        bookedById:    profile.id,
        departmentId:  departmentId ?? profile.departmentId ?? undefined,
        title,
        purpose,
        startTime:     new Date(startTime),
        endTime:       new Date(endTime),
        priority,
        attendeeCount,
        notes,
        status:        'UPCOMING',
        ...(participantIds?.length > 0 && {
          participants: {
            create: participantIds.map((pid: string) => ({ profileId: pid, role: 'ATTENDEE' })),
          },
        }),
      },
      include: includeRelations,
    });

    return NextResponse.json({ data: booking, message: 'Booking created successfully' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
