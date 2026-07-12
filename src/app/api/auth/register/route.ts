import { type NextRequest } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { validateBody } from '@/lib/api/validate-body';
import { createAuditLog, getClientIp, getUserAgent } from '@/lib/api/audit';
import { registerSchema } from '@/validators/auth';
import { createdResponse, internalErrorResponse, badRequestResponse } from '@/lib/utils/api-response';
import { generateSlug } from '@/lib/utils/id';

// POST /api/auth/register — always creates EMPLOYEE
export async function POST(req: NextRequest) {
  const { data, error } = await validateBody(req, registerSchema);
  if (error) return error;

  const supabase = await getSupabaseServer();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (signUpError) {
    if (signUpError.message.toLowerCase().includes('already registered')) {
      return badRequestResponse('An account with this email already exists');
    }
    return internalErrorResponse('Registration failed');
  }

  if (!signUpData.user) {
    return internalErrorResponse('Registration failed');
  }

  const displayName = `${data.firstName} ${data.lastName}`;

  const profile = await prisma.profile.create({
    data: {
      userId: signUpData.user.id,
      firstName: data.firstName,
      lastName: data.lastName,
      displayName,
      role: 'EMPLOYEE',
    },
  });

  await createAuditLog({
    actorId: profile.id,
    action: 'CREATE',
    resource: 'USER',
    resourceId: profile.id,
    description: `Employee account created: ${displayName}`,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  });

  return createdResponse({
    message: 'Account created. Please check your email to verify your address.',
    userId: signUpData.user.id,
  });
}
