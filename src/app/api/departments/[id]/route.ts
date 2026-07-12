import { type NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { validateBody } from '@/lib/api/validate-body';
import { updateDepartmentSchema } from '@/validators/department';
import {
  getDepartmentById,
  updateDepartment,
  softDeleteDepartment,
} from '@/lib/repositories/department.repository';
import { createAuditLog, getClientIp, getUserAgent } from '@/lib/api/audit';
import { successResponse, notFoundResponse, forbiddenResponse, noContentResponse } from '@/lib/utils/api-response';
import { canManageDepartments } from '@/lib/auth/rbac';

type RouteParams = { params: Promise<{ id: string }> };

export const GET = withAuth(async (_req, ctx, { params }: RouteParams) => {
  const { id } = await params;
  if (!ctx.profile.orgId) return notFoundResponse('Department not found');

  const department = await getDepartmentById(id, ctx.profile.orgId);
  if (!department) return notFoundResponse('Department not found');

  return successResponse(department);
});

export const PATCH = withAuth(async (req: NextRequest, ctx, { params }: RouteParams) => {
  const { id } = await params;
  if (!canManageDepartments(ctx.profile)) return forbiddenResponse('Insufficient permissions');
  if (!ctx.profile.orgId) return forbiddenResponse('No organization');

  const existing = await getDepartmentById(id, ctx.profile.orgId);
  if (!existing) return notFoundResponse('Department not found');

  const { data, error } = await validateBody(req, updateDepartmentSchema);
  if (error) return error;

  const updated = await updateDepartment(id, ctx.profile.orgId, data);

  await createAuditLog({
    orgId: ctx.profile.orgId,
    actorId: ctx.profile.id,
    action: 'UPDATE',
    resource: 'DEPARTMENT',
    resourceId: id,
    description: `Updated department: ${existing.name}`,
    oldValues: existing as unknown as Record<string, unknown>,
    newValues: data as Record<string, unknown>,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  });

  return successResponse(updated);
});

export const DELETE = withAuth(async (req: NextRequest, ctx, { params }: RouteParams) => {
  const { id } = await params;
  if (!canManageDepartments(ctx.profile)) return forbiddenResponse('Insufficient permissions');
  if (!ctx.profile.orgId) return forbiddenResponse('No organization');

  const existing = await getDepartmentById(id, ctx.profile.orgId);
  if (!existing) return notFoundResponse('Department not found');

  await softDeleteDepartment(id, ctx.profile.orgId);

  await createAuditLog({
    orgId: ctx.profile.orgId,
    actorId: ctx.profile.id,
    action: 'DELETE',
    resource: 'DEPARTMENT',
    resourceId: id,
    description: `Deleted department: ${existing.name}`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  });

  return noContentResponse();
});
