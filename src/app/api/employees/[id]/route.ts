import { type NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { validateBody } from '@/lib/api/validate-body';
import { updateEmployeeSchema } from '@/validators/employee';
import { getEmployeeById, updateEmployee } from '@/lib/repositories/employee.repository';
import { createAuditLog, getClientIp, getUserAgent } from '@/lib/api/audit';
import { successResponse, notFoundResponse, forbiddenResponse } from '@/lib/utils/api-response';
import { isAdmin, isAtLeastRole } from '@/lib/auth/rbac';
import { UserRole } from '@/types/auth';

type RouteParams = { params: Promise<{ id: string }> };

export const GET = withAuth(async (_req, ctx, { params }: RouteParams) => {
  const { id } = await params;
  if (!isAtLeastRole(ctx.profile, UserRole.ASSET_MANAGER) && ctx.profile.id !== id) {
    return forbiddenResponse('Insufficient permissions');
  }
  if (!ctx.profile.orgId) return notFoundResponse('Employee not found');

  const employee = await getEmployeeById(id, ctx.profile.orgId);
  if (!employee) return notFoundResponse('Employee not found');

  return successResponse(employee);
});

export const PATCH = withAuth(async (req: NextRequest, ctx, { params }: RouteParams) => {
  const { id } = await params;

  const isSelf = ctx.profile.id === id;
  const canEdit = isAdmin(ctx.profile) || isSelf;

  if (!canEdit) return forbiddenResponse('Insufficient permissions');
  if (!ctx.profile.orgId) return forbiddenResponse('No organization');

  const existing = await getEmployeeById(id, ctx.profile.orgId);
  if (!existing) return notFoundResponse('Employee not found');

  const { data, error } = await validateBody(req, updateEmployeeSchema);
  if (error) return error;

  const displayName =
    data.firstName || data.lastName
      ? `${data.firstName ?? existing.firstName} ${data.lastName ?? existing.lastName}`
      : undefined;

  const updated = await updateEmployee(id, { ...data, ...(displayName && { displayName }) });

  await createAuditLog({
    orgId: ctx.profile.orgId,
    actorId: ctx.profile.id,
    targetId: id,
    action: 'UPDATE',
    resource: 'USER',
    resourceId: id,
    description: `Updated employee profile: ${existing.displayName}`,
    oldValues: existing as unknown as Record<string, unknown>,
    newValues: data as Record<string, unknown>,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  });

  return successResponse(updated);
});
