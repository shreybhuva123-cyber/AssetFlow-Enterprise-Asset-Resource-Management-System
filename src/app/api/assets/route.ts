import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/get-session';
import { assetFiltersSchema, createAssetSchema } from '@/validators/asset';
import { getAssets, registerAsset, AssetServiceError } from '@/lib/services/asset.service';
import { UserRole } from '@/types/auth';

// GET /api/assets — list assets with filters & pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { profile } = session;
    if (!profile.orgId) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    const sp = Object.fromEntries(request.nextUrl.searchParams.entries());

    // Coerce page/limit to numbers before parsing
    const rawFilters = {
      ...sp,
      page:  sp.page  ? parseInt(sp.page, 10)  : 1,
      limit: sp.limit ? parseInt(sp.limit, 10) : 20,
    };

    const parsed = assetFiltersSchema.safeParse(rawFilters);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid filters', details: parsed.error.flatten() }, { status: 400 });
    }

    // RBAC: EMPLOYEE sees only their assigned assets, DEPARTMENT_HEAD sees department assets
    const filters = { ...parsed.data };
    if (profile.role === UserRole.EMPLOYEE) {
      filters.assignedToId = profile.id;
    } else if (profile.role === UserRole.DEPARTMENT_HEAD && profile.departmentId) {
      filters.departmentId = profile.departmentId;
    }

    const result = await getAssets(profile.orgId, filters);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/assets — create a new asset
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { profile } = session;
    if (!profile.orgId) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    // RBAC: Only ADMIN and ASSET_MANAGER can create assets
    if (profile.role !== UserRole.ADMIN && profile.role !== UserRole.ASSET_MANAGER) {
      return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createAssetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const asset = await registerAsset(profile.orgId, parsed.data, profile.id);
    return NextResponse.json({ data: asset }, { status: 201 });
  } catch (err) {
    if (err instanceof AssetServiceError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
