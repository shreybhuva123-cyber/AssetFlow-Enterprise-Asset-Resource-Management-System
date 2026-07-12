import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config';
import type { Database } from './types';
import type { SupabaseClient } from '@supabase/supabase-js';

// Used in Server Components, Route Handlers, and Server Actions.
// Reads/writes auth cookies using the Next.js cookies() API.
export async function createServerSupabaseClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component — cookies are read-only here.
          // The middleware handles session refresh and cookie setting.
        }
      },
    },
  });
}

// Service role client — bypasses RLS. Use ONLY in:
// - Server-side seed scripts
// - Webhook handlers that need elevated access
// - Background jobs
// NEVER expose this to the client or API routes accessible by users.
export function createServiceRoleClient(): SupabaseClient<Database> {
  if (!supabaseConfig.serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }
  return createSupabaseClient<Database>(
    supabaseConfig.url,
    supabaseConfig.serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
