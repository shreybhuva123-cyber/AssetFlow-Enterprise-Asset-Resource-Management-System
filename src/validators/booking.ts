import { z } from 'zod';

export const BookingPriority = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const;

export const createBookingSchema = z.object({
  resourceId:    z.string().uuid(),
  title:         z.string().min(1).max(255),
  purpose:       z.string().max(1000).optional(),
  startTime:     z.string().datetime({ offset: true }),
  endTime:       z.string().datetime({ offset: true }),
  departmentId:  z.string().uuid().optional(),
  priority:      z.enum(BookingPriority).default('NORMAL'),
  attendeeCount: z.number().int().min(1).max(500).optional(),
  notes:         z.string().max(2000).optional(),
  participantIds: z.array(z.string().uuid()).default([]),
}).refine(
  (d) => new Date(d.endTime) > new Date(d.startTime),
  { message: 'End time must be after start time', path: ['endTime'] }
).refine(
  (d) => new Date(d.startTime) >= new Date(),
  { message: 'Booking must be in the future', path: ['startTime'] }
);

export const updateBookingSchema = z.object({
  title:         z.string().min(1).max(255).optional(),
  purpose:       z.string().max(1000).optional(),
  startTime:     z.string().datetime({ offset: true }).optional(),
  endTime:       z.string().datetime({ offset: true }).optional(),
  priority:      z.enum(BookingPriority).optional(),
  attendeeCount: z.number().int().min(1).max(500).optional(),
  notes:         z.string().max(2000).optional(),
});

export const cancelBookingSchema = z.object({
  cancelReason: z.string().min(1).max(500),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
