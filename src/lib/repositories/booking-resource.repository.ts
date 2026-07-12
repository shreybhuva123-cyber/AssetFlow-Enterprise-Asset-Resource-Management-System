import { prisma } from '@/lib/prisma';
import { BookingResourceType, Prisma } from '@prisma/client';

const resourceSelect = {
  id: true, orgId: true, assetId: true, name: true, resourceType: true,
  capacity: true, location: true, description: true, isActive: true, createdAt: true,
  asset: { select: { id: true, assetTag: true, name: true, status: true } },
} satisfies Prisma.BookingResourceSelect;

export type BookingResourceRow = Prisma.BookingResourceGetPayload<{ select: typeof resourceSelect }>;

export const bookingResourceRepository = {
  async findMany(orgId: string, params: { resourceType?: BookingResourceType; search?: string; isActive?: boolean } = {}) {
    const { resourceType, search, isActive = true } = params;
    return prisma.bookingResource.findMany({
      where: {
        orgId, deletedAt: null,
        ...(isActive !== undefined && { isActive }),
        ...(resourceType && { resourceType }),
        ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
      },
      select: resourceSelect,
      orderBy: { name: 'asc' },
    });
  },

  async findById(id: string, orgId: string) {
    return prisma.bookingResource.findFirst({ where: { id, orgId, deletedAt: null }, select: resourceSelect });
  },

  async create(data: Prisma.BookingResourceCreateInput) {
    return prisma.bookingResource.create({ data, select: resourceSelect });
  },
};
