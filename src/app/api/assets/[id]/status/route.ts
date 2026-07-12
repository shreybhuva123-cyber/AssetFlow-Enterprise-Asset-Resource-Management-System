import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/get-session';
import { statusTransitionSchema } from '@/validators/asset';
import { transitionStatus, AssetServiceError } from '@/lib/services/asset.service';
import { UserRole } from '@/types/auth';

interface Params { params: Promise<{ id: string }> }

// POST /api/assets/[id]/status — trigger a state machine transition
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { profile } = session;
    if (!profile.orgId) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    if (profile.role !== UserRole.ADMIN && profile.role !== UserRole.ASSET_MANAGER) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = statusTransitionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const asset = await transitionStatus(id, profile.orgId, parsed.data, profile.id);
    return NextResponse.json({ data: asset });
  } catch (err) {
    if (err instanceof AssetServiceError) {
      const httpStatus = err.code === 'ASSET_NOT_FOUND' ? 404 : 409;
      return NextResponse.json({ error: err.message, code: err.code }, { status: httpStatus });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
