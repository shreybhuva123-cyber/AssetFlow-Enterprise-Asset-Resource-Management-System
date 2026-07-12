import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/get-session';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.profile.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    if (!query || query.length < 2) {
      return NextResponse.json({ assets: [], employees: [], departments: [] });
    }

    const orgId = session.profile.orgId;
    const mode = 'insensitive' as const;

    const [assets, employees, departments] = await Promise.all([
      prisma.asset.findMany({
        where: { orgId, deletedAt: null, OR: [{ name: { contains: query, mode } }, { assetTag: { contains: query, mode } }] },
        take: 5,
        select: { id: true, name: true, assetTag: true, status: true }
      }),
      prisma.profile.findMany({
        where: { orgId, OR: [{ displayName: { contains: query, mode } }, { jobTitle: { contains: query, mode } }] },
        take: 3,
        select: { id: true, displayName: true, jobTitle: true, avatarUrl: true }
      }),
      prisma.department.findMany({
        where: { orgId, OR: [{ name: { contains: query, mode } }, { code: { contains: query, mode } }] },
        take: 2,
        select: { id: true, name: true, code: true }
      })
    ]);

    return NextResponse.json({ assets, employees, departments });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
