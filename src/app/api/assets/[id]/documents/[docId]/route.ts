import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/get-session';
import { deleteAssetDocument, StorageError } from '@/lib/services/asset-storage.service';
import { UserRole } from '@/types/auth';

interface Params { params: Promise<{ id: string; docId: string }> }

// DELETE /api/assets/[id]/documents/[docId]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { profile } = session;
    if (!profile.orgId) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    if (profile.role !== UserRole.ADMIN && profile.role !== UserRole.ASSET_MANAGER) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, docId } = await params;
    await deleteAssetDocument(docId, id, profile.orgId, profile.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof StorageError) {
      const status = err.code === 'NOT_FOUND' ? 404 : 400;
      return NextResponse.json({ error: err.message, code: err.code }, { status });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
