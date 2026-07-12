import { prisma } from '@/lib/prisma';

export const notificationService = {
  async create(userId: string, orgId: string | null, type: string, title: string, body?: string, href?: string, metadata?: Record<string, unknown>) {
    return prisma.notification.create({
      data: { userId, orgId, type, title, body, href, metadata: (metadata ?? {}) as never, isRead: false },
    });
  },

  async markRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  },

  async markAllRead(userId: string, orgId: string) {
    return prisma.notification.updateMany({
      where: { userId, orgId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  },

  async getForUser(userId: string, orgId: string, isRead?: boolean) {
    return prisma.notification.findMany({
      where: { userId, orgId, ...(isRead !== undefined && { isRead }) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  },

  async createAllocationNotification(
    allocation: { id: string; assetId: string; employeeId: string; orgId: string; asset?: { assetTag: string; name: string } | null },
    type: 'ALLOCATED' | 'RETURNED' | 'OVERDUE' | 'APPROVAL_PENDING'
  ) {
    const messages = {
      ALLOCATED:        { title: 'Asset Allocated to You', body: `Asset ${allocation.asset?.assetTag ?? ''} (${allocation.asset?.name ?? ''}) has been allocated to you.` },
      RETURNED:         { title: 'Asset Return Recorded', body: `Your allocation for ${allocation.asset?.name ?? ''} has been marked as returned.` },
      OVERDUE:          { title: 'Asset Return Overdue', body: `Your allocation for ${allocation.asset?.name ?? ''} is overdue. Please return it immediately.` },
      APPROVAL_PENDING: { title: 'Allocation Pending Approval', body: `Asset allocation request is awaiting your approval.` },
    };
    const msg = messages[type];
    return this.create(allocation.employeeId, allocation.orgId, `ALLOCATION_${type}`, msg.title, msg.body, `/allocations/${allocation.id}`);
  },

  async createTransferNotification(
    transfer: { id: string; orgId: string; toEmployeeId: string; requestedById: string; asset?: { assetTag: string; name: string } | null },
    type: 'REQUESTED' | 'APPROVED' | 'REJECTED'
  ) {
    const targetUserId = type === 'REQUESTED' ? transfer.toEmployeeId : transfer.requestedById;
    const messages = {
      REQUESTED: { title: 'Transfer Request Received', body: `A transfer request has been made for asset ${transfer.asset?.name ?? ''}.` },
      APPROVED:  { title: 'Transfer Approved',         body: `Your transfer request for ${transfer.asset?.name ?? ''} has been approved.` },
      REJECTED:  { title: 'Transfer Rejected',         body: `Your transfer request for ${transfer.asset?.name ?? ''} has been rejected.` },
    };
    const msg = messages[type];
    return this.create(targetUserId, transfer.orgId, `TRANSFER_${type}`, msg.title, msg.body, `/transfers/${transfer.id}`);
  },

  async createBookingReminder(booking: { id: string; orgId: string; bookedById: string; title: string; startTime: Date | string }) {
    return this.create(booking.bookedById, booking.orgId, 'BOOKING_REMINDER', `Upcoming Booking: ${booking.title}`, `Your booking starts soon.`, `/bookings/${booking.id}`);
  },
};
