import { type NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { prisma } from '@/lib/prisma';
import { successResponse, noContentResponse } from '@/lib/utils/api-response';

export const GET = withAuth(async (req: NextRequest, ctx) => {
  const limit = Number(req.nextUrl.searchParams.get('limit') ?? '20');
  const unreadOnly = req.nextUrl.searchParams.get('unreadOnly') === 'true';

  const notifications = await prisma.notification.findMany({
    where: {
      userId: ctx.userId,
      ...(unreadOnly && { isRead: false }),
    },
    orderBy: { createdAt: 'desc' },
    take: Math.min(limit, 50),
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: ctx.userId, isRead: false },
  });

  return successResponse({ notifications, unreadCount });
});

// Mark all as read
export const POST = withAuth(async (_req, ctx) => {
  await prisma.notification.updateMany({
    where: { userId: ctx.userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });

  return noContentResponse();
});
