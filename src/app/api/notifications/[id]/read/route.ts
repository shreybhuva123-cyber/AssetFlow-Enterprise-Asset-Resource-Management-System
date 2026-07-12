import { withAuth } from '@/lib/api/with-auth';
import { prisma } from '@/lib/prisma';
import { notFoundResponse, successResponse } from '@/lib/utils/api-response';

type RouteParams = { params: Promise<{ id: string }> };

export const POST = withAuth(async (_req, ctx, { params }: RouteParams) => {
  const { id } = await params;

  const notification = await prisma.notification.findFirst({
    where: { id, userId: ctx.userId },
  });

  if (!notification) return notFoundResponse('Notification not found');

  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true, readAt: new Date() },
  });

  return successResponse(updated);
});
