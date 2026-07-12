import { z } from 'zod';

export const createTransferSchema = z.object({
  assetId:         z.string().uuid('Invalid asset ID'),
  toEmployeeId:    z.string().uuid('Invalid employee ID'),
  toDepartmentId:  z.string().uuid().optional(),
  reason:          z.string().min(1, 'Reason is required').max(1000),
  notes:           z.string().max(2000).optional(),
  scheduledDate:   z.string().date().optional(),
});

export const approveTransferSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  comments: z.string().max(1000).optional(),
}).refine(
  (d) => d.decision !== 'REJECTED' || (d.comments && d.comments.length > 0),
  { message: 'Comments required when rejecting', path: ['comments'] }
);

export const updateTransferSchema = z.object({
  reason:        z.string().max(1000).optional(),
  notes:         z.string().max(2000).optional(),
  scheduledDate: z.string().date().optional(),
});

export type CreateTransferInput  = z.infer<typeof createTransferSchema>;
export type ApproveTransferInput = z.infer<typeof approveTransferSchema>;
export type UpdateTransferInput  = z.infer<typeof updateTransferSchema>;
