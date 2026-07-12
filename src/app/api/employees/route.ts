import { type NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { validateQuery } from '@/lib/api/validate-body';
import { employeeFiltersSchema } from '@/validators/employee';
import { getEmployeesByOrg } from '@/lib/repositories/employee.repository';
import { successResponse, forbiddenResponse } from '@/lib/utils/api-response';
import { isAtLeastRole } from '@/lib/auth/rbac';
import { UserRole } from '@/types/auth';

export const GET = withAuth(async (req: NextRequest, ctx) => {
  if (!isAtLeastRole(ctx.profile, UserRole.ASSET_MANAGER)) {
    return forbiddenResponse('Insufficient permissions to view employee directory');
  }

  const { data: filters, error } = validateQuery(req.nextUrl.searchParams, employeeFiltersSchema);
  if (error) return error;

  if (!ctx.profile.orgId) return successResponse({ items: [], total: 0, page: 1, limit: filters.limit, totalPages: 0 });

  const result = await getEmployeesByOrg(ctx.profile.orgId, filters);

  // Note: email lookup via supabase.auth.admin requires SUPABASE_SERVICE_ROLE_KEY.
  // With only the anon key, admin is not available. We omit email here; the auth store
  // holds the current user's email from the Supabase session.
  return successResponse(result);
});
