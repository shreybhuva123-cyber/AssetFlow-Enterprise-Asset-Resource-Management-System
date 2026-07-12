import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/get-session';
import { maintenanceService } from '@/lib/services/maintenance.service';
import { createMaintenanceSchema } from '@/validators/maintenance';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.profile.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') as any;
    const priority = searchParams.get('priority');
    const technicianId = searchParams.get('technicianId');
    const search = searchParams.get('search') || undefined;

    const data = await maintenanceService.findMany(session.profile.orgId, {
      status: status !== 'ALL' ? status : undefined,
      priority: priority !== 'ALL' ? priority : undefined,
      technicianId: technicianId || undefined,
      search,
      page,
      limit,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.profile.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await req.json();
    const data = createMaintenanceSchema.parse(json);
    
    const request = await maintenanceService.create(session.profile.orgId, session.profile.id, data);
    return NextResponse.json(request, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
