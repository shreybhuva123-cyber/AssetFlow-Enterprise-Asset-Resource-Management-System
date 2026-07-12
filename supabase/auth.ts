import type { AuthError, User } from '@supabase/supabase-js';
import { createServerSupabaseClient } from './server';
import { createLogger } from '@/lib/logger/index';
import { AuthenticationError } from '@/lib/errors/index';

const logger = createLogger('SupabaseAuth');

export interface ServerAuthResult {
  user: User | null;
  error: AuthError | null;
}

// Returns the authenticated user from the current request context.
// Validates the JWT — does NOT rely on client-provided session data.
export async function getServerSession(): Promise<ServerAuthResult> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { user, error };
  } catch (error) {
    logger.error('Failed to get server session', error);
    return { user: null, error: null };
  }
}

// Throws AuthenticationError if no valid session exists.
// Use in Server Components and Route Handlers that require authentication.
export async function requireServerAuth(): Promise<User> {
  const { user, error } = await getServerSession();

  if (error) {
    logger.warn('Auth error in requireServerAuth', { code: error.status });
    throw new AuthenticationError();
  }

  if (!user) {
    throw new AuthenticationError();
  }

  return user;
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  const supabase = await createServerSupabaseClient();
  return supabase.auth.signOut();
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.admin?.getUserById(userId) ??
      { data: { user: null } };
    return user;
  } catch (error) {
    logger.error('Failed to get user by ID', error, { userId });
    return null;
  }
}
