import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/get-session';
import { bulkStatusChangeSchema, bulkDeleteSchema } from '@/validators/asset';
import { bulkChangeStatus, bulkRemoveAssets, AssetServiceError } from '@/lib/services/asset.service';
import { UserRole } from '@/types/auth';

// POST /api/assets/bulk — bulk operations
// body.operation: 'status' | 'delete'
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { profile } = session;
    if (!profile.orgId) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    if (profile.role !== UserRole.ADMIN && profile.role !== UserRole.ASSET_MANAGER) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { operation, ...rest } = body as { operation: string } & Record<string, unknown>;

    switch (operation) {
      case 'status': {
        const parsed = bulkStatusChangeSchema.safeParse(rest);
        if (!parsed.success) {
          return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
        }
        const result = await bulkChangeStatus(profile.orgId, parsed.data, profile.id);
        return NextResponse.json({ data: { updated: result.count } });
      }

      case 'delete': {
        const parsed = bulkDeleteSchema.safeParse(rest);
        if (!parsed.success) {
          return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
        }
        const result = await bulkRemoveAssets(profile.orgId, parsed.data, profile.id);
        return NextResponse.json({ data: { deleted: result.count } });
      }

      default:
        return NextResponse.json({ error: `Unknown operation: ${operation}` }, { status: 400 });
    }
  } catch (err) {
    if (err instanceof AssetServiceError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
