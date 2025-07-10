import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/routeProtection';
import { NotificationService } from '$lib/server/notifications';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
  try {
    const user = await requireAuth(event);
    
    const { searchParams } = event.url;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const category = searchParams.get('category') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await NotificationService.getUserNotifications(user.id, {
      unreadOnly,
      category: category as 'system' | 'asset' | 'checkout' | 'maintenance' | 'security' | undefined,
      limit,
      offset
    });

    return json(result);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
};

export const POST: RequestHandler = async (event) => {
  try {
    const user = await requireAuth(event);
    const { action, notificationId, category } = await event.request.json();

    if (action === 'markAsRead' && notificationId) {
      await NotificationService.markAsRead(notificationId, user.id);
      return json({ success: true });
    } else if (action === 'markAllAsRead') {
      await NotificationService.markAllAsRead(user.id, category);
      return json({ success: true });
    } else {
      return json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating notifications:', error);
    return json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}; 