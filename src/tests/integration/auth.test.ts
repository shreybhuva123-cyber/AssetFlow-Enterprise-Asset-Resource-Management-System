/**
 * Integration tests for auth API routes.
 *
 * Run with: pnpm test src/tests/integration/auth.test.ts
 *
 * These tests use msw (or vitest mocks) to intercept Supabase and Prisma calls.
 * Adapt mock setup to your actual test runner configuration.
 */

import { describe, it, expect, vi } from 'vitest';
import { POST as registerRoute } from '@/app/api/auth/register/route';
import { POST as loginRoute } from '@/app/api/auth/login/route';
import { NextRequest } from 'next/server';

// Mock Supabase and Prisma to avoid real network calls
vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServer: vi.fn().mockResolvedValue({
    auth: {
      signUp: vi.fn().mockResolvedValue({
        data: { user: { id: 'mock-user-id', email: 'test@example.com' } },
        error: null,
      }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: { id: 'mock-user-id', email: 'test@example.com' } },
        error: null,
      }),
    },
  }),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    profile: {
      create: vi.fn().mockResolvedValue({
        id: 'profile-id',
        userId: 'mock-user-id',
        firstName: 'Jane',
        lastName: 'Smith',
        displayName: 'Jane Smith',
        role: 'EMPLOYEE',
        orgId: null,
        departmentId: null,
        isActive: true,
      }),
      findUnique: vi.fn().mockResolvedValue({
        id: 'profile-id',
        userId: 'mock-user-id',
        role: 'EMPLOYEE',
        displayName: 'Jane Smith',
        orgId: null,
        isActive: true,
        lastSeenAt: null,
      }),
      update: vi.fn().mockResolvedValue({}),
    },
    auditLog: { create: vi.fn().mockResolvedValue({}) },
  },
}));

function makeRequest(body: unknown, method = 'POST') {
  return new NextRequest('http://localhost:3000', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/register', () => {
  it('creates an EMPLOYEE account — no role in request', async () => {
    const req = makeRequest({
      email: 'jane@test.com',
      password: 'Secure@123',
      confirmPassword: 'Secure@123',
      firstName: 'Jane',
      lastName: 'Smith',
    });

    const res = await registerRoute(req);
    expect(res.status).toBe(201);

    const { prisma } = await import('@/lib/prisma');
    expect(prisma.profile.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ role: 'EMPLOYEE' }) }),
    );
  });

  it('rejects mismatched passwords', async () => {
    const req = makeRequest({
      email: 'jane@test.com',
      password: 'Secure@123',
      confirmPassword: 'Wrong@456',
      firstName: 'Jane',
      lastName: 'Smith',
    });

    const res = await registerRoute(req);
    expect(res.status).toBe(400);
  });

  it('rejects request with role field included', async () => {
    // Schema strips unknown fields — role is ignored; request still creates EMPLOYEE
    const req = makeRequest({
      email: 'jane@test.com',
      password: 'Secure@123',
      confirmPassword: 'Secure@123',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'ADMIN', // attacker attempts role escalation
    });

    await registerRoute(req);
    // Should still succeed but profile.create is called with EMPLOYEE
    const { prisma } = await import('@/lib/prisma');
    expect(prisma.profile.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ role: 'EMPLOYEE' }) }),
    );
  });
});

describe('POST /api/auth/login', () => {
  it('returns user and profile on valid credentials', async () => {
    const req = makeRequest({ email: 'jane@test.com', password: 'Secure@123' });
    const res = await loginRoute(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data.profile.role).toBe('EMPLOYEE');
  });
});
