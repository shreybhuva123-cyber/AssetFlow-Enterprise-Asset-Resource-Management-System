import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from '@/validators/auth';
import { createDepartmentSchema } from '@/validators/department';
import { createAssetCategorySchema } from '@/validators/asset-category';
import { promoteEmployeeSchema } from '@/validators/employee';
import { UserRole } from '@/types/auth';

describe('Auth validators', () => {
  describe('registerSchema', () => {
    it('accepts valid registration data without role field', () => {
      const result = registerSchema.safeParse({
        email: 'user@test.com',
        password: 'Secure@123',
        confirmPassword: 'Secure@123',
        firstName: 'Jane',
        lastName: 'Smith',
      });
      expect(result.success).toBe(true);
    });

    it('rejects when passwords do not match', () => {
      const result = registerSchema.safeParse({
        email: 'user@test.com',
        password: 'Secure@123',
        confirmPassword: 'Different@456',
        firstName: 'Jane',
        lastName: 'Smith',
      });
      expect(result.success).toBe(false);
      expect(result.error?.flatten().fieldErrors.confirmPassword).toBeDefined();
    });

    it('rejects weak password', () => {
      const result = registerSchema.safeParse({
        email: 'user@test.com',
        password: 'weak',
        confirmPassword: 'weak',
        firstName: 'Jane',
        lastName: 'Smith',
      });
      expect(result.success).toBe(false);
    });

    it('has no role field (signup always creates EMPLOYEE)', () => {
      const shape = registerSchema.shape;
      expect((shape as Record<string, unknown>).role).toBeUndefined();
    });
  });

  describe('loginSchema', () => {
    it('rejects invalid email', () => {
      const result = loginSchema.safeParse({ email: 'notanemail', password: 'pass' });
      expect(result.success).toBe(false);
    });
  });
});

describe('Department validators', () => {
  it('requires name', () => {
    const result = createDepartmentSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects code longer than 20 chars', () => {
    const result = createDepartmentSchema.safeParse({ name: 'Dept', code: 'A'.repeat(21) });
    expect(result.success).toBe(false);
  });

  it('accepts valid department', () => {
    const result = createDepartmentSchema.safeParse({ name: 'Engineering', code: 'ENG' });
    expect(result.success).toBe(true);
  });
});

describe('AssetCategory validators', () => {
  it('requires name', () => {
    const result = createAssetCategorySchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid hex color', () => {
    const result = createAssetCategorySchema.safeParse({ name: 'Laptop', color: 'notacolor' });
    expect(result.success).toBe(false);
  });

  it('accepts valid category', () => {
    const result = createAssetCategorySchema.safeParse({ name: 'Laptop', color: '#6366f1' });
    expect(result.success).toBe(true);
  });
});

describe('Employee promote validator', () => {
  it('accepts valid roles', () => {
    for (const role of Object.values(UserRole)) {
      const result = promoteEmployeeSchema.safeParse({ role });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid role', () => {
    const result = promoteEmployeeSchema.safeParse({ role: 'SUPER_GOD' });
    expect(result.success).toBe(false);
  });
});
