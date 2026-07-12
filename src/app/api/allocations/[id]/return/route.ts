import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/get-session';
import { allocationService } from '@/lib/services/allocation.service';
import { returnAllocationSchema } from '@/validators/allocation';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = session.profile.orgId!;
  const actorId = session.profile.id;
  const { id } = await params;
  const body = await req.json();
  const parsed = returnAllocationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation error', details: parsed.error.flatten() }, { status: 400 });
  try {
    const result = await allocationService.returnAsset(orgId, id, actorId, parsed.data);
    return NextResponse.json({ data: result, message: 'Asset returned successfully' });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message ?? 'Failed' }, { status: 400 });
  }
}
