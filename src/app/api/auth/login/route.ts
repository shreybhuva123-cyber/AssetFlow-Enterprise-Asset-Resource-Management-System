import { type NextRequest } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { validateBody } from '@/lib/api/validate-body';
import { createAuditLog, getClientIp, getUserAgent } from '@/lib/api/audit';
import { loginSchema } from '@/validators/auth';
import { successResponse, unauthorizedResponse, internalErrorResponse } from '@/lib/utils/api-response';
import type { UserRole } from '@/types/auth';

export async function POST(req: NextRequest) {
  const { data, error } = await validateBody(req, loginSchema);
  if (error) return error;

  try {
    const supabase = await getSupabaseServer();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError || !authData.user) {
      return unauthorizedResponse('Invalid email or password');
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: authData.user.id },
    });

    if (profile) {
      await Promise.all([
        prisma.profile.update({
          where: { id: profile.id },
          data: { lastSeenAt: new Date() },
        }),
        createAuditLog({
          orgId: profile.orgId,
          actorId: profile.id,
          action: 'LOGIN',
          resource: 'USER',
          resourceId: profile.id,
          description: `Login: ${data.email}`,
          ipAddress: getClientIp(req),
          userAgent: getUserAgent(req),
        }),
      ]);
    }

    return successResponse({
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      profile: profile
        ? {
            id: profile.id,
            role: profile.role as UserRole,
            displayName: profile.displayName,
            orgId: profile.orgId,
          }
        : null,
    });
  } catch (err) {
    console.error('[login]', err);
    return internalErrorResponse('Login failed. Please try again.');
  }
}
