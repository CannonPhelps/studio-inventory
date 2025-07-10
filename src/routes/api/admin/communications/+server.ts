import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { CommunicationService } from '$lib/server/communication';
import { prisma } from '$lib/db';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const action = url.searchParams.get('action');

    switch (action) {
      case 'templates': {
        const templates = CommunicationService.getEmailTemplates();
        return json(templates);
      }
        
      case 'test-email': {
        const email = url.searchParams.get('email');
        if (!email) {
          return json({ error: 'Email address required' }, { status: 400 });
        }
        
        const emailResult = await CommunicationService.sendEmail({
          to: email,
          subject: 'Test Email from Studio Inventory',
          body: 'This is a test email from the Studio Inventory System.',
          priority: 'normal'
        });
        
        return json({ success: emailResult });
      }
        
      case 'test-sms': {
        const phone = url.searchParams.get('phone');
        if (!phone) {
          return json({ error: 'Phone number required' }, { status: 400 });
        }
        
        const smsResult = await CommunicationService.sendSMS({
          to: phone,
          message: 'Test SMS from Studio Inventory System',
          priority: 'normal'
        });
        
        return json({ success: smsResult });
      }
        
      default:
        return json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Communication API error:', error);
    return json({ error: 'Failed to process communication request' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'send-notification': {
        const { userId, subject, message, priority, channels } = data;
        
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });
        
        if (!user) {
          return json({ error: 'User not found' }, { status: 404 });
        }
        
        const result = await CommunicationService.notifyUser(
          user as any,
          subject,
          message,
          priority || 'normal',
          channels || ['email']
        );
        
        return json(result);
      }
        
      case 'send-bulk-notification': {
        const { userIds, subject, message, priority, channels } = data;
        
        const users = await prisma.user.findMany({
          where: { id: { in: userIds } }
        });
        
        const bulkResult = await CommunicationService.notifyUsers(
          users as any,
          subject,
          message,
          priority || 'normal',
          channels || ['email']
        );
        
        return json(bulkResult);
      }
        
      case 'send-system-notification': {
        const { subject, message, priority, channels } = data;
        
        const systemResult = await CommunicationService.sendSystemNotification(
          subject,
          message,
          priority || 'normal',
          channels || ['email']
        );
        
        return json(systemResult);
      }
        
      case 'send-overdue-reminders': {
        const overdueCheckouts = await prisma.checkout.findMany({
          where: {
            returnedAt: null,
            dueAt: { lt: new Date() }
          },
          include: {
            asset: true
          }
        });
        
        const overdueItems = overdueCheckouts.map(checkout => ({
          user: { email: checkout.user, name: checkout.user, phone: null, role: 'user' },
          itemName: checkout.asset.itemName,
          dueDate: checkout.dueAt,
          daysOverdue: Math.floor((Date.now() - checkout.dueAt.getTime()) / (1000 * 60 * 60 * 24))
        }));
        
        const overdueResult = await CommunicationService.sendOverdueReminders(overdueItems);
        return json(overdueResult);
      }
        
      case 'send-low-stock-alerts': {
        const lowStockAssets = await prisma.asset.findMany({
          where: { quantity: { lte: 2 } },
          include: { category: true }
        });
        
        const lowStockItems = lowStockAssets.map(asset => ({
          itemName: asset.itemName,
          currentQuantity: asset.quantity,
          minQuantity: 2,
          category: asset.category.name
        }));
        
        const lowStockResult = await CommunicationService.sendLowStockAlerts(lowStockItems);
        return json({ success: lowStockResult });
      }
        
      case 'send-maintenance-reminders': {
        const maintenanceAssets = await prisma.asset.findMany({
          where: {
            lastMaintenance: {
              lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
            }
          },
          include: { category: true }
        });
        
        const maintenanceItems = maintenanceAssets.map(asset => ({
          itemName: asset.itemName,
          lastMaintenance: asset.lastMaintenance || new Date(),
          daysSinceMaintenance: asset.lastMaintenance 
            ? Math.floor((Date.now() - asset.lastMaintenance.getTime()) / (1000 * 60 * 60 * 24))
            : 365
        }));
        
        const maintenanceResult = await CommunicationService.sendMaintenanceReminders(maintenanceItems);
        return json(maintenanceResult);
      }
        
      case 'render-template': {
        const { templateId, variables } = data;
        
        const rendered = CommunicationService.renderTemplate(templateId, variables);
        if (!rendered) {
          return json({ error: 'Template not found' }, { status: 404 });
        }
        
        return json(rendered);
      }
        
      default:
        return json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Communication API error:', error);
    return json({ error: 'Failed to process communication request' }, { status: 500 });
  }
}; 