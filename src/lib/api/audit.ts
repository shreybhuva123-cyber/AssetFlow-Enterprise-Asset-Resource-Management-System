import { prisma } from '@/lib/prisma';
import type { AuditAction, AuditResource } from '@prisma/client';

interface CreateAuditLogInput {
  orgId?: string | null;
  actorId?: string | null;
  targetId?: string | null;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string | null;
  description?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(input: CreateAuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        orgId: input.orgId,
        actorId: input.actorId,
        targetId: input.targetId,
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId,
        description: input.description,
        oldValues: input.oldValues,
        newValues: input.newValues,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  } catch {
    // Audit log failure is non-fatal
  }
}

export function getClientIp(req: Request): string {
  const xff = req instanceof Request ? req.headers.get('x-forwarded-for') : null;
  return xff?.split(',')[0]?.trim() ?? 'unknown';
}

export function getUserAgent(req: Request): string {
  return req instanceof Request ? (req.headers.get('user-agent') ?? 'unknown') : 'unknown';
}
