import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/get-session';
import { getOrGenerateQR, generateQRCode, AssetServiceError } from '@/lib/services/asset.service';

interface Params { params: Promise<{ id: string }> }

// GET /api/assets/[id]/qr — get or generate QR code
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { profile } = session;
    if (!profile.orgId) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    const { id } = await params;
    const qr = await getOrGenerateQR(id, profile.orgId);
    return NextResponse.json({ data: qr });
  } catch (err) {
    if (err instanceof AssetServiceError && err.code === 'ASSET_NOT_FOUND') {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/assets/[id]/qr — force regenerate
export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { profile } = session;
    if (!profile.orgId) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    const { id } = await params;
    // Get asset tag first
    const { getAssetById } = await import('@/lib/services/asset.service');
    const asset = await getAssetById(id, profile.orgId);
    if (!asset) return NextResponse.json({ error: 'Asset not found' }, { status: 404 });

    const qr = await generateQRCode(id, profile.orgId, asset.assetTag);
    return NextResponse.json({ data: qr });
  } catch (err) {
    if (err instanceof AssetServiceError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
