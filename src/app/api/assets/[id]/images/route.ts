import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/get-session';
import { uploadAssetImage, getAssetImages, StorageError } from '@/lib/services/asset-storage.service';
import { UserRole } from '@/types/auth';

interface Params { params: Promise<{ id: string }> }

// GET /api/assets/[id]/images
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { profile } = session;
    if (!profile.orgId) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    const { id } = await params;
    const images = await getAssetImages(id, profile.orgId);
    return NextResponse.json({ data: images });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/assets/[id]/images — multipart/form-data upload
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
    const formData  = await request.formData();
    const file      = formData.get('file') as File | null;
    const isPrimary = formData.get('isPrimary') === 'true';

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const image = await uploadAssetImage(id, profile.orgId, profile.id, file, isPrimary);
    return NextResponse.json({ data: image }, { status: 201 });
  } catch (err) {
    if (err instanceof StorageError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
