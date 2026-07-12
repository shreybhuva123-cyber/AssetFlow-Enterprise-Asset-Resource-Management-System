import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/get-session';
import { maintenanceService } from '@/lib/services/maintenance.service';
import { updateMaintenanceSchema, approveMaintenanceSchema } from '@/validators/maintenance';
import { prisma } from '@/lib/prisma';
import { ZodError } from 'zod';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session?.profile.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const data = await maintenanceService.findById(id, session.profile.orgId);
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session?.profile.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const json = await req.json();

    if (action === 'approve') {
      const data = approveMaintenanceSchema.parse(json);
      const res = await maintenanceService.approve(id, session.profile.orgId, session.profile.id, data);
      return NextResponse.json(res);
    }

    // Standard update
    const data = updateMaintenanceSchema.parse(json);
    const res = await prisma.maintenanceRequest.update({
      where: { id, orgId: session.profile.orgId },
      data,
    });
    return NextResponse.json(res);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
