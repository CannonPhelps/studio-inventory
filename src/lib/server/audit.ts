import { prisma } from '$lib/db';
import type { RequestEvent } from '@sveltejs/kit';

export interface AuditLogData {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  details?: string;
  severity?: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
}

export class AuditService {
  static async log(data: AuditLogData, event?: RequestEvent) {
    try {
      const ipAddress = event?.getClientAddress();
      const userAgent = event?.request.headers.get('user-agent');

      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          oldValues: data.oldValues ? JSON.stringify(data.oldValues) : undefined,
          newValues: data.newValues ? JSON.stringify(data.newValues) : undefined,
          ipAddress: ipAddress || undefined,
          userAgent: userAgent || undefined,
          details: data.details,
          severity: data.severity || 'INFO'
        }
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw - audit logging should never break the main functionality
    }
  }

  static async logAssetAction(
    action: string,
    assetId: number,
    userId?: string,
    oldValues?: Record<string, unknown>,
    newValues?: Record<string, unknown>,
    details?: string,
    event?: RequestEvent
  ) {
    await this.log({
      userId,
      action,
      entityType: 'Asset',
      entityId: assetId.toString(),
      oldValues,
      newValues,
      details
    }, event);
  }

  static async logUserAction(
    action: string,
    userId: string,
    targetUserId?: string,
    oldValues?: Record<string, unknown>,
    newValues?: Record<string, unknown>,
    details?: string,
    event?: RequestEvent
  ) {
    await this.log({
      userId,
      action,
      entityType: 'User',
      entityId: targetUserId,
      oldValues,
      newValues,
      details
    }, event);
  }

  static async logCheckoutAction(
    action: string,
    checkoutId: number,
    userId?: string,
    assetId?: number,
    details?: string,
    event?: RequestEvent
  ) {
    await this.log({
      userId,
      action,
      entityType: 'Checkout',
      entityId: checkoutId.toString(),
      details: details || `Asset ID: ${assetId}`
    }, event);
  }

  static async logAuthAction(
    action: string,
    userId?: string,
    details?: string,
    event?: RequestEvent
  ) {
    await this.log({
      userId,
      action,
      entityType: 'Auth',
      details
    }, event);
  }

  static async getAuditLogs(
    filters: {
      userId?: string;
      entityType?: string;
      entityId?: string;
      action?: string;
      severity?: string;
      startDate?: Date;
      endDate?: Date;
    } = {},
    page: number = 1,
    limit: number = 50
  ) {
    const where: Record<string, unknown> = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.entityId) where.entityId = filters.entityId;
    if (filters.action) where.action = filters.action;
    if (filters.severity) where.severity = filters.severity;
    if (filters.startDate || filters.endDate) {
      (where.timestamp as Record<string, Date>) = {};
      if (filters.startDate) (where.timestamp as Record<string, Date>).gte = filters.startDate;
      if (filters.endDate) (where.timestamp as Record<string, Date>).lte = filters.endDate;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.auditLog.count({ where })
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
} 