import { describe, it, expect, vi } from 'vitest';
import { PUT } from '@/app/api/employees/[id]/role/route';
import { NextRequest } from 'next/server';
import { UserRole } from '@/types/auth';

const makeProfile = (role: UserRole, id = 'actor-id') => ({
  id,
  userId: 'user-' + id,
  orgId: 'org-id',
  role,
  isActive: true,
  departmentId: null,
  firstName: 'Test',
  lastName: 'User',
  displayName: 'Test User',
  avatarUrl: null, phone: null, jobTitle: null,
  timezone: 'UTC', locale: 'en', preferences: {},
  lastSeenAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

vi.mock('@/lib/supabase/server', () => ({ getSupabaseServer: vi.fn() }));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    profile: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn().mockResolvedValue({}),
    },
    auditLog: { create: vi.fn().mockResolvedValue({}) },
  },
}));

async function setupAuth(actorProfile: ReturnType<typeof makeProfile>, targetProfile: ReturnType<typeof makeProfile>) {
  const { getSupabaseServer } = vi.mocked(await import('@/lib/supabase/server'));
  const { prisma } = vi.mocked(await import('@/lib/prisma'));

  getSupabaseServer.mockResolvedValue({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: actorProfile.userId } }, error: null }) },
  } as never);

  prisma.profile.findUnique.mockResolvedValue(actorProfile as never);
  prisma.profile.findFirst.mockResolvedValue(targetProfile as never);
}

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/employees/target-id/role', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const routeParams = { params: Promise.resolve({ id: 'target-id' }) };

describe('PUT /api/employees/[id]/role — Role Promotion', () => {
  it('ADMIN can promote EMPLOYEE to ASSET_MANAGER', async () => {
    await setupAuth(makeProfile(UserRole.ADMIN), makeProfile(UserRole.EMPLOYEE, 'target-id'));
    const res = await PUT(makeRequest({ role: UserRole.ASSET_MANAGER }), routeParams);
    expect(res.status).toBe(200);
  });

  it('ADMIN cannot assign ADMIN role (privilege escalation guard)', async () => {
    await setupAuth(makeProfile(UserRole.ADMIN), makeProfile(UserRole.EMPLOYEE, 'target-id'));
    const res = await PUT(makeRequest({ role: UserRole.ADMIN }), routeParams);
    expect(res.status).toBe(400);
  });

  it('non-ADMIN cannot change roles', async () => {
    await setupAuth(makeProfile(UserRole.ASSET_MANAGER), makeProfile(UserRole.EMPLOYEE, 'target-id'));
    const res = await PUT(makeRequest({ role: UserRole.DEPARTMENT_HEAD }), routeParams);
    expect(res.status).toBe(403);
  });

  it('DEPARTMENT_HEAD cannot change roles', async () => {
    await setupAuth(makeProfile(UserRole.DEPARTMENT_HEAD), makeProfile(UserRole.EMPLOYEE, 'target-id'));
    const res = await PUT(makeRequest({ role: UserRole.DEPARTMENT_HEAD }), routeParams);
    expect(res.status).toBe(403);
  });

  it('EMPLOYEE cannot change roles', async () => {
    await setupAuth(makeProfile(UserRole.EMPLOYEE), makeProfile(UserRole.EMPLOYEE, 'target-id'));
    const res = await PUT(makeRequest({ role: UserRole.DEPARTMENT_HEAD }), routeParams);
    expect(res.status).toBe(403);
  });

  it('ADMIN cannot change their own role', async () => {
    const admin = makeProfile(UserRole.ADMIN, 'actor-id');
    const { prisma } = vi.mocked(await import('@/lib/prisma'));
    prisma.profile.findFirst.mockResolvedValue({ ...admin, id: 'actor-id' } as never);
    await setupAuth(admin, admin);
    const selfParams = { params: Promise.resolve({ id: 'actor-id' }) };
    const res = await PUT(makeRequest({ role: UserRole.EMPLOYEE }), selfParams);
    expect(res.status).toBe(400);
  });
});
