import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/get-session';
import { auditService } from '@/lib/services/audit.service';
import { createAuditCycleSchema } from '@/validators/audit';
import { ZodError } from 'zod';
import type { AuditCycleStatus } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.profile.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);
    const statusRaw = searchParams.get('status');
    const search = searchParams.get('search') ?? undefined;

    const data = await auditService.findMany(session.profile.orgId, {
      status: statusRaw !== 'ALL' && statusRaw ? (statusRaw as AuditCycleStatus) : undefined,
      search,
      page,
      limit,
    });

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.profile.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await req.json();
    const data = createAuditCycleSchema.parse(json);

    const cycle = await auditService.create(session.profile.orgId, session.profile.id, data);
    return NextResponse.json(cycle, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
