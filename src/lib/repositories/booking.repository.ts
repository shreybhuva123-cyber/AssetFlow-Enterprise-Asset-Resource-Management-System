import { prisma } from '@/lib/prisma';
import type { BookingStatus, Prisma } from '@prisma/client';

const bookingSelect = {
  id: true, orgId: true, resourceId: true, bookedById: true, departmentId: true,
  title: true, purpose: true, startTime: true, endTime: true, status: true,
  priority: true, attendeeCount: true, notes: true, cancelReason: true,
  cancelledAt: true, cancelledById: true, createdAt: true, updatedAt: true,
  resource: { select: { id: true, name: true, resourceType: true, capacity: true, location: true } },
  bookedBy: { select: { id: true, firstName: true, lastName: true, displayName: true, avatarUrl: true } },
  department: { select: { id: true, name: true } },
  cancelledBy: { select: { id: true, displayName: true } },
  participants: { select: { id: true, role: true, profile: { select: { id: true, displayName: true, avatarUrl: true } } } },
} satisfies Prisma.BookingSelect;

export type BookingRow = Prisma.BookingGetPayload<{ select: typeof bookingSelect }>;

export const bookingRepository = {
  async findMany(orgId: string, params: { status?: BookingStatus; resourceId?: string; bookedById?: string; from?: Date; to?: Date; search?: string; page?: number; limit?: number } = {}) {
    const { status, resourceId, bookedById, from, to, search, page = 1, limit = 20 } = params;
    const where: Prisma.BookingWhereInput = {
      orgId, deletedAt: null,
      ...(status && { status }),
      ...(resourceId && { resourceId }),
      ...(bookedById && { bookedById }),
      ...(from && { startTime: { gte: from } }),
      ...(to && { endTime: { lte: to } }),
      ...(search && { title: { contains: search, mode: 'insensitive' as const } }),
    };
    const [data, total] = await prisma.$transaction([
      prisma.booking.findMany({ where, select: bookingSelect, orderBy: { startTime: 'asc' }, skip: (page - 1) * limit, take: limit }),
      prisma.booking.count({ where }),
    ]);
    return { data, total, page, limit };
  },

  async findById(id: string, orgId: string) {
    return prisma.booking.findFirst({ where: { id, orgId, deletedAt: null }, select: bookingSelect });
  },

  async findOverlapping(resourceId: string, startTime: Date, endTime: Date, excludeId?: string) {
    return prisma.booking.findMany({
      where: {
        resourceId,
        deletedAt: null,
        status: { notIn: ['CANCELLED', 'EXPIRED'] },
        ...(excludeId && { id: { not: excludeId } }),
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } },
        ],
      },
      select: bookingSelect,
    });
  },

  async findCalendarEvents(orgId: string, from: Date, to: Date) {
    return prisma.booking.findMany({
      where: { orgId, deletedAt: null, status: { notIn: ['CANCELLED', 'EXPIRED'] }, startTime: { gte: from }, endTime: { lte: to } },
      select: bookingSelect,
      orderBy: { startTime: 'asc' },
    });
  },

  async create(data: Prisma.BookingCreateInput) {
    return prisma.booking.create({ data, select: bookingSelect });
  },

  async update(id: string, data: Prisma.BookingUpdateInput) {
    return prisma.booking.update({ where: { id }, data, select: bookingSelect });
  },

  async stats(orgId: string) {
    const now = new Date();
    const [upcoming, ongoing, todayCount] = await prisma.$transaction([
      prisma.booking.count({ where: { orgId, status: 'UPCOMING', deletedAt: null, startTime: { gt: now } } }),
      prisma.booking.count({ where: { orgId, status: 'ONGOING', deletedAt: null } }),
      prisma.booking.count({ where: { orgId, deletedAt: null, status: { notIn: ['CANCELLED', 'EXPIRED'] }, startTime: { gte: new Date(now.setHours(0,0,0,0)) }, endTime: { lte: new Date(now.setHours(23,59,59,999)) } } }),
    ]);
    return { upcoming, ongoing, todayCount };
  },
};
