import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/get-session';
import { activityLogRepository } from '@/lib/repositories/activitylog.repository';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.profile.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const module = searchParams.get('module') || undefined;
    const action = searchParams.get('action') || undefined;
    const severity = searchParams.get('severity') as any;
    const search = searchParams.get('search') || undefined;

    const data = await activityLogRepository.findMany(session.profile.orgId, {
      module: module !== 'ALL' ? module : undefined,
      action: action !== 'ALL' ? action : undefined,
      severity: severity !== 'ALL' ? severity : undefined,
      search,
      page,
      limit,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
