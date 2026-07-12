import { type NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { validateBody, validateQuery } from '@/lib/api/validate-body';
import { createAssetCategorySchema, assetCategoryFiltersSchema } from '@/validators/asset-category';
import { getAssetCategoriesByOrg, createAssetCategory } from '@/lib/repositories/asset-category.repository';
import { createAuditLog, getClientIp, getUserAgent } from '@/lib/api/audit';
import { successResponse, createdResponse, forbiddenResponse } from '@/lib/utils/api-response';
import { canManageCategories } from '@/lib/auth/rbac';

export const GET = withAuth(async (req: NextRequest, ctx) => {
  const { data: filters, error } = validateQuery(req.nextUrl.searchParams, assetCategoryFiltersSchema);
  if (error) return error;

  if (!ctx.profile.orgId) return successResponse({ items: [], total: 0, page: 1, limit: filters.limit, totalPages: 0 });

  const result = await getAssetCategoriesByOrg(ctx.profile.orgId, filters);
  return successResponse(result);
});

export const POST = withAuth(async (req: NextRequest, ctx) => {
  if (!canManageCategories(ctx.profile)) {
    return forbiddenResponse('Only Admins and Asset Managers can create categories');
  }

  const { data, error } = await validateBody(req, createAssetCategorySchema);
  if (error) return error;

  if (!ctx.profile.orgId) return forbiddenResponse('No organization associated with your account');

  const category = await createAssetCategory(ctx.profile.orgId, data);

  await createAuditLog({
    orgId: ctx.profile.orgId,
    actorId: ctx.profile.id,
    action: 'CREATE',
    resource: 'ASSET_CATEGORY',
    resourceId: category.id,
    description: `Created category: ${category.name}`,
    newValues: data as Record<string, unknown>,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  });

  return createdResponse(category);
});
