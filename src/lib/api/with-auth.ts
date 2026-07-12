import { type NextRequest } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { unauthorizedResponse, forbiddenResponse } from '@/lib/utils/api-response';
import { UserRole } from '@/types/auth';
import type { UserProfile } from '@/types/auth';

export interface AuthContext {
  userId: string;
  profile: UserProfile;
}

// Supports both plain handlers (list routes) and route-param handlers (detail routes)
type Handler<TRouteCtx = unknown> = (
  req: NextRequest,
  ctx: AuthContext,
  routeCtx: TRouteCtx,
) => Promise<Response>;

export function withAuth<TRouteCtx = unknown>(
  handler: Handler<TRouteCtx>,
): (req: NextRequest, routeCtx: TRouteCtx) => Promise<Response> {
  return async (req: NextRequest, routeCtx: TRouteCtx) => {
    const supabase = await getSupabaseServer();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return unauthorizedResponse('Authentication required');
    }

    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (!profile || !profile.isActive) {
      return unauthorizedResponse('Account not found or inactive');
    }

    const ctx: AuthContext = {
      userId: user.id,
      profile: {
        id: profile.id,
        userId: profile.userId,
        orgId: profile.orgId,
        departmentId: profile.departmentId,
        firstName: profile.firstName,
        lastName: profile.lastName,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        phone: profile.phone,
        jobTitle: profile.jobTitle,
        timezone: profile.timezone,
        locale: profile.locale,
        role: profile.role as UserRole,
        isActive: profile.isActive,
        preferences: profile.preferences as Record<string, unknown>,
        lastSeenAt: profile.lastSeenAt?.toISOString() ?? null,
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString(),
      },
    };

    return handler(req, ctx, routeCtx);
  };
}

export function withRole<TRouteCtx = unknown>(
  roles: UserRole[],
  handler: Handler<TRouteCtx>,
): (req: NextRequest, routeCtx: TRouteCtx) => Promise<Response> {
  return withAuth<TRouteCtx>(async (req, ctx, routeCtx) => {
    if (!roles.includes(ctx.profile.role)) {
      return forbiddenResponse('Insufficient permissions');
    }
    return handler(req, ctx, routeCtx);
  });
}

export function withAdmin<TRouteCtx = unknown>(
  handler: Handler<TRouteCtx>,
): (req: NextRequest, routeCtx: TRouteCtx) => Promise<Response> {
  return withRole<TRouteCtx>([UserRole.ADMIN], handler);
}
