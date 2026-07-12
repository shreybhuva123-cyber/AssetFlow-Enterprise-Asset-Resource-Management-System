import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/get-session';
import { notificationService } from '@/lib/services/notification.service';

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.profile.id; const orgId = session.profile.orgId!;
  const isRead = req.nextUrl.searchParams.get('isRead');
  try {
    const notifications = await notificationService.getForUser(
      userId, orgId,
      isRead === 'true' ? true : isRead === 'false' ? false : undefined
    );
    return NextResponse.json({ data: notifications });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.profile.id; const orgId = session.profile.orgId!;
  const body = await req.json();
  try {
    if (body.all) {
      await notificationService.markAllRead(userId, orgId);
      return NextResponse.json({ message: 'All notifications marked as read' });
    }
    if (Array.isArray(body.ids)) {
      for (const id of body.ids) await notificationService.markRead(id, userId);
      return NextResponse.json({ message: 'Notifications marked as read' });
    }
    return NextResponse.json({ error: 'Provide ids array or all:true' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
