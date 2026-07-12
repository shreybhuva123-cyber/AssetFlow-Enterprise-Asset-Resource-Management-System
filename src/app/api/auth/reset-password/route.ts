import { type NextRequest } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { validateBody } from '@/lib/api/validate-body';
import { resetPasswordSchema } from '@/validators/auth';
import { successResponse, internalErrorResponse, badRequestResponse } from '@/lib/utils/api-response';

export async function POST(req: NextRequest) {
  const { data, error } = await validateBody(req, resetPasswordSchema);
  if (error) return error;

  const supabase = await getSupabaseServer();

  const { error: updateError } = await supabase.auth.updateUser({
    password: data.password,
  });

  if (updateError) {
    if (updateError.message.includes('same password')) {
      return badRequestResponse('New password must differ from the current one');
    }
    return internalErrorResponse('Password reset failed');
  }

  return successResponse({ message: 'Password updated successfully' });
}
