import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/get-session';
import { allocationService } from '@/lib/services/allocation.service';
import { approveAllocationSchema } from '@/validators/allocation';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = session.profile.orgId!;
  const actorId = session.profile.id;
  const { id } = await params;
  const body = await req.json();
  const parsed = approveAllocationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation error', details: parsed.error.flatten() }, { status: 400 });
  try {
    const result = await allocationService.approveAllocation(orgId, id, actorId, parsed.data);
    return NextResponse.json({ data: result, message: `Allocation ${parsed.data.decision.toLowerCase()}` });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message ?? 'Failed' }, { status: 400 });
  }
}
