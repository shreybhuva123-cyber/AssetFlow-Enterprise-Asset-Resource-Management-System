import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/get-session';
import { transferRepository } from '@/lib/repositories/transfer.repository';
import { transferService } from '@/lib/services/transfer.service';
import { createTransferSchema } from '@/validators/transfer';

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = session.profile.orgId!;
  const { searchParams } = req.nextUrl;
  try {
    const result = await transferRepository.findMany(orgId, {
      status: searchParams.get('status') as never ?? undefined,
      search: searchParams.get('search') ?? undefined,
      page:   Number(searchParams.get('page') ?? 1),
      limit:  Number(searchParams.get('limit') ?? 20),
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch transfers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = session.profile.orgId!; const actorId = session.profile.id;
  const body = await req.json();
  const parsed = createTransferSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation error', details: parsed.error.flatten() }, { status: 400 });
  try {
    const transfer = await transferService.createTransfer(orgId, actorId, parsed.data);
    return NextResponse.json({ data: transfer, message: 'Transfer request created' }, { status: 201 });
  } catch (e: unknown) {
    const err = e as Error;
    return NextResponse.json({ error: err.message ?? 'Failed to create transfer' }, { status: 400 });
  }
}
