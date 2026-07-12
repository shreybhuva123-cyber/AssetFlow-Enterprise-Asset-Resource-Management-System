import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/get-session';
import { getAssetsForExport } from '@/lib/services/asset.service';
import { assetFiltersSchema } from '@/validators/asset';
import { format } from 'date-fns';

// GET /api/assets/export?format=csv — download all matching assets as CSV
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { profile } = session;
    if (!profile.orgId) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    const sp = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = assetFiltersSchema.safeParse({
      ...sp,
      page: 1, limit: 1000,
    });

    const filters = parsed.success ? parsed.data : { page: 1, limit: 1000, sortBy: 'createdAt' as const, sortOrder: 'desc' as const };
    const assets  = await getAssetsForExport(profile.orgId, filters);

    const fmt = (request.nextUrl.searchParams.get('format') ?? 'csv').toLowerCase();

    if (fmt === 'csv') {
      const headers = [
        'Asset Tag', 'Name', 'Serial Number', 'Status', 'Condition',
        'Category', 'Department', 'Assigned To', 'Location',
        'Manufacturer', 'Model', 'Purchase Date', 'Warranty Expiry',
        'Acquisition Cost', 'Bookable', 'Shared', 'Registered At',
      ];

      const rows = assets.map((a) => [
        a.assetTag,
        `"${a.name.replace(/"/g, '""')}"`,
        a.serialNumber ?? '',
        a.status,
        a.condition,
        a.category?.name ?? '',
        a.department?.name ?? '',
        a.assignedTo?.displayName ?? '',
        a.currentLocation ?? '',
        a.manufacturer ?? '',
        a.model ?? '',
        a.purchaseDate ? format(new Date(a.purchaseDate), 'yyyy-MM-dd') : '',
        a.warrantyExpiry ? format(new Date(a.warrantyExpiry), 'yyyy-MM-dd') : '',
        a.acquisitionCost ?? '',
        a.isBookable ? 'Yes' : 'No',
        a.isShared ? 'Yes' : 'No',
        format(new Date(a.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      ].join(','));

      const csv  = [headers.join(','), ...rows].join('\n');
      const name = `assets-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;

      return new NextResponse(csv, {
        headers: {
          'Content-Type':        'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${name}"`,
        },
      });
    }

    // JSON fallback
    return NextResponse.json({ data: assets });
  } catch {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
