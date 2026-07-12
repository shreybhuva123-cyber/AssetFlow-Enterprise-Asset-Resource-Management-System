import { type NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { validateQuery } from '@/lib/api/validate-body';
import { employeeFiltersSchema } from '@/validators/employee';
import { getEmployeesByOrg } from '@/lib/repositories/employee.repository';
import { getSupabaseServer } from '@/lib/supabase/server';
import { successResponse, forbiddenResponse } from '@/lib/utils/api-response';
import { isAtLeastRole } from '@/lib/auth/rbac';
import { UserRole } from '@/types/auth';

export const GET = withAuth(async (req: NextRequest, ctx) => {
  // Dept heads can only see their own department
  if (!isAtLeastRole(ctx.profile, UserRole.ASSET_MANAGER)) {
    return forbiddenResponse('Insufficient permissions to view employee directory');
  }

  const { data: filters, error } = validateQuery(req.nextUrl.searchParams, employeeFiltersSchema);
  if (error) return error;

  if (!ctx.profile.orgId) return successResponse({ items: [], total: 0, page: 1, limit: filters.limit, totalPages: 0 });

  const result = await getEmployeesByOrg(ctx.profile.orgId, filters);

  // Fetch emails from Supabase auth
  const supabase = await getSupabaseServer();
  const userIds = (result.items as Array<{ userId: string }>).map((p) => p.userId);

  const emailMap: Record<string, string> = {};
  for (const uid of userIds) {
    const { data } = await supabase.auth.admin?.getUserById(uid) ?? { data: null };
    if (data?.user) emailMap[uid] = data.user.email ?? '';
  }

  const items = (result.items as Array<Record<string, unknown> & { userId: string }>).map((p) => ({
    ...p,
    email: emailMap[p.userId] ?? '',
  }));

  return successResponse({ ...result, items });
});
