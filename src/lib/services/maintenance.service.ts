import { maintenanceRepository } from '../repositories/maintenance.repository';
import { activityLogRepository } from '../repositories/activitylog.repository';
import { CreateMaintenanceInput, UpdateMaintenanceInput, ApproveMaintenanceInput, AddCommentInput } from '@/validators/maintenance';
import { prisma } from '../prisma';

export const maintenanceService = {
  async findMany(orgId: string, params: any) {
    return maintenanceRepository.findMany(orgId, params);
  },

  async findById(id: string, orgId: string) {
    return maintenanceRepository.findById(id, orgId);
  },

  async create(orgId: string, actorId: string, data: CreateMaintenanceInput) {
    const request = await maintenanceRepository.create({
      org: { connect: { id: orgId } },
      asset: { connect: { id: data.assetId } },
      requestedBy: { connect: { id: actorId } },
      title: data.title,
      description: data.description,
      priority: data.priority,
      category: data.category,
      department: data.departmentId ? { connect: { id: data.departmentId } } : undefined,
      technician: data.technicianId ? { connect: { id: data.technicianId } } : undefined,
      expectedCompletionDate: data.expectedCompletionDate ? new Date(data.expectedCompletionDate) : undefined,
      estimatedCost: data.estimatedCost,
      attachments: data.attachments || [],
      notes: data.notes,
    });

    await maintenanceRepository.addTimelineEvent({
      maintenance: { connect: { id: request.id } },
      actor: { connect: { id: actorId } },
      event: 'CREATED',
      description: 'Maintenance request submitted',
    });

    await activityLogRepository.log({
      org: { connect: { id: orgId } },
      actor: { connect: { id: actorId } },
      module: 'MAINTENANCE',
      action: 'CREATE',
      resourceType: 'MAINTENANCE_REQUEST',
      resourceId: request.id,
      description: `Created maintenance request: ${request.title}`,
    });

    return request;
  },

  async approve(id: string, orgId: string, actorId: string, data: ApproveMaintenanceInput) {
    const req = await maintenanceRepository.findById(id, orgId);
    if (!req || req.status !== 'PENDING') throw new Error('Invalid request or status');

    const status = data.decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';
    
    const request = await maintenanceRepository.update(id, {
      status,
      approvedBy: { connect: { id: actorId } },
      approvedAt: data.decision === 'APPROVED' ? new Date() : undefined,
      rejectedAt: data.decision === 'REJECTED' ? new Date() : undefined,
      rejectionReason: data.decision === 'REJECTED' ? data.comments : undefined,
    });

    if (data.decision === 'APPROVED') {
      await prisma.asset.update({
        where: { id: req.assetId },
        data: { status: 'UNDER_MAINTENANCE' }
      });
    }

    await maintenanceRepository.addTimelineEvent({
      maintenance: { connect: { id } },
      actor: { connect: { id: actorId } },
      event: data.decision,
      description: data.comments || `Request ${status.toLowerCase()}`,
    });

    return request;
  },

  async addComment(id: string, orgId: string, actorId: string, data: AddCommentInput) {
    const req = await maintenanceRepository.findById(id, orgId);
    if (!req) throw new Error('Not found');

    return maintenanceRepository.addComment({
      maintenance: { connect: { id } },
      author: { connect: { id: actorId } },
      body: data.body,
      isInternal: data.isInternal,
      attachments: data.attachments || [],
    });
  },

  async stats(orgId: string) {
    return maintenanceRepository.stats(orgId);
  }
};
