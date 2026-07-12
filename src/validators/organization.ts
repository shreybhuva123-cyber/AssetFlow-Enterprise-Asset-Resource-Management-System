import { z } from 'zod';
import { slugSchema, emailSchema } from './common';
import { UserRole } from '@/types/auth';

export const createOrgSchema = z.object({
  name: z.string().trim().min(2, 'Organization name must be at least 2 characters').max(255),
  slug: slugSchema,
  settings: z.object({
    currency: z.string().length(3, 'Currency must be a 3-letter ISO code').default('USD'),
    timezone: z.string().max(50).default('UTC'),
    fiscalYearStart: z.number().int().min(1).max(12).default(1),
    dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).default('MM/DD/YYYY'),
  }).optional().default({}),
});

export const updateOrgSchema = z.object({
  name: z.string().trim().min(2).max(255).optional(),
  logoUrl: z.string().url().max(512).optional().nullable(),
  settings: z.object({
    currency: z.string().length(3).optional(),
    timezone: z.string().max(50).optional(),
    fiscalYearStart: z.number().int().min(1).max(12).optional(),
    dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).optional(),
  }).optional(),
});

export const inviteMemberSchema = z.object({
  email: emailSchema,
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Invalid role' }),
  }).refine(
    (role) => role !== UserRole.SUPER_ADMIN,
    { message: 'Cannot invite users with Super Admin role' },
  ),
  message: z.string().max(500).optional(),
});

export const updateMemberRoleSchema = z.object({
  role: z.nativeEnum(UserRole).refine(
    (role) => role !== UserRole.SUPER_ADMIN,
    { message: 'Cannot assign Super Admin role' },
  ),
});

export type CreateOrgInput = z.infer<typeof createOrgSchema>;
export type UpdateOrgInput = z.infer<typeof updateOrgSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
