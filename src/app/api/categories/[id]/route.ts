import { type NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { validateBody } from '@/lib/api/validate-body';
import { updateAssetCategorySchema } from '@/validators/asset-category';
import {
  getAssetCategoryById,
  updateAssetCategory,
  softDeleteAssetCategory,
} from '@/lib/repositories/asset-category.repository';
import { createAuditLog, getClientIp, getUserAgent } from '@/lib/api/audit';
import { successResponse, notFoundResponse, forbiddenResponse, noContentResponse } from '@/lib/utils/api-response';
import { canManageCategories } from '@/lib/auth/rbac';

type RouteParams = { params: Promise<{ id: string }> };

export const GET = withAuth(async (_req, ctx, { params }: RouteParams) => {
  const { id } = await params;
  if (!ctx.profile.orgId) return notFoundResponse('Category not found');

  const category = await getAssetCategoryById(id, ctx.profile.orgId);
  if (!category) return notFoundResponse('Category not found');

  return successResponse(category);
});

export const PATCH = withAuth(async (req: NextRequest, ctx, { params }: RouteParams) => {
  const { id } = await params;
  if (!canManageCategories(ctx.profile)) return forbiddenResponse('Insufficient permissions');
  if (!ctx.profile.orgId) return forbiddenResponse('No organization');

  const existing = await getAssetCategoryById(id, ctx.profile.orgId);
  if (!existing) return notFoundResponse('Category not found');

  const { data, error } = await validateBody(req, updateAssetCategorySchema);
  if (error) return error;

  const updated = await updateAssetCategory(id, ctx.profile.orgId, data);

  await createAuditLog({
    orgId: ctx.profile.orgId,
    actorId: ctx.profile.id,
    action: 'UPDATE',
    resource: 'ASSET_CATEGORY',
    resourceId: id,
    description: `Updated category: ${existing.name}`,
    oldValues: existing as unknown as Record<string, unknown>,
    newValues: data as Record<string, unknown>,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  });

  return successResponse(updated);
});

export const DELETE = withAuth(async (req: NextRequest, ctx, { params }: RouteParams) => {
  const { id } = await params;
  if (!canManageCategories(ctx.profile)) return forbiddenResponse('Insufficient permissions');
  if (!ctx.profile.orgId) return forbiddenResponse('No organization');

  const existing = await getAssetCategoryById(id, ctx.profile.orgId);
  if (!existing) return notFoundResponse('Category not found');

  await softDeleteAssetCategory(id, ctx.profile.orgId);

  await createAuditLog({
    orgId: ctx.profile.orgId,
    actorId: ctx.profile.id,
    action: 'DELETE',
    resource: 'ASSET_CATEGORY',
    resourceId: id,
    description: `Deleted category: ${existing.name}`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  });

  return noContentResponse();
});
