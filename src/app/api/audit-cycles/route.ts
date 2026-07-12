import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/get-session';
import { auditService } from '@/lib/services/audit.service';
import { createAuditCycleSchema } from '@/validators/audit';

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
    const search = searchParams.get('search') || undefined;

    const data = await auditService.findMany(session.profile.orgId, {
      status: status !== 'ALL' ? status : undefined,
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
    const data = createAuditCycleSchema.parse(json);
    
    const cycle = await auditService.create(session.profile.orgId, session.profile.id, data);
    return NextResponse.json(cycle, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
