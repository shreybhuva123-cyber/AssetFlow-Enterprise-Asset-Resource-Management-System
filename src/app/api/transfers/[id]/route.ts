import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/get-session';
import { transferRepository } from '@/lib/repositories/transfer.repository';
import { transferService } from '@/lib/services/transfer.service';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = session.profile.orgId!;
  const { id } = await params;
  const transfer = await transferRepository.findById(id, orgId);
  if (!transfer) return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
  return NextResponse.json({ data: transfer });
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = session.profile.orgId!;
  const actorId = session.profile.id;
  const { id } = await params;
  try {
    await transferService.cancelTransfer(orgId, id, actorId);
    return NextResponse.json({ message: 'Transfer cancelled' });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message ?? 'Failed' }, { status: 400 });
  }
}
