import { z } from 'zod';

export const MaintenancePriority = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;
export const MaintenanceCategory = [
  'HARDWARE', 'SOFTWARE', 'ELECTRICAL', 'MECHANICAL', 'NETWORK', 
  'SAFETY', 'CLEANING', 'INSPECTION', 'UPGRADE', 'OTHER'
] as const;
export const MaintenanceStatus = [
  'PENDING', 'APPROVED', 'REJECTED', 'ASSIGNED', 'IN_PROGRESS', 
  'PAUSED', 'RESOLVED', 'CLOSED'
] as const;

export const createMaintenanceSchema = z.object({
  assetId: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(MaintenancePriority).default('MEDIUM'),
  category: z.enum(MaintenanceCategory).default('OTHER'),
  departmentId: z.string().uuid().optional(),
  technicianId: z.string().uuid().optional(),
  expectedCompletionDate: z.string().datetime({ offset: true }).optional(),
  estimatedCost: z.number().min(0).optional(),
  attachments: z.array(z.any()).optional(),
  notes: z.string().optional(),
});

export const updateMaintenanceSchema = z.object({
  title: z.string().max(255).optional(),
  description: z.string().optional(),
  priority: z.enum(MaintenancePriority).optional(),
  category: z.enum(MaintenanceCategory).optional(),
  status: z.enum(MaintenanceStatus).optional(),
  technicianId: z.string().uuid().optional(),
  expectedCompletionDate: z.string().datetime({ offset: true }).optional(),
  actualCompletionDate: z.string().datetime({ offset: true }).optional(),
  estimatedCost: z.number().min(0).optional(),
  actualCost: z.number().min(0).optional(),
  rejectionReason: z.string().optional(),
  resolutionNotes: z.string().optional(),
  partsUsed: z.array(z.any()).optional(),
  attachments: z.array(z.any()).optional(),
  notes: z.string().optional(),
});

export const approveMaintenanceSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  comments: z.string().max(1000).optional(),
}).refine(
  (d) => d.decision !== 'REJECTED' || (d.comments && d.comments.length > 0),
  { message: 'Comments required when rejecting', path: ['comments'] }
);

export const addCommentSchema = z.object({
  body: z.string().min(1, 'Comment body is required'),
  isInternal: z.boolean().default(false),
  attachments: z.array(z.any()).optional(),
});

export type MaintenancePriorityInput = typeof MaintenancePriority[number];
export type MaintenanceStatusInput = typeof MaintenanceStatus[number];
export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>;
export type ApproveMaintenanceInput = z.infer<typeof approveMaintenanceSchema>;
export type AddCommentInput = z.infer<typeof addCommentSchema>;
