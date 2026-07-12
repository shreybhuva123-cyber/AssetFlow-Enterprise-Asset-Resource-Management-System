import { createLogger } from './index';
import type { ID } from '@/types/api';

const logger = createLogger('AuditLogger');

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  RESTORE = 'RESTORE',
  VIEW = 'VIEW',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  ROLE_CHANGE = 'ROLE_CHANGE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  ASSIGN = 'ASSIGN',
  UNASSIGN = 'UNASSIGN',
}

export enum AuditResource {
  USER = 'USER',
  ORGANIZATION = 'ORGANIZATION',
  ASSET = 'ASSET',
  MAINTENANCE_ORDER = 'MAINTENANCE_ORDER',
  PROCUREMENT_REQUEST = 'PROCUREMENT_REQUEST',
  DEPRECIATION_ENTRY = 'DEPRECIATION_ENTRY',
  LOCATION = 'LOCATION',
  DOCUMENT = 'DOCUMENT',
  REPORT = 'REPORT',
  SETTINGS = 'SETTINGS',
}

export interface AuditEvent {
  action: AuditAction;
  resource: AuditResource;
  resourceId?: ID;
  userId: ID;
  orgId?: ID;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: Date;
}

const pendingEvents: AuditEvent[] = [];
let flushTimeoutId: ReturnType<typeof setTimeout> | null = null;
const FLUSH_DELAY_MS = 1000;
const MAX_PENDING = 50;

async function sendBatch(events: AuditEvent[]): Promise<void> {
  if (events.length === 0) return;
  try {
    await fetch('/api/audit/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
      keepalive: true,
    });
  } catch (error) {
    logger.error('Failed to send audit batch', error, { count: events.length });
  }
}

function scheduleFlush(): void {
  if (flushTimeoutId !== null) return;
  flushTimeoutId = setTimeout(() => {
    flushTimeoutId = null;
    const toSend = pendingEvents.splice(0, pendingEvents.length);
    void sendBatch(toSend);
  }, FLUSH_DELAY_MS);
}

export function logAuditEvent(event: AuditEvent): void {
  const enriched: AuditEvent = { ...event, timestamp: event.timestamp ?? new Date() };

  if (typeof window === 'undefined') {
    // Server-side: emit to logger for structured log pipelines
    logger.info(`AUDIT ${event.action} ${event.resource}`, enriched);
    return;
  }

  // Client-side: batch and send asynchronously
  pendingEvents.push(enriched);

  // Immediate flush if batch is getting large
  if (pendingEvents.length >= MAX_PENDING) {
    if (flushTimeoutId !== null) {
      clearTimeout(flushTimeoutId);
      flushTimeoutId = null;
    }
    const toSend = pendingEvents.splice(0, pendingEvents.length);
    void sendBatch(toSend);
    return;
  }

  scheduleFlush();
}

// Server-side: synchronously returns enriched event for immediate DB write
export function buildAuditEvent(event: AuditEvent): AuditEvent {
  return { ...event, timestamp: event.timestamp ?? new Date() };
}
