import { prisma } from '$lib/db';
import { AuditService } from './audit';

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  category: 'system' | 'asset' | 'checkout' | 'maintenance' | 'security';
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  category: 'system' | 'asset' | 'checkout' | 'maintenance' | 'security';
  conditions: NotificationCondition[];
  enabled: boolean;
}

export interface NotificationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: string | number | boolean;
}

export class NotificationService {
  /**
   * Create a notification for a specific user
   */
  static async createNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    category: Notification['category'],
    options: {
      actionUrl?: string;
      metadata?: Record<string, unknown>;
      expiresAt?: Date;
    } = {}
  ): Promise<Notification> {
    try {
      const notification = await prisma.notification.create({
        data: {
          id: crypto.randomUUID(),
          userId,
          type,
          title,
          message,
          category,
          read: false,
          actionUrl: options.actionUrl,
          metadata: options.metadata ? JSON.stringify(options.metadata) : null,
          expiresAt: options.expiresAt
        }
      });

      // Log the notification creation
      await AuditService.log({
        userId,
        action: 'NOTIFICATION_CREATED',
        entityType: 'Notification',
        entityId: notification.id,
        details: `Notification "${title}" sent to user ${userId}`,
        severity: type === 'error' ? 'ERROR' : type === 'warning' ? 'WARNING' : 'INFO'
      });

      return {
        ...notification,
        metadata: notification.metadata ? JSON.parse(notification.metadata) : undefined
      };
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  /**
   * Create notifications for multiple users
   */
  static async createBulkNotifications(
    userIds: string[],
    type: Notification['type'],
    title: string,
    message: string,
    category: Notification['category'],
    options: {
      actionUrl?: string;
      metadata?: Record<string, unknown>;
      expiresAt?: Date;
    } = {}
  ): Promise<Notification[]> {
    const notifications = await Promise.all(
      userIds.map(userId => 
        this.createNotification(userId, type, title, message, category, options)
      )
    );

    return notifications;
  }

  /**
   * Get notifications for a user
   */
  static async getUserNotifications(
    userId: string,
    options: {
      unreadOnly?: boolean;
      category?: Notification['category'];
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ notifications: Notification[]; total: number }> {
    const { unreadOnly = false, category, limit = 50, offset = 0 } = options;

    const where: Record<string, unknown> = { userId };
    if (unreadOnly) where.read = false;
    if (category) where.category = category;
    where.expiresAt = { gte: new Date() };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.notification.count({ where })
    ]);

    return {
      notifications: notifications.map(n => ({
        ...n,
        metadata: n.metadata ? JSON.parse(n.metadata) : undefined
      })),
      total
    };
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true }
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string, category?: Notification['category']): Promise<void> {
    const where: any = { userId, read: false };
    if (category) where.category = category;

    await prisma.notification.updateMany({
      where,
      data: { read: true }
    });
  }

  /**
   * Delete expired notifications
   */
  static async cleanupExpiredNotifications(): Promise<number> {
    const result = await prisma.notification.deleteMany({
      where: {
        expiresAt: { lt: new Date() }
      }
    });

    return result.count;
  }

  /**
   * Smart notification triggers
   */
  static async checkAssetNotifications(): Promise<void> {
    // Check for overdue checkouts
    const overdueCheckouts = await prisma.checkout.findMany({
      where: {
        returnedAt: null,
        dueAt: { lt: new Date() }
      },
      include: {
        asset: true
      }
    });

    for (const checkout of overdueCheckouts) {
      await this.createNotification(
        checkout.user,
        'warning',
        'Overdue Asset',
        `Asset "${checkout.asset.itemName}" is overdue. Please return it as soon as possible.`,
        'checkout',
        {
          actionUrl: `/my-checkouts`,
          metadata: { assetId: checkout.assetId, checkoutId: checkout.id }
        }
      );
    }

    // Check for assets needing maintenance
    const maintenanceNeeded = await prisma.asset.findMany({
      where: {
        lastMaintenance: {
          lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // 1 year ago
        }
      }
    });

    if (maintenanceNeeded.length > 0) {
      // Notify admins about maintenance
      const admins = await prisma.user.findMany({
        where: { role: 'admin' }
      });

      await this.createBulkNotifications(
        admins.map(admin => admin.id),
        'warning',
        'Maintenance Required',
        `${maintenanceNeeded.length} assets require maintenance.`,
        'maintenance',
        {
          actionUrl: '/admin/maintenance',
          metadata: { assetCount: maintenanceNeeded.length }
        }
      );
    }
  }

  /**
   * Check for low inventory alerts
   */
  static async checkInventoryAlerts(): Promise<void> {
    const lowStockAssets = await prisma.asset.findMany({
      where: {
        quantity: { lte: 2 },
        status: 'Available'
      }
    });

    if (lowStockAssets.length > 0) {
      const admins = await prisma.user.findMany({
        where: { role: 'admin' }
      });

      await this.createBulkNotifications(
        admins.map(admin => admin.id),
        'warning',
        'Low Inventory Alert',
        `${lowStockAssets.length} assets are running low on stock.`,
        'asset',
        {
          actionUrl: '/admin/assets',
          metadata: { assetCount: lowStockAssets.length }
        }
      );
    }
  }

  /**
   * Check for security notifications
   */
  static async checkSecurityNotifications(): Promise<void> {
    // Check for failed login attempts
    const recentFailedLogins = await prisma.auditLog.findMany({
      where: {
        action: 'LOGIN_FAILED',
        timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      }
    });

    if (recentFailedLogins.length > 5) {
      const admins = await prisma.user.findMany({
        where: { role: 'admin' }
      });

      await this.createBulkNotifications(
        admins.map(admin => admin.id),
        'error',
        'Security Alert',
        `${recentFailedLogins.length} failed login attempts detected in the last 24 hours.`,
        'security',
        {
          actionUrl: '/admin/audit-logs',
          metadata: { failedAttempts: recentFailedLogins.length }
        }
      );
    }
  }

  /**
   * Run all notification checks
   */
  static async runNotificationChecks(): Promise<void> {
    try {
      await Promise.all([
        this.checkAssetNotifications(),
        this.checkInventoryAlerts(),
        this.checkSecurityNotifications()
      ]);

      // Cleanup expired notifications
      await this.cleanupExpiredNotifications();
    } catch (error) {
      console.error('Error running notification checks:', error);
    }
  }

  /**
   * Get notification statistics for a user
   */
  static async getUserNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    byCategory: Record<string, number>;
  }> {
    const [total, unread, byCategory] = await Promise.all([
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, read: false } }),
      prisma.notification.groupBy({
        by: ['category'],
        where: { userId },
        _count: { category: true }
      })
    ]);

    const categoryStats: Record<string, number> = {};
    byCategory.forEach(item => {
      categoryStats[item.category] = item._count.category;
    });

    return { total, unread, byCategory: categoryStats };
  }
} 