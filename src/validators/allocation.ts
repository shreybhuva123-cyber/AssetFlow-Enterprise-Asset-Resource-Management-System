import { z } from 'zod';

export const AllocationPriority = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const;
export const AllocationApprovalStatus = ['PENDING', 'APPROVED', 'REJECTED'] as const;

export const createAllocationSchema = z.object({
  assetId:            z.string().uuid('Invalid asset ID'),
  employeeId:         z.string().uuid('Invalid employee ID'),
  departmentId:       z.string().uuid().optional(),
  allocationDate:     z.string().datetime({ offset: true }).or(z.string().date()),
  expectedReturnDate: z.string().date().optional(),
  purpose:            z.string().max(1000).optional(),
  notes:              z.string().max(2000).optional(),
  priority:           z.enum(AllocationPriority).default('NORMAL'),
  requiresApproval:   z.boolean().default(false),
});

export const updateAllocationSchema = z.object({
  expectedReturnDate: z.string().date().optional(),
  purpose:            z.string().max(1000).optional(),
  notes:              z.string().max(2000).optional(),
  priority:           z.enum(AllocationPriority).optional(),
});

export const returnAllocationSchema = z.object({
  condition:    z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED', 'LOST']),
  damageNotes:  z.string().max(2000).optional(),
  comments:     z.string().max(2000).optional(),
  photos:       z.array(z.string().url()).default([]),
}).refine(
  (d) => !['DAMAGED', 'LOST'].includes(d.condition) || (d.damageNotes && d.damageNotes.length > 0),
  { message: 'Damage notes are required for Damaged or Lost condition', path: ['damageNotes'] }
);

export const approveAllocationSchema = z.object({
  decision:      z.enum(['APPROVED', 'REJECTED']),
  approvalNotes: z.string().max(1000).optional(),
});

export type CreateAllocationInput  = z.infer<typeof createAllocationSchema>;
export type UpdateAllocationInput  = z.infer<typeof updateAllocationSchema>;
export type ReturnAllocationInput  = z.infer<typeof returnAllocationSchema>;
export type ApproveAllocationInput = z.infer<typeof approveAllocationSchema>;
