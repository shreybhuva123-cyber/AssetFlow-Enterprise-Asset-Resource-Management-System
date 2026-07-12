import { prisma } from '@/lib/prisma';
import type { MaintenanceStatus, Prisma } from '@prisma/client';

const maintenanceSelect = {
  id: true, orgId: true, assetId: true, requestedById: true, departmentId: true,
  technicianId: true, approvedById: true, closedById: true, title: true,
  description: true, priority: true, category: true, status: true,
  estimatedCost: true, actualCost: true, expectedCompletionDate: true,
  actualCompletionDate: true, startedAt: true, resolvedAt: true,
  approvedAt: true, rejectedAt: true, rejectionReason: true,
  resolutionNotes: true, partsUsed: true, attachments: true, notes: true,
  createdAt: true, updatedAt: true,
  asset: { select: { id: true, assetTag: true, name: true, status: true, condition: true, category: { select: { id: true, name: true, icon: true } } } },
  requestedBy: { select: { id: true, firstName: true, lastName: true, displayName: true, avatarUrl: true } },
  department: { select: { id: true, name: true } },
  technician: { select: { id: true, name: true, type: true, specialty: true } },
  approvedBy: { select: { id: true, displayName: true } },
  closedBy: { select: { id: true, displayName: true } },
} satisfies Prisma.MaintenanceRequestSelect;

export type MaintenanceRow = Prisma.MaintenanceRequestGetPayload<{ select: typeof maintenanceSelect }>;

export const maintenanceRepository = {
  async findMany(orgId: string, params: { status?: MaintenanceStatus; priority?: string; technicianId?: string; assetId?: string; search?: string; page?: number; limit?: number } = {}) {
    const { status, priority, technicianId, assetId, search, page = 1, limit = 20 } = params;
    const where: Prisma.MaintenanceRequestWhereInput = {
      orgId, deletedAt: null,
      ...(status && { status }),
      ...(priority && { priority: priority as Prisma.EnumMaintenancePriorityFilter }),
      ...(technicianId && { technicianId }),
      ...(assetId && { assetId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { asset: { name: { contains: search, mode: 'insensitive' as const } } },
          { asset: { assetTag: { contains: search, mode: 'insensitive' as const } } },
        ],
      }),
    };
    const [data, total] = await prisma.$transaction([
      prisma.maintenanceRequest.findMany({ where, select: maintenanceSelect, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.maintenanceRequest.count({ where }),
    ]);
    return { data, total, page, limit };
  },

  async findById(id: string, orgId: string) {
    return prisma.maintenanceRequest.findFirst({
      where: { id, orgId, deletedAt: null },
      select: {
        ...maintenanceSelect,
        comments: {
          select: { id: true, body: true, isInternal: true, attachments: true, createdAt: true, author: { select: { id: true, displayName: true, avatarUrl: true } } },
          orderBy: { createdAt: 'asc' as const },
        },
        timeline: {
          select: { id: true, event: true, description: true, metadata: true, createdAt: true, actor: { select: { id: true, displayName: true } } },
          orderBy: { createdAt: 'desc' as const },
        },
      }
    });
  },

  async create(data: Prisma.MaintenanceRequestCreateInput) {
    return prisma.maintenanceRequest.create({ data, select: maintenanceSelect });
  },

  async update(id: string, data: Prisma.MaintenanceRequestUpdateInput) {
    return prisma.maintenanceRequest.update({ where: { id }, data, select: maintenanceSelect });
  },

  async addComment(data: Prisma.MaintenanceCommentCreateInput) {
    return prisma.maintenanceComment.create({
      data,
      select: { id: true, body: true, isInternal: true, attachments: true, createdAt: true, author: { select: { id: true, displayName: true, avatarUrl: true } } }
    });
  },

  async addTimelineEvent(data: Prisma.MaintenanceTimelineCreateInput) {
    return prisma.maintenanceTimeline.create({ data });
  },

  async stats(orgId: string) {
    const [pending, inProgress, resolved, totalCostRes] = await prisma.$transaction([
      prisma.maintenanceRequest.count({ where: { orgId, status: { in: ['PENDING', 'APPROVED', 'ASSIGNED'] }, deletedAt: null } }),
      prisma.maintenanceRequest.count({ where: { orgId, status: 'IN_PROGRESS', deletedAt: null } }),
      prisma.maintenanceRequest.count({ where: { orgId, status: 'RESOLVED', deletedAt: null } }),
      prisma.maintenanceRequest.aggregate({ where: { orgId, deletedAt: null }, _sum: { actualCost: true } })
    ]);
    return { pending, inProgress, resolved, totalCost: totalCostRes._sum.actualCost || 0 };
  }
};
