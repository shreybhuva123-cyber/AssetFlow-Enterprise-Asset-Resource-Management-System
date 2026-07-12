import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/get-session';
import { getAssetTimeline } from '@/lib/services/asset.service';

interface Params { params: Promise<{ id: string }> }

// GET /api/assets/[id]/timeline
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { profile } = session;
    if (!profile.orgId) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    const { id } = await params;
    const sp   = request.nextUrl.searchParams;
    const page  = Math.max(1, parseInt(sp.get('page') ?? '1', 10));
    const limit = Math.min(100, parseInt(sp.get('limit') ?? '50', 10));

    const result = await getAssetTimeline(id, profile.orgId, page, limit);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
