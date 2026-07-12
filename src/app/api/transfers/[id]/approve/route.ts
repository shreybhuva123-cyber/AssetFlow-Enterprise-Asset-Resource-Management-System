import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/get-session';
import { transferService } from '@/lib/services/transfer.service';
import { approveTransferSchema } from '@/validators/transfer';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = session.profile.orgId!;
  const actorId = session.profile.id;
  const { id } = await params;
  const body = await req.json();
  const parsed = approveTransferSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation error', details: parsed.error.flatten() }, { status: 400 });
  try {
    const result = await transferService.approveTransfer(orgId, id, actorId, parsed.data);
    return NextResponse.json({ data: result, message: `Transfer ${parsed.data.decision.toLowerCase()}` });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message ?? 'Failed' }, { status: 400 });
  }
}
