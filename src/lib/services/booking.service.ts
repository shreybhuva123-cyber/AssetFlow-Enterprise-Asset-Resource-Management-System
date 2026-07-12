import { prisma } from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';
import { bookingRepository } from '@/lib/repositories/booking.repository';
import type { CreateBookingInput, UpdateBookingInput } from '@/validators/booking';

export const bookingService = {
  async createBooking(orgId: string, bookedById: string, input: CreateBookingInput) {
    const startTime = new Date(input.startTime);
    const endTime   = new Date(input.endTime);

    // Verify resource exists
    const resource = await prisma.bookingResource.findFirst({
      where: { id: input.resourceId, orgId, isActive: true, deletedAt: null },
      select: { id: true, name: true },
    });
    if (!resource) throw new Error('Booking resource not found or inactive');

    // Check for overlapping bookings
    const overlaps = await bookingRepository.findOverlapping(input.resourceId, startTime, endTime);
    if (overlaps.length > 0) {
      const conflict = overlaps[0];
      const cStart = new Date(conflict.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const cEnd   = new Date(conflict.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      throw Object.assign(
        new Error(`${resource.name} is already booked from ${cStart} to ${cEnd} by ${conflict.bookedBy.displayName}. Please choose a different time.`),
        { code: 'BOOKING_CONFLICT', conflict: { bookingId: conflict.id, title: conflict.title, startTime: conflict.startTime, endTime: conflict.endTime, bookedBy: conflict.bookedBy.displayName } }
      );
    }

    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          org:          { connect: { id: orgId } },
          resource:     { connect: { id: input.resourceId } },
          bookedBy:     { connect: { id: bookedById } },
          ...(input.departmentId && { department: { connect: { id: input.departmentId } } }),
          title:         input.title,
          purpose:       input.purpose,
          startTime,
          endTime,
          status:        BookingStatus.UPCOMING,
          priority:      input.priority,
          attendeeCount: input.attendeeCount,
          notes:         input.notes,
        },
      });

      // Create participants
      if (input.participantIds.length > 0) {
        await tx.bookingParticipant.createMany({
          data: [
            { bookingId: booking.id, profileId: bookedById, role: 'ORGANIZER' },
            ...input.participantIds
              .filter((id) => id !== bookedById)
              .map((profileId) => ({ bookingId: booking.id, profileId, role: 'ATTENDEE' })),
          ],
          skipDuplicates: true,
        });
      }

      // Create reminder notifications
      const reminders = [
        { minutesBefore: 24 * 60, type: 'REMINDER_24H' },
        { minutesBefore: 60,      type: 'REMINDER_1H' },
        { minutesBefore: 15,      type: 'REMINDER_15M' },
      ];
      const now = Date.now();
      await tx.bookingNotification.createMany({
        data: reminders
          .map((r) => ({ bookingId: booking.id, type: r.type, notifyAt: new Date(startTime.getTime() - r.minutesBefore * 60000) }))
          .filter((n) => n.notifyAt.getTime() > now),
        skipDuplicates: true,
      });

      return booking;
    });
  },

  async updateBooking(orgId: string, id: string, actorId: string, input: UpdateBookingInput) {
    const existing = await bookingRepository.findById(id, orgId);
    if (!existing) throw new Error('Booking not found');
    if (['CANCELLED', 'EXPIRED', 'COMPLETED'].includes(existing.status)) {
      throw new Error('Cannot update a booking in its current state');
    }

    const startTime = input.startTime ? new Date(input.startTime) : new Date(existing.startTime);
    const endTime   = input.endTime   ? new Date(input.endTime)   : new Date(existing.endTime);

    if (input.startTime || input.endTime) {
      const overlaps = await bookingRepository.findOverlapping(existing.resourceId, startTime, endTime, id);
      if (overlaps.length > 0) {
        const conflict = overlaps[0];
        throw Object.assign(
          new Error(`Time slot conflict with booking: "${conflict.title}" (${new Date(conflict.startTime).toLocaleTimeString()} – ${new Date(conflict.endTime).toLocaleTimeString()})`),
          { code: 'BOOKING_CONFLICT', conflict }
        );
      }
    }

    return bookingRepository.update(id, { ...input, startTime, endTime });
  },

  async cancelBooking(orgId: string, id: string, actorId: string, cancelReason: string) {
    const existing = await bookingRepository.findById(id, orgId);
    if (!existing) throw new Error('Booking not found');
    if (['CANCELLED', 'EXPIRED', 'COMPLETED'].includes(existing.status)) {
      throw new Error('Booking cannot be cancelled');
    }

    return bookingRepository.update(id, {
      status:       BookingStatus.CANCELLED,
      cancelReason,
      cancelledAt:  new Date(),
      cancelledBy:  { connect: { id: actorId } },
    });
  },

  async checkAvailability(resourceId: string, orgId: string, date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return bookingRepository.findCalendarEvents(orgId, start, end);
  },

  async getStats(orgId: string) {
    return bookingRepository.stats(orgId);
  },
};
