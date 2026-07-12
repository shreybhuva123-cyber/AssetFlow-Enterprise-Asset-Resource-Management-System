import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/departments/route';
import { NextRequest } from 'next/server';
import { UserRole } from '@/types/auth';

const mockAdminProfile = {
  id: 'actor-id',
  userId: 'user-id',
  orgId: 'org-id',
  role: UserRole.ADMIN,
  isActive: true,
  departmentId: null,
  firstName: 'Admin',
  lastName: 'User',
  displayName: 'Admin User',
  avatarUrl: null, phone: null, jobTitle: null,
  timezone: 'UTC', locale: 'en', preferences: {},
  lastSeenAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockEmployeeProfile = { ...mockAdminProfile, id: 'emp-id', role: UserRole.EMPLOYEE };

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServer: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    profile: {
      findUnique: vi.fn(),
    },
    department: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockResolvedValue({ id: 'dept-id', name: 'Engineering', orgId: 'org-id' }),
    },
    auditLog: { create: vi.fn().mockResolvedValue({}) },
  },
}));

function setupAuth(profile: typeof mockAdminProfile) {
  const { getSupabaseServer } = vi.mocked(await import('@/lib/supabase/server'));
  getSupabaseServer.mockResolvedValue({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: profile.userId } }, error: null }) },
  } as never);
  const { prisma } = vi.mocked(await import('@/lib/prisma'));
  prisma.profile.findUnique.mockResolvedValue(profile as never);
}

function makeRequest(method: string, body?: unknown, search = '') {
  return new NextRequest(`http://localhost:3000/api/departments${search}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

describe('GET /api/departments', () => {
  it('returns paginated departments for authenticated user', async () => {
    await setupAuth(mockAdminProfile);
    const res = await GET(makeRequest('GET', undefined, '?page=1'));
    expect(res.status).toBe(200);
  });
});

describe('POST /api/departments', () => {
  it('allows ADMIN to create department', async () => {
    await setupAuth(mockAdminProfile);
    const res = await POST(makeRequest('POST', { name: 'Engineering', isActive: true }));
    expect(res.status).toBe(201);
  });

  it('forbids EMPLOYEE from creating department', async () => {
    await setupAuth(mockEmployeeProfile);
    const res = await POST(makeRequest('POST', { name: 'Engineering', isActive: true }));
    expect(res.status).toBe(403);
  });

  it('validates required fields', async () => {
    await setupAuth(mockAdminProfile);
    const res = await POST(makeRequest('POST', { name: '' }));
    expect(res.status).toBe(400);
  });
});
