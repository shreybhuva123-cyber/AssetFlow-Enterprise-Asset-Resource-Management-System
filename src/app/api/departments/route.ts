import { type NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { validateBody, validateQuery } from '@/lib/api/validate-body';
import { createDepartmentSchema, departmentFiltersSchema } from '@/validators/department';
import { getDepartmentsByOrg, createDepartment } from '@/lib/repositories/department.repository';
import { createAuditLog, getClientIp, getUserAgent } from '@/lib/api/audit';
import { successResponse, createdResponse, forbiddenResponse } from '@/lib/utils/api-response';
import { canManageDepartments } from '@/lib/auth/rbac';

export const GET = withAuth(async (req: NextRequest, ctx) => {
  const { data: filters, error } = validateQuery(req.nextUrl.searchParams, departmentFiltersSchema);
  if (error) return error;

  if (!ctx.profile.orgId) return successResponse({ items: [], total: 0, page: 1, limit: filters.limit, totalPages: 0 });

  const result = await getDepartmentsByOrg(ctx.profile.orgId, filters);
  return successResponse(result);
});

export const POST = withAuth(async (req: NextRequest, ctx) => {
  if (!canManageDepartments(ctx.profile)) {
    return forbiddenResponse('Only Admins and Asset Managers can create departments');
  }

  const { data, error } = await validateBody(req, createDepartmentSchema);
  if (error) return error;

  if (!ctx.profile.orgId) return forbiddenResponse('No organization associated with your account');

  const department = await createDepartment(ctx.profile.orgId, data);

  await createAuditLog({
    orgId: ctx.profile.orgId,
    actorId: ctx.profile.id,
    action: 'CREATE',
    resource: 'DEPARTMENT',
    resourceId: department.id,
    description: `Created department: ${department.name}`,
    newValues: data as Record<string, unknown>,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  });

  return createdResponse(department);
});
