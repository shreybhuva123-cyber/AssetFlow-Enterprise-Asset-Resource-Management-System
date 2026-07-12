import { type NextRequest } from 'next/server';
import { withAdmin } from '@/lib/api/with-auth';
import { validateBody } from '@/lib/api/validate-body';
import { promoteEmployeeSchema } from '@/validators/employee';
import { getEmployeeById, updateEmployeeRole } from '@/lib/repositories/employee.repository';
import { createAuditLog, getClientIp, getUserAgent } from '@/lib/api/audit';
import { successResponse, notFoundResponse, badRequestResponse } from '@/lib/utils/api-response';
import { UserRole } from '@/types/auth';

type RouteParams = { params: Promise<{ id: string }> };

// Only ADMIN can change roles — withAdmin enforces this
export const PUT = withAdmin(async (req: NextRequest, ctx, { params }: RouteParams) => {
  const { id } = await params;
  if (!ctx.profile.orgId) return notFoundResponse('Employee not found');

  const existing = await getEmployeeById(id, ctx.profile.orgId);
  if (!existing) return notFoundResponse('Employee not found');

  // Cannot change own role
  if (existing.id === ctx.profile.id) {
    return badRequestResponse('You cannot change your own role');
  }

  const { data, error } = await validateBody(req, promoteEmployeeSchema);
  if (error) return error;

  // ADMIN role can only be assigned directly via DB — prevents privilege escalation
  if (data.role === UserRole.ADMIN) {
    return badRequestResponse('ADMIN role cannot be assigned through this endpoint');
  }

  const oldRole = existing.role;
  const updated = await updateEmployeeRole(id, data.role);

  await createAuditLog({
    orgId: ctx.profile.orgId,
    actorId: ctx.profile.id,
    targetId: id,
    action: 'ROLE_CHANGE',
    resource: 'USER',
    resourceId: id,
    description: `Role changed from ${oldRole} to ${data.role} for ${existing.displayName}`,
    oldValues: { role: oldRole },
    newValues: { role: data.role },
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  });

  return successResponse(updated);
});
