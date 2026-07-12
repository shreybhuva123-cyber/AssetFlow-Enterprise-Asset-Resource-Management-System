import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import type { UserProfile } from '@/types/auth';

export async function getServerSession(): Promise<{ userId: string; profile: UserProfile } | null> {
  try {
    const headerStore = await headers();
    const userId = headerStore.get('x-user-id');
    if (!userId) return null;

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) return null;

    return {
      userId,
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

// Alias — several API routes import `getSession` instead of `getServerSession`
export const getSession = getServerSession;
