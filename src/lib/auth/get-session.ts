import { getSupabaseServer } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import type { UserProfile } from '@/types/auth';

export async function getServerSession(): Promise<{ userId: string; profile: UserProfile } | null> {
  try {
    const supabase = await getSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) return null;

    return {
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
        role: profile.role as UserProfile['role'],
        isActive: profile.isActive,
        preferences: profile.preferences as Record<string, unknown>,
        lastSeenAt: profile.lastSeenAt?.toISOString() ?? null,
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString(),
      },
    };
  } catch {
    return null;
  }
}
