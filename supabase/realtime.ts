import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js';
import { createClient } from './client';
import { createLogger } from '@/lib/logger/index';

const logger = createLogger('SupabaseRealtime');

export type PostgresChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export interface TableSubscriptionOptions<T extends Record<string, unknown>> {
  channelName: string;
  table: string;
  schema?: string;
  event?: PostgresChangeEvent;
  filter?: string;
  onInsert?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onChange?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onError?: (error: Error) => void;
}

export function subscribeToTable<T extends Record<string, unknown>>(
  options: TableSubscriptionOptions<T>
): RealtimeChannel {
  const supabase = createClient();
  const {
    channelName,
    table,
    schema = 'public',
    event = '*',
    filter,
    onInsert,
    onUpdate,
    onDelete,
    onChange,
    onError,
  } = options;

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes' as 'system',
      { event, schema, table, ...(filter ? { filter } : {}) } as never,
      (payload: RealtimePostgresChangesPayload<T>) => {
        logger.debug(`Realtime ${payload.eventType} on ${table}`);
        onChange?.(payload);
        if (payload.eventType === 'INSERT') onInsert?.(payload);
        else if (payload.eventType === 'UPDATE') onUpdate?.(payload);
        else if (payload.eventType === 'DELETE') onDelete?.(payload);
      }
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        logger.info(`Realtime subscribed: ${channelName}`);
      } else if (status === 'CHANNEL_ERROR') {
        logger.error(`Realtime channel error: ${channelName}`, err);
        if (err) onError?.(err);
      } else if (status === 'TIMED_OUT') {
        logger.warn(`Realtime channel timed out: ${channelName}`);
      }
    });

  return channel;
}

export function unsubscribeChannel(channel: RealtimeChannel): void {
  const supabase = createClient();
  void supabase.removeChannel(channel);
}

export function unsubscribeAll(channels: RealtimeChannel[]): void {
  channels.forEach(unsubscribeChannel);
}

export function subscribeToOrgAssets(
  orgId: string,
  onChange: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
): RealtimeChannel {
  return subscribeToTable({
    channelName: `org:${orgId}:assets`,
    table: 'assets',
    filter: `org_id=eq.${orgId}`,
    onChange,
  });
}

export function subscribeToOrgMaintenance(
  orgId: string,
  onChange: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
): RealtimeChannel {
  return subscribeToTable({
    channelName: `org:${orgId}:maintenance`,
    table: 'maintenance_orders',
    filter: `org_id=eq.${orgId}`,
    onChange,
  });
}
