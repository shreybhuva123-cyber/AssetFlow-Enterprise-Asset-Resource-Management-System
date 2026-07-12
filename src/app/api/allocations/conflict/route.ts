import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/get-session';
import { allocationRepository } from '@/lib/repositories/allocation.repository';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = session.profile.orgId!;
  const body = await req.json();
  const { assetId } = body ?? {};
  if (!assetId) return NextResponse.json({ error: 'assetId is required' }, { status: 400 });
  try {
    const active = await allocationRepository.findActiveForAsset(assetId, orgId);
    if (!active) return NextResponse.json({ conflict: false });
    return NextResponse.json({
      conflict: true,
      holder: { name: active.employee.displayName, department: active.department?.name, avatarUrl: active.employee.avatarUrl },
      allocation: { id: active.id, allocationDate: active.allocationDate, expectedReturnDate: active.expectedReturnDate, status: active.status },
      asset: { assetTag: active.asset.assetTag, name: active.asset.name },
    });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to check conflict' }, { status: 500 });
  }
}
