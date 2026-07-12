import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/get-session';
import { uploadAssetDocument, getAssetDocuments, StorageError } from '@/lib/services/asset-storage.service';
import { uploadDocumentMetaSchema } from '@/validators/asset';
import { UserRole } from '@/types/auth';

interface Params { params: Promise<{ id: string }> }

// GET /api/assets/[id]/documents
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { profile } = session;
    if (!profile.orgId) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    const { id } = await params;
    const docs = await getAssetDocuments(id, profile.orgId);
    return NextResponse.json({ data: docs });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/assets/[id]/documents — multipart/form-data
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { profile } = session;
    if (!profile.orgId) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    if (profile.role !== UserRole.ADMIN && profile.role !== UserRole.ASSET_MANAGER) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id }    = await params;
    const formData  = await request.formData();
    const file      = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const meta = uploadDocumentMetaSchema.safeParse({
      documentType: formData.get('documentType') ?? 'OTHER',
      description:  formData.get('description') ?? undefined,
    });

    if (!meta.success) {
      return NextResponse.json({ error: 'Invalid metadata', details: meta.error.flatten() }, { status: 400 });
    }

    const doc = await uploadAssetDocument(
      id,
      profile.orgId,
      profile.id,
      file,
      meta.data.documentType,
      meta.data.description,
    );

    return NextResponse.json({ data: doc }, { status: 201 });
  } catch (err) {
    if (err instanceof StorageError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
