import { prisma } from '@/lib/prisma';
import { AssetStatus, MaintenanceStatus, AuditCycleStatus } from '@prisma/client';

export const dashboardRepository = {
  async getKPIs(orgId: string, departmentId?: string) {
    const assetWhere = { orgId, deletedAt: null, ...(departmentId && { departmentId }) };
    
    const [
      totalAssets,
      availableAssets,
      allocatedAssets,
      maintenanceAssets,
      retiredAssets,
      overdueReturns,
      pendingMaintenance,
      upcomingAudits,
    ] = await prisma.$transaction([
      prisma.asset.count({ where: assetWhere }),
      prisma.asset.count({ where: { ...assetWhere, status: AssetStatus.AVAILABLE } }),
      prisma.asset.count({ where: { ...assetWhere, status: AssetStatus.ALLOCATED } }),
      prisma.asset.count({ where: { ...assetWhere, status: AssetStatus.UNDER_MAINTENANCE } }),
      prisma.asset.count({ where: { ...assetWhere, status: AssetStatus.RETIRED } }),
      prisma.assetAllocation.count({ 
        where: { orgId, deletedAt: null, status: 'ACTIVE', expectedReturnDate: { lt: new Date() }, ...(departmentId && { departmentId }) } 
      }),
      prisma.maintenanceRequest.count({
        where: { orgId, deletedAt: null, status: { in: [MaintenanceStatus.PENDING, MaintenanceStatus.APPROVED] }, ...(departmentId && { departmentId }) }
      }),
      prisma.auditCycle.count({
        where: { orgId, deletedAt: null, status: AuditCycleStatus.DRAFT, ...(departmentId && { departmentId }) }
      })
    ]);

    const denominator = totalAssets - retiredAssets;
    const utilization = denominator > 0
      ? Math.round((allocatedAssets / denominator) * 100)
      : 0;

    return {
      totalAssets,
      availableAssets,
      allocatedAssets,
      maintenanceAssets,
      retiredAssets,
      overdueReturns,
      pendingMaintenance,
      upcomingAudits,
      utilization,
    };
  },

  async getRecentActivity(orgId: string, limit = 5) {
    return prisma.activityLog.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { actor: { select: { id: true, displayName: true, avatarUrl: true } } }
    });
  },

  async getUpcomingReturns(orgId: string, departmentId?: string, limit = 5) {
    return prisma.assetAllocation.findMany({
      where: { 
        orgId, 
        deletedAt: null, 
        status: 'ACTIVE', 
        expectedReturnDate: { not: null },
        ...(departmentId && { departmentId })
      },
      orderBy: { expectedReturnDate: 'asc' },
      take: limit,
      include: {
        asset: { select: { id: true, name: true, assetTag: true } },
        employee: { select: { id: true, displayName: true, avatarUrl: true } }
      }
    });
  }
};
