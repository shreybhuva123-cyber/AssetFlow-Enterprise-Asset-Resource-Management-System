import { auditRepository } from '../repositories/audit.repository';
import { activityLogRepository } from '../repositories/activitylog.repository';
import type { CreateAuditCycleInput, VerifyAssetInput, ReportDiscrepancyInput } from '@/validators/audit';

export const auditService = {
  async findMany(orgId: string, params: Record<string, unknown>) {
    return auditRepository.findMany(orgId, params);
  },

  async findById(id: string, orgId: string) {
    return auditRepository.findById(id, orgId);
  },

  async create(orgId: string, actorId: string, data: CreateAuditCycleInput) {
    const cycle = await auditRepository.createCycle({
      org: { connect: { id: orgId } },
      createdBy: { connect: { id: actorId } },
      name: data.name,
      description: data.description,
      department: data.departmentId ? { connect: { id: data.departmentId } } : undefined,
      locationId: data.locationId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      notes: data.notes,
    });

    if (data.auditorIds.length > 0) {
      await auditRepository.addAssignments(cycle.id, data.auditorIds);
    }

    const assetCount = await auditRepository.initializeResults(cycle.id, orgId, data.departmentId, data.locationId);

    await activityLogRepository.log({
      org: { connect: { id: orgId } },
      actor: { connect: { id: actorId } },
      module: 'AUDIT',
      action: 'CREATE',
      resourceType: 'AUDIT_CYCLE',
      resourceId: cycle.id,
      description: `Created audit cycle: ${cycle.name} with ${assetCount} assets to verify`,
    });

    return cycle;
  },

  async verifyAsset(cycleId: string, assetId: string, orgId: string, actorId: string, data: VerifyAssetInput) {
    const result = await auditRepository.verifyAsset(cycleId, assetId, {
      status: data.status,
      notes: data.notes,
      location: data.location,
      condition: data.condition,
      verifiedBy: { connect: { id: actorId } },
      verifiedAt: new Date(),
    });

    return result;
  },

  async reportDiscrepancy(cycleId: string, orgId: string, actorId: string, data: ReportDiscrepancyInput) {
    return auditRepository.reportDiscrepancy({
      cycle: { connect: { id: cycleId } },
      asset: data.assetId ? { connect: { id: data.assetId } } : undefined,
      type: data.type,
      description: data.description,
      severity: data.severity,
    });
  },

  async stats(orgId: string) {
    return auditRepository.stats(orgId);
  }
};
