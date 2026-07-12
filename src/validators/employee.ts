import { z } from 'zod';
import { uuidSchema } from './common';
import { UserRole } from '@/types/auth';

export const updateEmployeeSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(50).nullable().optional(),
  jobTitle: z.string().max(150).nullable().optional(),
  departmentId: uuidSchema.nullable().optional(),
  avatarUrl: z.string().url().max(512).nullable().optional(),
  isActive: z.boolean().optional(),
});

// Only Admin can change roles; never to ADMIN from this endpoint
export const promoteEmployeeSchema = z.object({
  role: z.nativeEnum(UserRole),
});

export const employeeFiltersSchema = z.object({
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  departmentId: uuidSchema.optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type PromoteEmployeeInput = z.infer<typeof promoteEmployeeSchema>;
export type EmployeeFiltersInput = z.infer<typeof employeeFiltersSchema>;
