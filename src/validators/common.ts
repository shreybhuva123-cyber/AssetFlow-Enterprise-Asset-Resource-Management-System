import { z } from 'zod';
import { appConfig } from '@/config/app.config';

export const uuidSchema = z.string().uuid({ message: 'Invalid ID format' });

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address')
  .max(254, 'Email is too long')
  .toLowerCase();

export const slugSchema = z
  .string()
  .min(2, 'Slug must be at least 2 characters')
  .max(100, 'Slug must be at most 100 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens');

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{6,14}$/, 'Invalid phone number')
  .optional();

export const urlSchema = z.string().url('Invalid URL').max(512, 'URL is too long');

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(appConfig.pagination.maxPageSize).default(appConfig.pagination.defaultPageSize),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const querySchema = z.object({
  q: z.string().trim().max(200).optional(),
  search: z.string().trim().max(200).optional(),
});

export const dateRangeSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
}).refine((data) => data.from <= data.to, {
  message: 'Start date must be before or equal to end date',
  path: ['from'],
});

export const idParamSchema = z.object({
  id: uuidSchema,
});

export const orgIdSchema = z.object({
  orgId: uuidSchema,
});

export const listQuerySchema = paginationSchema.merge(querySchema).extend({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type QueryInput = z.infer<typeof querySchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
export type ListQueryInput = z.infer<typeof listQuerySchema>;
