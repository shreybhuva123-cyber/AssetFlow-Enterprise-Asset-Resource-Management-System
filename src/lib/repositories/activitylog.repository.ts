import { prisma } from '@/lib/prisma';
import { ActivitySeverity, Prisma } from '@prisma/client';

export const activityLogRepository = {
  async findMany(orgId: string, params: { module?: string; action?: string; severity?: ActivitySeverity; actorId?: string; search?: string; page?: number; limit?: number } = {}) {
    const { module, action, severity, actorId, search, page = 1, limit = 20 } = params;
    const where: Prisma.ActivityLogWhereInput = {
      orgId,
      ...(module && { module }),
      ...(action && { action }),
      ...(severity && { severity }),
      ...(actorId && { actorId }),
      ...(search && {
        OR: [
          { description: { contains: search, mode: 'insensitive' as const } },
          { actor: { displayName: { contains: search, mode: 'insensitive' as const } } }
        ]
      })
    };

    const [data, total] = await prisma.$transaction([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { actor: { select: { id: true, displayName: true, avatarUrl: true } } }
      }),
      prisma.activityLog.count({ where }),
    ]);

    return { data, total, page, limit };
  },

  async log(data: Prisma.ActivityLogCreateInput) {
    return prisma.activityLog.create({ data });
  }
};
