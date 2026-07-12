import { aiProvider } from './gemini';
import { prisma } from '../prisma';

export const aiAssistantService = {
  async query(orgId: string, prompt: string, userId: string) {
    // 1. Gather context securely based on RBAC/OrgId
    // For a real implementation, we would extract the intent and query specific tables.
    // Here we gather a high-level summary to feed to the LLM.
    const [assetCount, maintenanceCount, activeAllocations] = await prisma.$transaction([
      prisma.asset.count({ where: { orgId, deletedAt: null } }),
      prisma.maintenanceRequest.count({ where: { orgId, deletedAt: null, status: 'PENDING' } }),
      prisma.assetAllocation.count({ where: { orgId, deletedAt: null, status: 'ACTIVE' } }),
    ]);

    const context = {
      totalAssets: assetCount,
      pendingMaintenance: maintenanceCount,
      activeAllocations,
    };

    // 2. Generate safe response
    const response = await aiProvider.generateResponse(prompt, context);
    return response;
  }
};
