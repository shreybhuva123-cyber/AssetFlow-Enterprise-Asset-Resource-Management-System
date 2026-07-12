import { prisma } from '@/lib/prisma';
import { AllocationStatus, Prisma } from '@prisma/client';

const allocationSelect = {
  id: true, orgId: true, assetId: true, employeeId: true, departmentId: true,
  allocatedById: true, allocationDate: true, expectedReturnDate: true,
  actualReturnDate: true, purpose: true, notes: true, priority: true,
  status: true, approvalStatus: true, approvedById: true, approvedAt: true,
  approvalNotes: true, createdAt: true, updatedAt: true,
  asset: { select: { id: true, assetTag: true, name: true, status: true, condition: true, category: { select: { id: true, name: true, icon: true } } } },
  employee: { select: { id: true, firstName: true, lastName: true, displayName: true, avatarUrl: true, role: true } },
  department: { select: { id: true, name: true, code: true } },
  allocatedBy: { select: { id: true, firstName: true, lastName: true, displayName: true } },
  approvedBy: { select: { id: true, firstName: true, lastName: true, displayName: true } },
  returns: { select: { id: true, status: true, condition: true, returnDate: true, createdAt: true }, orderBy: { createdAt: 'desc' as const }, take: 1 },
} satisfies Prisma.AssetAllocationSelect;

export type AllocationRow = Prisma.AssetAllocationGetPayload<{ select: typeof allocationSelect }>;

export interface ListAllocationsParams {
  orgId: string;
  status?: AllocationStatus;
  employeeId?: string;
  departmentId?: string;
  assetId?: string;
  search?: string;
  page?: number;
  limit?: number;
  overdue?: boolean;
}

export const allocationRepository = {
  async findMany({ orgId, status, employeeId, departmentId, assetId, search, page = 1, limit = 20, overdue }: ListAllocationsParams) {
    const where: Prisma.AssetAllocationWhereInput = {
      orgId,
      deletedAt: null,
      ...(status && { status }),
      ...(employeeId && { employeeId }),
      ...(departmentId && { departmentId }),
      ...(assetId && { assetId }),
      ...(overdue && { expectedReturnDate: { lt: new Date() }, status: AllocationStatus.ACTIVE }),
      ...(search && {
        OR: [
          { asset: { name: { contains: search, mode: 'insensitive' as const } } },
          { asset: { assetTag: { contains: search, mode: 'insensitive' as const } } },
          { employee: { displayName: { contains: search, mode: 'insensitive' as const } } },
        ],
      }),
    };
    const [data, total] = await prisma.$transaction([
      prisma.assetAllocation.findMany({ where, select: allocationSelect, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.assetAllocation.count({ where }),
    ]);
    return { data, total, page, limit };
  },

  async findById(id: string, orgId: string) {
    return prisma.assetAllocation.findFirst({ where: { id, orgId, deletedAt: null }, select: allocationSelect });
  },

  async findActiveForAsset(assetId: string, orgId: string) {
    return prisma.assetAllocation.findFirst({
      where: { assetId, orgId, status: AllocationStatus.ACTIVE, deletedAt: null },
      select: allocationSelect,
    });
  },

  async create(data: Prisma.AssetAllocationCreateInput) {
    return prisma.assetAllocation.create({ data, select: allocationSelect });
  },

  async update(id: string, data: Prisma.AssetAllocationUpdateInput) {
    return prisma.assetAllocation.update({ where: { id }, data, select: allocationSelect });
  },

  async stats(orgId: string) {
    const now = new Date();
    const [active, overdue, pendingApproval, returnedThisMonth] = await prisma.$transaction([
      prisma.assetAllocation.count({ where: { orgId, status: 'ACTIVE', deletedAt: null } }),
      prisma.assetAllocation.count({ where: { orgId, status: 'ACTIVE', deletedAt: null, expectedReturnDate: { lt: now } } }),
      prisma.assetAllocation.count({ where: { orgId, approvalStatus: 'PENDING', deletedAt: null } }),
      prisma.assetAllocation.count({ where: { orgId, status: 'RETURNED', deletedAt: null, updatedAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } } }),
    ]);
    return { active, overdue, pendingApproval, returnedThisMonth };
  },
};
