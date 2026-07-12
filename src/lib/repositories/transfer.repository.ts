import { prisma } from '@/lib/prisma';
import { TransferStatus, Prisma } from '@prisma/client';

const transferSelect = {
  id: true, orgId: true, assetId: true, requestedById: true, fromEmployeeId: true,
  toEmployeeId: true, fromDepartmentId: true, toDepartmentId: true, status: true,
  reason: true, notes: true, requestedAt: true, scheduledDate: true, completedAt: true,
  createdAt: true, updatedAt: true,
  asset: { select: { id: true, assetTag: true, name: true, status: true, condition: true, category: { select: { id: true, name: true, icon: true } } } },
  requestedBy: { select: { id: true, firstName: true, lastName: true, displayName: true, avatarUrl: true } },
  fromEmployee: { select: { id: true, firstName: true, lastName: true, displayName: true, avatarUrl: true } },
  toEmployee: { select: { id: true, firstName: true, lastName: true, displayName: true, avatarUrl: true } },
  fromDepartment: { select: { id: true, name: true } },
  toDepartment: { select: { id: true, name: true } },
  approvals: { select: { id: true, decision: true, comments: true, decidedAt: true, approver: { select: { id: true, displayName: true, avatarUrl: true } } }, orderBy: { decidedAt: 'desc' as const } },
} satisfies Prisma.AssetTransferSelect;

export type TransferRow = Prisma.AssetTransferGetPayload<{ select: typeof transferSelect }>;

export const transferRepository = {
  async findMany(orgId: string, params: { status?: TransferStatus; search?: string; page?: number; limit?: number } = {}) {
    const { status, search, page = 1, limit = 20 } = params;
    const where: Prisma.AssetTransferWhereInput = {
      orgId, deletedAt: null,
      ...(status && { status }),
      ...(search && {
        OR: [
          { asset: { name: { contains: search, mode: 'insensitive' as const } } },
          { toEmployee: { displayName: { contains: search, mode: 'insensitive' as const } } },
        ],
      }),
    };
    const [data, total] = await prisma.$transaction([
      prisma.assetTransfer.findMany({ where, select: transferSelect, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.assetTransfer.count({ where }),
    ]);
    return { data, total, page, limit };
  },

  async findById(id: string, orgId: string) {
    return prisma.assetTransfer.findFirst({ where: { id, orgId, deletedAt: null }, select: transferSelect });
  },

  async create(data: Prisma.AssetTransferCreateInput) {
    return prisma.assetTransfer.create({ data, select: transferSelect });
  },

  async update(id: string, data: Prisma.AssetTransferUpdateInput) {
    return prisma.assetTransfer.update({ where: { id }, data, select: transferSelect });
  },

  async stats(orgId: string) {
    const [pending, approved, completed] = await prisma.$transaction([
      prisma.assetTransfer.count({ where: { orgId, status: { in: ['REQUESTED', 'PENDING_APPROVAL'] }, deletedAt: null } }),
      prisma.assetTransfer.count({ where: { orgId, status: 'APPROVED', deletedAt: null } }),
      prisma.assetTransfer.count({ where: { orgId, status: 'COMPLETED', deletedAt: null } }),
    ]);
    return { pending, approved, completed };
  },
};
