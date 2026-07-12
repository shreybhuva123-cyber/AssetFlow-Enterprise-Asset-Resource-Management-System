import { getSupabaseServer } from '@/lib/supabase/server';
import { successResponse, internalErrorResponse } from '@/lib/utils/api-response';

export async function POST() {
  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.signOut();

  if (error) return internalErrorResponse('Logout failed');

  return successResponse({ message: 'Logged out successfully' });
}
