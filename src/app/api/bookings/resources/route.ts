import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/get-session';
import { bookingResourceRepository } from '@/lib/repositories/booking-resource.repository';

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = session.profile.orgId!;
  const { searchParams } = req.nextUrl;
  try {
    const resources = await bookingResourceRepository.findMany(orgId, {
      resourceType: searchParams.get('resourceType') as never ?? undefined,
      search:       searchParams.get('search') ?? undefined,
      isActive:     searchParams.get('isActive') !== 'false',
    });
    return NextResponse.json({ data: resources });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}
