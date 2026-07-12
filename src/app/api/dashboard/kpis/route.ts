import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/get-session';
import { dashboardRepository } from '@/lib/repositories/dashboard.repository';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.profile.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get('departmentId') || undefined;

    const [kpis, recentActivity, upcomingReturns] = await Promise.all([
      dashboardRepository.getKPIs(session.profile.orgId, departmentId),
      dashboardRepository.getRecentActivity(session.profile.orgId),
      dashboardRepository.getUpcomingReturns(session.profile.orgId, departmentId)
    ]);

    return NextResponse.json({ kpis, recentActivity, upcomingReturns });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
