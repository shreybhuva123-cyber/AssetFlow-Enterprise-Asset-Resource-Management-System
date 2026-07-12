import { prisma } from '../prisma';

export interface PredictiveRecommendation {
  assetId: string;
  assetName: string;
  assetTag: string;
  type: 'HIGH_MAINTENANCE' | 'WARRANTY_EXPIRING' | 'UNDERUTILIZED' | 'NEARING_RETIREMENT';
  reason: string;
  score: number; // 0-100 priority score
}

export const predictiveMaintenanceService = {
  async getRecommendations(orgId: string): Promise<PredictiveRecommendation[]> {
    const recommendations: PredictiveRecommendation[] = [];
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    // 1. Warranty Expiring Soon (Next 30 Days)
    const expiringAssets = await prisma.asset.findMany({
      where: {
        orgId,
        deletedAt: null,
        status: { not: 'RETIRED' },
        warrantyExpiry: {
          gte: now,
          lte: thirtyDaysFromNow,
        }
      },
      select: { id: true, name: true, assetTag: true, warrantyExpiry: true }
    });

    for (const asset of expiringAssets) {
      recommendations.push({
        assetId: asset.id,
        assetName: asset.name,
        assetTag: asset.assetTag,
        type: 'WARRANTY_EXPIRING',
        reason: `Warranty expires on ${asset.warrantyExpiry?.toLocaleDateString()}`,
        score: 90,
      });
    }

    // 2. High Maintenance (More than 3 requests in last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(now.getDate() - 90);

    const highMaintenanceAssets = await prisma.asset.findMany({
      where: {
        orgId,
        deletedAt: null,
        maintenanceRequests: {
          some: { createdAt: { gte: ninetyDaysAgo } }
        }
      },
      select: {
        id: true, name: true, assetTag: true,
        _count: { select: { maintenanceRequests: { where: { createdAt: { gte: ninetyDaysAgo } } } } }
      }
    });

    for (const asset of highMaintenanceAssets) {
      if (asset._count.maintenanceRequests >= 3) {
        recommendations.push({
          assetId: asset.id,
          assetName: asset.name,
          assetTag: asset.assetTag,
          type: 'HIGH_MAINTENANCE',
          reason: `High failure rate: ${asset._count.maintenanceRequests} maintenance requests in the last 90 days.`,
          score: 85,
        });
      }
    }

    // Sort by priority score
    return recommendations.sort((a, b) => b.score - a.score);
  }
};
