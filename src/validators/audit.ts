import { z } from 'zod';

export const AuditCycleStatus = ['DRAFT', 'ACTIVE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
export const AssetVerificationStatus = ['PENDING', 'VERIFIED', 'MISSING', 'DAMAGED', 'UNKNOWN'] as const;
export const DiscrepancyType = [
  'MISSING_ASSET', 'UNEXPECTED_ASSET', 'WRONG_LOCATION', 
  'WRONG_DEPARTMENT', 'DAMAGED_CONDITION', 'DUPLICATE_RECORD', 'LATE_VERIFICATION'
] as const;

export const createAuditCycleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  locationId: z.string().optional(),
  startDate: z.string().datetime({ offset: true }),
  endDate: z.string().datetime({ offset: true }),
  notes: z.string().optional(),
  auditorIds: z.array(z.string().uuid()).min(1, 'At least one auditor is required'),
}).refine(
  (d) => new Date(d.endDate) >= new Date(d.startDate),
  { message: 'End date must be on or after start date', path: ['endDate'] }
);

export const updateAuditCycleSchema = z.object({
  name: z.string().max(255).optional(),
  description: z.string().optional(),
  status: z.enum(AuditCycleStatus).optional(),
  departmentId: z.string().uuid().optional(),
  locationId: z.string().optional(),
  startDate: z.string().datetime({ offset: true }).optional(),
  endDate: z.string().datetime({ offset: true }).optional(),
  notes: z.string().optional(),
  auditorIds: z.array(z.string().uuid()).optional(),
});

export const verifyAssetSchema = z.object({
  status: z.enum(AssetVerificationStatus),
  notes: z.string().optional(),
  location: z.string().optional(),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED', 'LOST', 'DISPOSED']).optional(),
});

export const reportDiscrepancySchema = z.object({
  assetId: z.string().uuid().optional(),
  type: z.enum(DiscrepancyType),
  description: z.string().min(1, 'Description is required'),
  severity: z.enum(['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
});

export const resolveDiscrepancySchema = z.object({
  resolutionNotes: z.string().min(1, 'Resolution notes are required'),
});

export type CreateAuditCycleInput = z.infer<typeof createAuditCycleSchema>;
export type UpdateAuditCycleInput = z.infer<typeof updateAuditCycleSchema>;
export type VerifyAssetInput = z.infer<typeof verifyAssetSchema>;
export type ReportDiscrepancyInput = z.infer<typeof reportDiscrepancySchema>;
export type ResolveDiscrepancyInput = z.infer<typeof resolveDiscrepancySchema>;
