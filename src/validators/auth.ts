import { z } from 'zod';
import { emailSchema } from './common';
import { authConfig } from '@/config/auth.config';

const passwordSchema = z
  .string()
  .min(authConfig.password.minLength, `Password must be at least ${authConfig.password.minLength} characters`)
  .max(authConfig.password.maxLength, `Password must be at most ${authConfig.password.maxLength} characters`)
  .refine(
    (p) => !authConfig.password.requireUppercase || /[A-Z]/.test(p),
    'Password must contain at least one uppercase letter',
  )
  .refine(
    (p) => !authConfig.password.requireLowercase || /[a-z]/.test(p),
    'Password must contain at least one lowercase letter',
  )
  .refine(
    (p) => !authConfig.password.requireNumber || /\d/.test(p),
    'Password must contain at least one number',
  )
  .refine(
    (p) => !authConfig.password.requireSpecialChar || /[^A-Za-z0-9]/.test(p),
    'Password must contain at least one special character',
  );

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  token: z.string().min(1, 'Reset token is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100).optional(),
  lastName: z.string().trim().min(1, 'Last name is required').max(100).optional(),
  displayName: z.string().trim().max(200).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, 'Invalid phone number').optional().or(z.literal('')),
  timezone: z.string().max(50).optional(),
  locale: z.string().max(10).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
