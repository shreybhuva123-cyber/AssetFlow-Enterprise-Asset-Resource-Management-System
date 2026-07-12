import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/get-session';
import { getAssetStats } from '@/lib/services/asset.service';
import { prisma } from '@/lib/prisma';

// GET /api/assets/stats — dashboard statistics
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { profile } = session;
    if (!profile.orgId) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    const stats = await getAssetStats(profile.orgId);

    // Enrich category IDs with names
    const categoryIds = stats.categoryDistribution
      .map((c) => c.categoryId)
      .filter((id): id is string => !!id);

    const categories = await prisma.assetCategory.findMany({
      where:  { id: { in: categoryIds } },
      select: { id: true, name: true, icon: true },
    });
    const catMap = new Map(categories.map((c) => [c.id, c]));

    const byCategory = stats.categoryDistribution
      .map((c) => ({
        name:  c.categoryId ? (catMap.get(c.categoryId)?.name ?? 'Uncategorized') : 'Uncategorized',
        icon:  c.categoryId ? (catMap.get(c.categoryId)?.icon ?? null) : null,
        count: c._count,
      }))
      .sort((a, b) => b.count - a.count);

    // Enrich department IDs with names
    const departmentIds = stats.departmentDistribution
      .map((d) => d.departmentId)
      .filter((id): id is string => !!id);

    const departments = await prisma.department.findMany({
      where:  { id: { in: departmentIds } },
      select: { id: true, name: true },
    });
    const depMap = new Map(departments.map((d) => [d.id, d]));

    const byDepartment = stats.departmentDistribution
      .map((d) => ({
        name:  d.departmentId ? (depMap.get(d.departmentId)?.name ?? 'Unassigned') : 'Unassigned',
        count: d._count,
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      data: {
        total:          stats.total,
        byStatus:       stats.byStatus,
        byCondition:    stats.byCondition,
        byCategory,
        byDepartment,
        recentAssets:   stats.recentAssets,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
