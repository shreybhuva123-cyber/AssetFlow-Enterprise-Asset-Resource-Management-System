import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/get-session';
import { maintenanceService } from '@/lib/services/maintenance.service';
import { updateMaintenanceSchema, approveMaintenanceSchema } from '@/validators/maintenance';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.profile.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await maintenanceService.findById(params.id, session.profile.orgId);
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.profile.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    const json = await req.json();

    if (action === 'approve') {
      const data = approveMaintenanceSchema.parse(json);
      const res = await maintenanceService.approve(params.id, session.profile.orgId, session.profile.id, data);
      return NextResponse.json(res);
    }

    // Standard update
    const data = updateMaintenanceSchema.parse(json);
    const res = await prisma.maintenanceRequest.update({
      where: { id: params.id, orgId: session.profile.orgId },
      data
    });
    return NextResponse.json(res);

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
