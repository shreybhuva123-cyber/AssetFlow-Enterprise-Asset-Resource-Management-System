import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/get-session';
import { allocationRepository } from '@/lib/repositories/allocation.repository';
import { allocationService } from '@/lib/services/allocation.service';
import { createAllocationSchema } from '@/validators/allocation';

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = session.profile.orgId!;
  const { searchParams } = req.nextUrl;
  try {
    const result = await allocationRepository.findMany({
      orgId,
      status:       searchParams.get('status') as never ?? undefined,
      employeeId:   searchParams.get('employeeId') ?? undefined,
      departmentId: searchParams.get('departmentId') ?? undefined,
      assetId:      searchParams.get('assetId') ?? undefined,
      search:       searchParams.get('search') ?? undefined,
      page:         Number(searchParams.get('page') ?? 1),
      limit:        Number(searchParams.get('limit') ?? 20),
      overdue:      searchParams.get('overdue') === 'true',
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch allocations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = session.profile.orgId!; const actorId = session.profile.id;
  const body = await req.json();
  const parsed = createAllocationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation error', details: parsed.error.flatten() }, { status: 400 });
  try {
    const allocation = await allocationService.allocateAsset(orgId, actorId, parsed.data);
    return NextResponse.json({ data: allocation, message: 'Asset allocated successfully' }, { status: 201 });
  } catch (e: unknown) {
    const err = e as Error & { code?: string; conflict?: unknown };
    if (err.code === 'ALLOCATION_CONFLICT') return NextResponse.json({ error: err.message, conflict: err.conflict }, { status: 409 });
    return NextResponse.json({ error: err.message ?? 'Failed to allocate asset' }, { status: 400 });
  }
}
