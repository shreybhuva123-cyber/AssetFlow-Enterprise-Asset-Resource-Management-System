import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/get-session';
import { activityLogRepository } from '@/lib/repositories/activitylog.repository';
import type { ActivitySeverity } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.profile.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);
    const moduleRaw = searchParams.get('module');
    const actionRaw = searchParams.get('action');
    const severityRaw = searchParams.get('severity');
    const search = searchParams.get('search') ?? undefined;

    const data = await activityLogRepository.findMany(session.profile.orgId, {
      module: moduleRaw !== 'ALL' && moduleRaw ? moduleRaw : undefined,
      action: actionRaw !== 'ALL' && actionRaw ? actionRaw : undefined,
      severity: severityRaw !== 'ALL' && severityRaw ? (severityRaw as ActivitySeverity) : undefined,
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
