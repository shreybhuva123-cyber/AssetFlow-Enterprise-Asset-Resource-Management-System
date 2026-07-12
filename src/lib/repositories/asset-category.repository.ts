import { prisma } from '@/lib/prisma';
import type { CreateAssetCategoryInput, UpdateAssetCategoryInput, AssetCategoryFiltersInput } from '@/validators/asset-category';
import { buildPaginatedResult } from '@/lib/utils/pagination';
import type { DynamicField } from '@/types/asset-category';

export async function getAssetCategoriesByOrg(orgId: string, filters: AssetCategoryFiltersInput) {
  const where = {
    orgId,
    deletedAt: null,
    ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    ...(filters.search && {
      OR: [
        { name: { contains: filters.search, mode: 'insensitive' as const } },
        { description: { contains: filters.search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [total, items] = await Promise.all([
    prisma.assetCategory.count({ where }),
    prisma.assetCategory.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
  ]);

  return buildPaginatedResult(items, total, filters.page, filters.limit);
}

export async function getAssetCategoryById(id: string, orgId: string) {
  return prisma.assetCategory.findFirst({
    where: { id, orgId, deletedAt: null },
  });
}

export async function createAssetCategory(orgId: string, data: CreateAssetCategoryInput) {
  return prisma.assetCategory.create({
    data: {
      orgId,
      name: data.name,
      description: data.description,
      icon: data.icon,
      color: data.color,
      dynamicFields: (data.dynamicFields ?? []) as unknown as Parameters<typeof prisma.assetCategory.create>[0]['data']['dynamicFields'],
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder ?? 0,
    },
  });
}

export async function updateAssetCategory(id: string, orgId: string, data: UpdateAssetCategoryInput) {
  return prisma.assetCategory.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.icon !== undefined && { icon: data.icon }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.dynamicFields !== undefined && { dynamicFields: data.dynamicFields as unknown as Parameters<typeof prisma.assetCategory.update>[0]['data']['dynamicFields'] }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    },
  });
}

export async function softDeleteAssetCategory(id: string, orgId: string) {
  return prisma.assetCategory.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function getAllCategoriesForOrg(orgId: string) {
  return prisma.assetCategory.findMany({
    where: { orgId, deletedAt: null, isActive: true },
    select: { id: true, name: true, icon: true, color: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });
}
