import type { AuditAction, AuditResource } from '@prisma/client';

export interface AuditLogEntry {
  id: string;
  orgId?: string | null;
  userId?: string | null;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
  createdAt: Date;

  user?: {
    id: string;
    firstName: string;
    lastName: string;
    displayName: string;
    avatarUrl?: string | null;
  } | null;
}

export interface AuditLogFilters {
  userId?: string;
  action?: AuditAction | AuditAction[];
  resource?: AuditResource | AuditResource[];
  resourceId?: string;
  from?: Date;
  to?: Date;
}
