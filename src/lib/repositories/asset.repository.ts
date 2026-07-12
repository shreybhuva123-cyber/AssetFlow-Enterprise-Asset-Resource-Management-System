import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { AssetFiltersInput, CreateAssetInput, UpdateAssetInput } from '@/validators/asset';
import { AssetStatus, AssetCondition } from '@/constants/status';

// ─── Full Asset Select (for detail view) ─────────────────────────────────────

export const assetFullSelect = {
  id: true,
  orgId: true,
  assetTag: true,
  name: true,
  serialNumber: true,
  categoryId: true,
  departmentId: true,
  currentLocation: true,
  manufacturer: true,
  model: true,
  purchaseDate: true,
  warrantyExpiry: true,
  acquisitionCost: true,
  condition: true,
  status: true,
  description: true,
  notes: true,
  isBookable: true,
  isShared: true,
  assignedToId: true,
  customFields: true,
  metadata: true,
  createdById: true,
  updatedById: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  category: { select: { id: true, name: true, icon: true, color: true } },
  department: { select: { id: true, name: true, code: true } },
  assignedTo: { select: { id: true, displayName: true, avatarUrl: true, jobTitle: true } },
  createdBy: { select: { id: true, displayName: true, avatarUrl: true } },
  updatedBy: { select: { id: true, displayName: true, avatarUrl: true } },
  images: {
    select: { id: true, publicUrl: true, fileName: true, isPrimary: true, sortOrder: true, fileSize: true, mimeType: true, createdAt: true },
    orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }],
  },
  documents: {
    select: { id: true, publicUrl: true, fileName: true, fileSize: true, mimeType: true, documentType: true, description: true, createdAt: true },
    orderBy: { createdAt: 'desc' as const },
  },
  qrCodes: {
    select: { id: true, qrData: true, qrDataUrl: true, createdAt: true },
    orderBy: { createdAt: 'desc' as const },
    take: 1,
  },
  barcodes: {
    select: { id: true, barcodeData: true, barcodeType: true, createdAt: true },
    orderBy: { createdAt: 'desc' as const },
    take: 1,
  },
} satisfies Prisma.AssetSelect;

// ─── List Select (lighter for table view) ─────────────────────────────────────

export const assetListSelect = {
  id: true,
  assetTag: true,
  name: true,
  serialNumber: true,
  status: true,
  condition: true,
  currentLocation: true,
  acquisitionCost: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true, icon: true, color: true } },
  department: { select: { id: true, name: true } },
  assignedTo: { select: { id: true, displayName: true, avatarUrl: true } },
  images: {
    select: { publicUrl: true, isPrimary: true },
    where: { isPrimary: true },
    take: 1,
  },
} satisfies Prisma.AssetSelect;

// ─── Build Where Clause ────────────────────────────────────────────────────────

function buildWhereClause(orgId: string, filters: Partial<AssetFiltersInput>): Prisma.AssetWhereInput {
  const where: Prisma.AssetWhereInput = {
    orgId,
    deletedAt: null,
  };

  if (filters.status) {
    const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
    where.status = { in: statuses as AssetStatus[] };
  }

  if (filters.condition) {
    const conditions = Array.isArray(filters.condition) ? filters.condition : [filters.condition];
    where.condition = { in: conditions as AssetCondition[] };
  }

  if (filters.categoryId)   where.categoryId   = filters.categoryId;
  if (filters.departmentId) where.departmentId = filters.departmentId;
  if (filters.assignedToId) where.assignedToId = filters.assignedToId;
  if (typeof filters.isBookable === 'boolean') where.isBookable = filters.isBookable;
  if (typeof filters.isShared   === 'boolean') where.isShared   = filters.isShared;

  if (filters.from || filters.to) {
    where.createdAt = {
      ...(filters.from ? { gte: new Date(filters.from) } : {}),
      ...(filters.to   ? { lte: new Date(filters.to)   } : {}),
    };
  }

  if (filters.search) {
    const q = filters.search.trim();
    where.OR = [
      { name:           { contains: q, mode: 'insensitive' } },
      { assetTag:       { contains: q, mode: 'insensitive' } },
      { serialNumber:   { contains: q, mode: 'insensitive' } },
      { manufacturer:   { contains: q, mode: 'insensitive' } },
      { model:          { contains: q, mode: 'insensitive' } },
      { currentLocation:{ contains: q, mode: 'insensitive' } },
      { description:    { contains: q, mode: 'insensitive' } },
    ];
  }

  return where;
}

// ─── Queries ───────────────────────────────────────────────────────────────────

export async function getAssets(orgId: string, filters: AssetFiltersInput) {
  const where  = buildWhereClause(orgId, filters);
  const skip   = (filters.page - 1) * filters.limit;
  const take   = filters.limit;
  const orderBy = { [filters.sortBy]: filters.sortOrder };

  const [total, items] = await Promise.all([
    prisma.asset.count({ where }),
    prisma.asset.findMany({ where, select: assetListSelect, orderBy, skip, take }),
  ]);

  return {
    data:  items,
    pagination: {
      page:       filters.page,
      pageSize:   filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
      hasNextPage:     filters.page < Math.ceil(total / filters.limit),
      hasPreviousPage: filters.page > 1,
    },
  };
}

export async function getAssetById(id: string, orgId: string) {
  return prisma.asset.findFirst({
    where: { id, orgId, deletedAt: null },
    select: assetFullSelect,
  });
}

export async function getAssetByTag(assetTag: string, orgId: string) {
  return prisma.asset.findFirst({
    where: { assetTag, orgId, deletedAt: null },
    select: assetFullSelect,
  });
}

// ─── Tag Generation ────────────────────────────────────────────────────────────

export async function generateNextAssetTag(orgId: string): Promise<string> {
  // Use a raw query to get the highest numeric suffix for this org atomically
  const result = await prisma.$queryRaw<{ max_num: number | null }[]>`
    SELECT MAX(
      CAST(SUBSTRING(asset_tag FROM 4) AS INTEGER)
    ) AS max_num
    FROM assets
    WHERE org_id = ${orgId}::uuid
      AND asset_tag ~ '^AF-[0-9]+$'
  `;

  const maxNum = result[0]?.max_num ?? 0;
  const next   = maxNum + 1;
  return `AF-${String(next).padStart(6, '0')}`;
}

// ─── Mutations ─────────────────────────────────────────────────────────────────

export async function createAsset(
  orgId:   string,
  data:    CreateAssetInput,
  actorId: string,
) {
  const assetTag = await generateNextAssetTag(orgId);

  return prisma.asset.create({
    data: {
      orgId,
      assetTag,
      name:            data.name,
      serialNumber:    data.serialNumber ?? null,
      categoryId:      data.categoryId ?? null,
      departmentId:    data.departmentId ?? null,
      currentLocation: data.currentLocation ?? null,
      manufacturer:    data.manufacturer ?? null,
      model:           data.model ?? null,
      purchaseDate:    data.purchaseDate ? new Date(data.purchaseDate) : null,
      warrantyExpiry:  data.warrantyExpiry ? new Date(data.warrantyExpiry) : null,
      acquisitionCost: data.acquisitionCost ? new Prisma.Decimal(data.acquisitionCost) : null,
      condition:       data.condition,
      status:          data.status,
      description:     data.description ?? null,
      notes:           data.notes ?? null,
      isBookable:      data.isBookable,
      isShared:        data.isShared,
      assignedToId:    data.assignedToId ?? null,
      customFields:    (data.customFields ?? {}) as Prisma.InputJsonValue,
      createdById:     actorId,
      updatedById:     actorId,
    },
    select: assetFullSelect,
  });
}

export async function updateAsset(
  id:      string,
  orgId:   string,
  data:    UpdateAssetInput,
  actorId: string,
) {
  return prisma.asset.update({
    where: { id },
    data: {
      ...(data.name            !== undefined && { name:            data.name }),
      ...(data.serialNumber    !== undefined && { serialNumber:    data.serialNumber }),
      ...(data.categoryId      !== undefined && { categoryId:      data.categoryId }),
      ...(data.departmentId    !== undefined && { departmentId:    data.departmentId }),
      ...(data.currentLocation !== undefined && { currentLocation: data.currentLocation }),
      ...(data.manufacturer    !== undefined && { manufacturer:    data.manufacturer }),
      ...(data.model           !== undefined && { model:           data.model }),
      ...(data.purchaseDate    !== undefined && { purchaseDate:    data.purchaseDate ? new Date(data.purchaseDate) : null }),
      ...(data.warrantyExpiry  !== undefined && { warrantyExpiry:  data.warrantyExpiry ? new Date(data.warrantyExpiry) : null }),
      ...(data.acquisitionCost !== undefined && { acquisitionCost: data.acquisitionCost != null ? new Prisma.Decimal(data.acquisitionCost) : null }),
      ...(data.condition       !== undefined && { condition:       data.condition }),
      ...(data.description     !== undefined && { description:     data.description }),
      ...(data.notes           !== undefined && { notes:           data.notes }),
      ...(data.isBookable      !== undefined && { isBookable:      data.isBookable }),
      ...(data.isShared        !== undefined && { isShared:        data.isShared }),
      ...(data.assignedToId    !== undefined && { assignedToId:    data.assignedToId }),
      ...(data.customFields    !== undefined && { customFields:    data.customFields as Prisma.InputJsonValue }),
      updatedById: actorId,
    },
    select: assetFullSelect,
  });
}

export async function updateAssetStatus(
  id:      string,
  orgId:   string,
  status:  AssetStatus,
  actorId: string,
) {
  return prisma.asset.update({
    where: { id },
    data:  { status, updatedById: actorId },
    select: assetFullSelect,
  });
}

export async function softDeleteAsset(id: string, orgId: string, actorId: string) {
  return prisma.asset.update({
    where: { id },
    data:  { deletedAt: new Date(), updatedById: actorId },
  });
}

// ─── Bulk Operations ───────────────────────────────────────────────────────────

export async function bulkUpdateStatus(
  ids:     string[],
  orgId:   string,
  status:  AssetStatus,
  actorId: string,
) {
  return prisma.asset.updateMany({
    where: { id: { in: ids }, orgId, deletedAt: null },
    data:  { status, updatedById: actorId },
  });
}

export async function bulkSoftDelete(ids: string[], orgId: string, actorId: string) {
  return prisma.asset.updateMany({
    where: { id: { in: ids }, orgId, deletedAt: null },
    data:  { deletedAt: new Date(), updatedById: actorId },
  });
}

export async function getAssetsForExport(orgId: string, filters: Partial<AssetFiltersInput>, ids?: string[]) {
  const where = buildWhereClause(orgId, filters as AssetFiltersInput);
  if (ids?.length) where.id = { in: ids };

  const exportSelect = {
    ...assetListSelect,
    manufacturer:   true,
    model:          true,
    purchaseDate:   true,
    warrantyExpiry: true,
    isBookable:     true,
    isShared:       true,
    notes:          true,
  } satisfies Prisma.AssetSelect;

  return prisma.asset.findMany({
    where,
    select:  exportSelect,
    orderBy: { createdAt: 'desc' },
    take:    10000, // max export limit
  });
}

// ─── Statistics ────────────────────────────────────────────────────────────────

export async function getAssetStats(orgId: string) {
  const [statusCounts, conditionCounts, categoryDistribution, departmentDistribution, recentAssets, total] =
    await Promise.all([
      // Status counts
      prisma.asset.groupBy({
        by: ['status'],
        where: { orgId, deletedAt: null },
        _count: true,
      }),
      // Condition counts
      prisma.asset.groupBy({
        by: ['condition'],
        where: { orgId, deletedAt: null },
        _count: true,
      }),
      // Category distribution
      prisma.asset.groupBy({
        by: ['categoryId'],
        where: { orgId, deletedAt: null },
        _count: true,
      }),
      // Department distribution
      prisma.asset.groupBy({
        by: ['departmentId'],
        where: { orgId, deletedAt: null },
        _count: true,
      }),
      // Recent assets
      prisma.asset.findMany({
        where: { orgId, deletedAt: null },
        select: assetListSelect,
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      // Total count
      prisma.asset.count({ where: { orgId, deletedAt: null } }),
    ]);

  const byStatus = Object.fromEntries(
    statusCounts.map((s) => [s.status, s._count]),
  ) as Record<AssetStatus, number>;

  const byCondition = Object.fromEntries(
    conditionCounts.map((c) => [c.condition, c._count]),
  ) as Record<AssetCondition, number>;

  return {
    total,
    byStatus: {
      available:        byStatus[AssetStatus.AVAILABLE]         ?? 0,
      allocated:        byStatus[AssetStatus.ALLOCATED]         ?? 0,
      reserved:         byStatus[AssetStatus.RESERVED]          ?? 0,
      underMaintenance: byStatus[AssetStatus.UNDER_MAINTENANCE] ?? 0,
      lost:             byStatus[AssetStatus.LOST]              ?? 0,
      retired:          byStatus[AssetStatus.RETIRED]           ?? 0,
      disposed:         byStatus[AssetStatus.DISPOSED]          ?? 0,
    },
    byCondition: {
      excellent: byCondition[AssetCondition.EXCELLENT] ?? 0,
      good:      byCondition[AssetCondition.GOOD]      ?? 0,
      fair:      byCondition[AssetCondition.FAIR]      ?? 0,
      poor:      byCondition[AssetCondition.POOR]      ?? 0,
      damaged:   byCondition[AssetCondition.DAMAGED]   ?? 0,
    },
    categoryDistribution,
    departmentDistribution,
    recentAssets,
  };
}

export async function checkSerialNumberExists(serialNumber: string, orgId: string, excludeId?: string): Promise<boolean> {
  const asset = await prisma.asset.findFirst({
    where: {
      serialNumber,
      orgId,
      deletedAt: null,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });
  return !!asset;
}
