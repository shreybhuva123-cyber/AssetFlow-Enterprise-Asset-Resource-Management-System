import { z } from 'zod';
import { uuidSchema } from './common';

export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150, 'Name must be 150 characters or less'),
  code: z.string().max(20, 'Code must be 20 characters or less').optional(),
  description: z.string().max(1000).optional(),
  parentId: uuidSchema.optional(),
  headId: uuidSchema.optional(),
  isActive: z.boolean().default(true),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  code: z.string().max(20).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  parentId: uuidSchema.nullable().optional(),
  headId: uuidSchema.nullable().optional(),
  isActive: z.boolean().optional(),
});

export const departmentFiltersSchema = z.object({
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  parentId: z.union([uuidSchema, z.literal('null')]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type DepartmentFiltersInput = z.infer<typeof departmentFiltersSchema>;
