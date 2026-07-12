'use client';

import { useEffect, useRef } from 'react';
import type { REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationsStore } from '@/store/notifications.store';
import { createLogger } from '@/lib/logger/index';

const logger = createLogger('RealtimeProvider');

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuthStore();
  const { addNotification } = useNotificationsStore();
  const supabase = getSupabaseClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!profile?.orgId) return;

    const orgId = profile.orgId;
    const channelName = `org:${orgId}`;

    channelRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as Parameters<typeof channelRef.current.on>[0],
        {
          event: '*',
          schema: 'public',
          table: 'maintenance_orders',
          filter: `org_id=eq.${orgId}`,
        },
        (payload: unknown) => {
          logger.info('Realtime: maintenance_orders change', { payload });
          addNotification({
            type: 'info',
            title: 'Maintenance Update',
            message: 'A maintenance order was updated',
          });
        },
      )
      .subscribe((status: `${REALTIME_SUBSCRIBE_STATES}`) => {
        logger.info(`Realtime channel ${channelName}: ${status}`);
      });

    return () => {
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [profile?.orgId]);

  return <>{children}</>;
}
