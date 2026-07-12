import { prisma } from '@/lib/prisma';
import type { AuditCycleStatus, Prisma } from '@prisma/client';

const auditCycleSelect = {
  id: true, orgId: true, name: true, description: true, status: true,
  startDate: true, endDate: true, closedAt: true, notes: true,
  departmentId: true, locationId: true, createdById: true, closedById: true,
  createdAt: true, updatedAt: true,
  createdBy: { select: { id: true, displayName: true, avatarUrl: true } },
  closedBy: { select: { id: true, displayName: true } },
  department: { select: { id: true, name: true } },
  assignments: { select: { id: true, isLead: true, auditor: { select: { id: true, displayName: true, avatarUrl: true } } } },
  _count: { select: { results: true, discrepancies: true } },
} satisfies Prisma.AuditCycleSelect;

export type AuditCycleRow = Prisma.AuditCycleGetPayload<{ select: typeof auditCycleSelect }>;

export const auditRepository = {
  async findMany(orgId: string, params: { status?: AuditCycleStatus; search?: string; page?: number; limit?: number } = {}) {
    const { status, search, page = 1, limit = 20 } = params;
    const where: Prisma.AuditCycleWhereInput = {
      orgId, deletedAt: null,
      ...(status && { status }),
      ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
    };
    const [data, total] = await prisma.$transaction([
      prisma.auditCycle.findMany({ where, select: auditCycleSelect, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.auditCycle.count({ where }),
    ]);
    return { data, total, page, limit };
  },

  async findById(id: string, orgId: string) {
    return prisma.auditCycle.findFirst({
      where: { id, orgId, deletedAt: null },
      select: {
        ...auditCycleSelect,
        results: {
          select: { id: true, status: true, notes: true, location: true, condition: true, verifiedAt: true, asset: { select: { id: true, assetTag: true, name: true, status: true } }, verifiedBy: { select: { id: true, displayName: true } } },
          orderBy: { asset: { name: 'asc' as const } },
        },
        discrepancies: {
          select: { id: true, type: true, description: true, severity: true, isResolved: true, resolvedAt: true, asset: { select: { id: true, assetTag: true, name: true } }, resolvedBy: { select: { id: true, displayName: true } } },
          orderBy: { createdAt: 'desc' as const },
        }
      }
    });
  },

  async createCycle(data: Prisma.AuditCycleCreateInput) {
    return prisma.auditCycle.create({ data, select: auditCycleSelect });
  },

  async updateCycle(id: string, data: Prisma.AuditCycleUpdateInput) {
    return prisma.auditCycle.update({ where: { id }, data, select: auditCycleSelect });
  },

  async addAssignments(cycleId: string, auditorIds: string[]) {
    return prisma.auditAssignment.createMany({
      data: auditorIds.map(id => ({ cycleId, auditorId: id })),
      skipDuplicates: true,
    });
  },

  async initializeResults(cycleId: string, orgId: string, departmentId?: string, locationId?: string) {
    const where: Prisma.AssetWhereInput = {
      orgId, deletedAt: null, status: { notIn: ['DISPOSED', 'RETIRED'] },
      ...(departmentId && { departmentId }),
      ...(locationId && { currentLocation: locationId }),
    };
    const assets = await prisma.asset.findMany({ where, select: { id: true } });
    
    if (assets.length > 0) {
      await prisma.auditAssetResult.createMany({
        data: assets.map(a => ({ cycleId, assetId: a.id, status: 'PENDING' })),
        skipDuplicates: true,
      });
    }
    return assets.length;
  },

  async verifyAsset(cycleId: string, assetId: string, data: Prisma.AuditAssetResultUpdateInput) {
    return prisma.auditAssetResult.update({
      where: { cycleId_assetId: { cycleId, assetId } },
      data,
    });
  },

  async reportDiscrepancy(data: Prisma.AuditDiscrepancyCreateInput) {
    return prisma.auditDiscrepancy.create({ data });
  },

  async resolveDiscrepancy(id: string, data: Prisma.AuditDiscrepancyUpdateInput) {
    return prisma.auditDiscrepancy.update({ where: { id }, data });
  },

  async stats(orgId: string) {
    const [activeCycles, pendingVerifications, openDiscrepancies] = await prisma.$transaction([
      prisma.auditCycle.count({ where: { orgId, status: { in: ['ACTIVE', 'IN_PROGRESS'] }, deletedAt: null } }),
      prisma.auditAssetResult.count({ where: { cycle: { orgId, status: { in: ['ACTIVE', 'IN_PROGRESS'] } }, status: 'PENDING' } }),
      prisma.auditDiscrepancy.count({ where: { cycle: { orgId, deletedAt: null }, isResolved: false } }),
    ]);
    return { activeCycles, pendingVerifications, openDiscrepancies };
  }
};
