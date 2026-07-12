'use client';

import { useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { createClient } from '@/supabase/client';
import { useAuthStore } from '@/store/auth.store';
import type { User, UserProfile } from '@/types/auth';
import { createLogger } from '@/lib/logger/index';

const logger = createLogger('AuthProvider');

function mapSupabaseUser(session: Session): User {
  const su = session.user;
  return {
    id: su.id,
    email: su.email ?? '',
    emailVerified: !!su.email_confirmed_at,
    createdAt: new Date(su.created_at),
    updatedAt: new Date(su.updated_at ?? su.created_at),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth, setLoading, setHydrated } = useAuthStore();
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session) {
          const user = mapSupabaseUser(session);
          const profileRes = await fetch('/api/profile/me');
          const profile: UserProfile | null = profileRes.ok ? (await profileRes.json()).data : null;
          if (mounted && profile) setAuth(user, profile);
          else if (mounted) { setLoading(false); }
        } else {
          if (mounted) clearAuth();
        }
      } catch (error) {
        logger.error('Failed to load session', { error });
        if (mounted) clearAuth();
      } finally {
        if (mounted) setHydrated(true);
      }
    }

    void loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      logger.info(`Auth state changed: ${event}`);

      if (session) {
        const user = mapSupabaseUser(session);
        try {
          const profileRes = await fetch('/api/profile/me');
          const profile: UserProfile | null = profileRes.ok ? (await profileRes.json()).data : null;
          if (mounted && profile) setAuth(user, profile);
        } catch {
          if (mounted) setLoading(false);
        }
      } else {
        if (mounted) clearAuth();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
