import { prisma } from '@/lib/prisma';
import type { CreateDepartmentInput, UpdateDepartmentInput, DepartmentFiltersInput } from '@/validators/department';
import { buildPaginatedResult } from '@/lib/utils/pagination';

export async function getDepartmentsByOrg(orgId: string, filters: DepartmentFiltersInput) {
  const where = {
    orgId,
    deletedAt: null,
    ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    ...(filters.parentId === 'null'
      ? { parentId: null }
      : filters.parentId
        ? { parentId: filters.parentId }
        : {}),
    ...(filters.search && {
      OR: [
        { name: { contains: filters.search, mode: 'insensitive' as const } },
        { code: { contains: filters.search, mode: 'insensitive' as const } },
        { description: { contains: filters.search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [total, items] = await Promise.all([
    prisma.department.count({ where }),
    prisma.department.findMany({
      where,
      include: {
        parent: { select: { id: true, name: true } },
        head: { select: { id: true, displayName: true, avatarUrl: true, role: true } },
        _count: { select: { members: true } },
      },
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
  ]);

  return buildPaginatedResult(items, total, filters.page, filters.limit);
}

export async function getDepartmentById(id: string, orgId: string) {
  return prisma.department.findFirst({
    where: { id, orgId, deletedAt: null },
    include: {
      parent: { select: { id: true, name: true } },
      children: {
        where: { deletedAt: null },
        select: { id: true, name: true, isActive: true, _count: { select: { members: true } } },
      },
      head: { select: { id: true, displayName: true, avatarUrl: true, role: true } },
      _count: { select: { members: true } },
    },
  });
}

export async function createDepartment(orgId: string, data: CreateDepartmentInput) {
  return prisma.department.create({
    data: {
      orgId,
      name: data.name,
      code: data.code,
      description: data.description,
      parentId: data.parentId,
      headId: data.headId,
      isActive: data.isActive ?? true,
    },
  });
}

export async function updateDepartment(id: string, orgId: string, data: UpdateDepartmentInput) {
  return prisma.department.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.code !== undefined && { code: data.code }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.parentId !== undefined && { parentId: data.parentId }),
      ...(data.headId !== undefined && { headId: data.headId }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
}

export async function softDeleteDepartment(id: string, orgId: string) {
  return prisma.department.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function getAllDepartmentsForOrg(orgId: string) {
  return prisma.department.findMany({
    where: { orgId, deletedAt: null, isActive: true },
    select: { id: true, name: true, parentId: true },
    orderBy: { name: 'asc' },
  });
}
