import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/get-session';
import { allocationRepository } from '@/lib/repositories/allocation.repository';
import { updateAllocationSchema } from '@/validators/allocation';
import { AssetStatus, AllocationStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = session.profile.orgId!;
  const { id } = await params;
  const allocation = await allocationRepository.findById(id, orgId);
  if (!allocation) return NextResponse.json({ error: 'Allocation not found' }, { status: 404 });
  return NextResponse.json({ data: allocation });
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const parsed = updateAllocationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation error', details: parsed.error.flatten() }, { status: 400 });
  try {
    const updated = await allocationRepository.update(id, parsed.data);
    return NextResponse.json({ data: updated, message: 'Allocation updated' });
  } catch {
    return NextResponse.json({ error: 'Failed to update allocation' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = session.profile.orgId!;
  const { id } = await params;
  const allocation = await allocationRepository.findById(id, orgId);
  if (!allocation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  try {
    await prisma.$transaction([
      prisma.assetAllocation.update({ where: { id }, data: { status: AllocationStatus.CANCELLED } }),
      prisma.asset.update({ where: { id: allocation.assetId }, data: { status: AssetStatus.AVAILABLE, assignedToId: null } }),
    ]);
    return NextResponse.json({ message: 'Allocation cancelled' });
  } catch {
    return NextResponse.json({ error: 'Failed to cancel allocation' }, { status: 500 });
  }
}
