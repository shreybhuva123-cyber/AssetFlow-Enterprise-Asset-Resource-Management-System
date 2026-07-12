import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/get-session';
import { maintenanceService } from '@/lib/services/maintenance.service';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.profile.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await maintenanceService.stats(session.profile.orgId);
    return NextResponse.json(stats);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
