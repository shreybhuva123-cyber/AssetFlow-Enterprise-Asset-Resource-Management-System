import { prisma } from '@/lib/prisma';
import type { EmployeeFiltersInput } from '@/validators/employee';
import { buildPaginatedResult } from '@/lib/utils/pagination';
import type { UserRole } from '@/types/auth';

export async function getEmployeesByOrg(orgId: string, filters: EmployeeFiltersInput) {
  const where = {
    orgId,
    ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    ...(filters.role && { role: filters.role }),
    ...(filters.departmentId && { departmentId: filters.departmentId }),
    ...(filters.search && {
      OR: [
        { firstName: { contains: filters.search, mode: 'insensitive' as const } },
        { lastName: { contains: filters.search, mode: 'insensitive' as const } },
        { displayName: { contains: filters.search, mode: 'insensitive' as const } },
        { jobTitle: { contains: filters.search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [total, items] = await Promise.all([
    prisma.profile.count({ where }),
    prisma.profile.findMany({
      where,
      include: {
        department: { select: { id: true, name: true } },
      },
      orderBy: [{ isActive: 'desc' }, { firstName: 'asc' }, { lastName: 'asc' }],
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
  ]);

  return buildPaginatedResult(items, total, filters.page, filters.limit);
}

export async function getEmployeeById(id: string, orgId: string) {
  return prisma.profile.findFirst({
    where: { id, orgId },
    include: {
      department: { select: { id: true, name: true } },
    },
  });
}

export async function getProfileByUserId(userId: string) {
  return prisma.profile.findUnique({ where: { userId } });
}

export async function updateEmployee(
  id: string,
  data: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    phone?: string | null;
    jobTitle?: string | null;
    departmentId?: string | null;
    avatarUrl?: string | null;
    isActive?: boolean;
  },
) {
  return prisma.profile.update({
    where: { id },
    data,
  });
}

export async function updateEmployeeRole(id: string, role: UserRole) {
  return prisma.profile.update({
    where: { id },
    data: { role },
  });
}
