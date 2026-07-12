import { type NextRequest } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { validateBody } from '@/lib/api/validate-body';
import { forgotPasswordSchema } from '@/validators/auth';
import { successResponse } from '@/lib/utils/api-response';

export async function POST(req: NextRequest) {
  const { data, error } = await validateBody(req, forgotPasswordSchema);
  if (error) return error;

  const supabase = await getSupabaseServer();

  // Always return success to prevent email enumeration
  await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });

  return successResponse({
    message: 'If an account with that email exists, a reset link has been sent.',
  });
}
