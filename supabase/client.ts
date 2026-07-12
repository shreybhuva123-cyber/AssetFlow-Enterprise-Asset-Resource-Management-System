import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config';
import type { Database } from './types';

let browserClientInstance: SupabaseClient<Database> | null = null;

// Returns a singleton browser Supabase client.
// Used in: Client Components, client-side hooks.
// Do NOT use for server-side data fetching — use createServerSupabaseClient instead.
export function createClient(): SupabaseClient<Database> {
  if (browserClientInstance) return browserClientInstance;

  browserClientInstance = createBrowserClient<Database>(
    supabaseConfig.url,
    supabaseConfig.anonKey
  );

  return browserClientInstance;
}
