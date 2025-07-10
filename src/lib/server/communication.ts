import type { User } from '$lib/types';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export interface SMSMessage {
  to: string;
  message: string;
  priority: 'low' | 'normal' | 'high';
}

export interface EmailMessage {
  to: string | string[];
  subject: string;
  body: string;
  html?: string;
  priority: 'low' | 'normal' | 'high';
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType: string;
  }>;
}

export interface CommunicationConfig {
  email: {
    enabled: boolean;
    provider: 'smtp' | 'sendgrid' | 'mailgun' | 'aws-ses';
    config: Record<string, string | number | boolean>;
  };
  sms: {
    enabled: boolean;
    provider: 'twilio' | 'aws-sns' | 'nexmo';
    config: Record<string, string | number | boolean>;
  };
}

export class CommunicationService {
  private static config: CommunicationConfig = {
    email: {
      enabled: false,
      provider: 'smtp',
      config: {}
    },
    sms: {
      enabled: false,
      provider: 'twilio',
      config: {}
    }
  };

  /**
   * Initialize communication service with configuration
   */
  static initialize(config: CommunicationConfig) {
    this.config = config;
  }

  /**
   * Send email notification
   */
  static async sendEmail(message: EmailMessage): Promise<boolean> {
    if (!this.config.email.enabled) {
      console.log('Email disabled, would send:', message);
      return true;
    }

    try {
      switch (this.config.email.provider) {
        case 'smtp':
          return await this.sendEmailSMTP(message);
        case 'sendgrid':
          return await this.sendEmailSendGrid(message);
        case 'mailgun':
          return await this.sendEmailMailgun(message);
        case 'aws-ses':
          return await this.sendEmailAWSSES(message);
        default:
          throw new Error(`Unsupported email provider: ${this.config.email.provider}`);
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  /**
   * Send SMS notification
   */
  static async sendSMS(message: SMSMessage): Promise<boolean> {
    if (!this.config.sms.enabled) {
      console.log('SMS disabled, would send:', message);
      return true;
    }

    try {
      switch (this.config.sms.provider) {
        case 'twilio':
          return await this.sendSMSTwilio(message);
        case 'aws-sns':
          return await this.sendSMSAWSSNS(message);
        case 'nexmo':
          return await this.sendSMSNexmo(message);
        default:
          throw new Error(`Unsupported SMS provider: ${this.config.sms.provider}`);
      }
    } catch (error) {
      console.error('SMS sending failed:', error);
      return false;
    }
  }

  /**
   * Send notification to user (email and/or SMS based on preferences)
   */
  static async notifyUser(
    user: User, 
    subject: string, 
    message: string, 
    priority: 'low' | 'normal' | 'high' = 'normal',
    channels: ('email' | 'sms')[] = ['email']
  ): Promise<{ email: boolean; sms: boolean }> {
    const results = { email: false, sms: false };

    if (channels.includes('email') && user.email) {
      results.email = await this.sendEmail({
        to: user.email,
        subject,
        body: message,
        priority
      });
    }

    if (channels.includes('sms') && user.phone) {
      results.sms = await this.sendSMS({
        to: user.phone,
        message: `${subject}: ${message}`,
        priority
      });
    }

    return results;
  }

  /**
   * Send bulk notifications to multiple users
   */
  static async notifyUsers(
    users: User[],
    subject: string,
    message: string,
    priority: 'low' | 'normal' | 'high' = 'normal',
    channels: ('email' | 'sms')[] = ['email']
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    const promises = users.map(async (user) => {
      try {
        const result = await this.notifyUser(user, subject, message, priority, channels);
        if (result.email || result.sms) {
          success++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
        console.error(`Failed to notify user ${user.email}:`, error);
      }
    });

    await Promise.all(promises);
    return { success, failed };
  }

  /**
   * Send system-wide notification
   */
  static async sendSystemNotification(
    subject: string,
    message: string,
    priority: 'low' | 'normal' | 'high' = 'normal',
    channels: ('email' | 'sms')[] = ['email']
  ): Promise<{ success: number; failed: number }> {
    // This would typically fetch all users from the database
    // For now, we'll return a mock result
    console.log('System notification:', { subject, message, priority, channels });
    return { success: 1, failed: 0 };
  }

  /**
   * Send overdue item reminders
   */
  static async sendOverdueReminders(overdueItems: Array<{
    user: User;
    itemName: string;
    dueDate: Date;
    daysOverdue: number;
  }>): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const item of overdueItems) {
      try {
        const subject = 'Overdue Item Reminder';
        const message = `The item "${item.itemName}" is ${item.daysOverdue} day(s) overdue. Please return it as soon as possible.`;
        
        const result = await this.notifyUser(
          item.user,
          subject,
          message,
          'high',
          ['email', 'sms']
        );

        if (result.email || result.sms) {
          success++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
        console.error(`Failed to send overdue reminder to ${item.user.email}:`, error);
      }
    }

    return { success, failed };
  }

  /**
   * Send low stock alerts
   */
  static async sendLowStockAlerts(lowStockItems: Array<{
    itemName: string;
    currentQuantity: number;
    minQuantity: number;
    category: string;
  }>): Promise<boolean> {
    try {
      const subject = 'Low Stock Alert';
      const itemsList = lowStockItems
        .map(item => `• ${item.itemName} (${item.currentQuantity}/${item.minQuantity})`)
        .join('\n');
      
      const message = `The following items are running low on stock:\n\n${itemsList}\n\nPlease reorder these items soon.`;

      // This would typically notify administrators
      const result = await this.sendSystemNotification(subject, message, 'high', ['email']);
      return result.success > 0;
    } catch (error) {
      console.error('Failed to send low stock alerts:', error);
      return false;
    }
  }

  /**
   * Send maintenance reminders
   */
  static async sendMaintenanceReminders(maintenanceItems: Array<{
    itemName: string;
    lastMaintenance: Date;
    daysSinceMaintenance: number;
    assignedUser?: User;
  }>): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const item of maintenanceItems) {
      try {
        const subject = 'Maintenance Reminder';
        const message = `The item "${item.itemName}" hasn't been maintained in ${item.daysSinceMaintenance} days. Please schedule maintenance soon.`;
        
        if (item.assignedUser) {
          const result = await this.notifyUser(
            item.assignedUser,
            subject,
            message,
            'normal',
            ['email']
          );
          if (result.email) success++;
          else failed++;
        } else {
          // Notify administrators
          const result = await this.sendSystemNotification(subject, message, 'normal', ['email']);
          if (result.success > 0) success++;
          else failed++;
        }
      } catch (error) {
        failed++;
        console.error(`Failed to send maintenance reminder for ${item.itemName}:`, error);
      }
    }

    return { success, failed };
  }

  /**
   * Send security alerts
   */
  static async sendSecurityAlert(
    alert: {
      type: 'failed_login' | 'unauthorized_access' | 'suspicious_activity';
      user?: User;
      details: string;
      ipAddress?: string;
      timestamp: Date;
    }
  ): Promise<boolean> {
    try {
      const subject = 'Security Alert';
      const message = `Security Alert - ${alert.type.toUpperCase()}\n\nDetails: ${alert.details}\nTime: ${alert.timestamp.toISOString()}\nIP: ${alert.ipAddress || 'Unknown'}`;

      // Always notify administrators for security alerts
      const result = await this.sendSystemNotification(subject, message, 'high', ['email', 'sms']);
      return result.success > 0;
    } catch (error) {
      console.error('Failed to send security alert:', error);
      return false;
    }
  }

  // Private methods for different providers

  private static async sendEmailSMTP(message: EmailMessage): Promise<boolean> {
    // Implementation would use nodemailer or similar
    console.log('SMTP Email:', message);
    return true;
  }

  private static async sendEmailSendGrid(message: EmailMessage): Promise<boolean> {
    // Implementation would use SendGrid API
    console.log('SendGrid Email:', message);
    return true;
  }

  private static async sendEmailMailgun(message: EmailMessage): Promise<boolean> {
    // Implementation would use Mailgun API
    console.log('Mailgun Email:', message);
    return true;
  }

  private static async sendEmailAWSSES(message: EmailMessage): Promise<boolean> {
    // Implementation would use AWS SES
    console.log('AWS SES Email:', message);
    return true;
  }

  private static async sendSMSTwilio(message: SMSMessage): Promise<boolean> {
    // Implementation would use Twilio API
    console.log('Twilio SMS:', message);
    return true;
  }

  private static async sendSMSAWSSNS(message: SMSMessage): Promise<boolean> {
    // Implementation would use AWS SNS
    console.log('AWS SNS SMS:', message);
    return true;
  }

  private static async sendSMSNexmo(message: SMSMessage): Promise<boolean> {
    // Implementation would use Nexmo API
    console.log('Nexmo SMS:', message);
    return true;
  }

  /**
   * Get available email templates
   */
  static getEmailTemplates(): EmailTemplate[] {
    return [
      {
        id: 'overdue_reminder',
        name: 'Overdue Item Reminder',
        subject: 'Overdue Item Reminder',
        body: 'Dear {{userName}},\n\nThe item "{{itemName}}" is {{daysOverdue}} day(s) overdue. Please return it as soon as possible.\n\nDue Date: {{dueDate}}\n\nThank you.',
        variables: ['userName', 'itemName', 'daysOverdue', 'dueDate']
      },
      {
        id: 'low_stock_alert',
        name: 'Low Stock Alert',
        subject: 'Low Stock Alert - {{itemName}}',
        body: 'The item "{{itemName}}" is running low on stock.\n\nCurrent Quantity: {{currentQuantity}}\nMinimum Quantity: {{minQuantity}}\nCategory: {{category}}\n\nPlease reorder soon.',
        variables: ['itemName', 'currentQuantity', 'minQuantity', 'category']
      },
      {
        id: 'maintenance_reminder',
        name: 'Maintenance Reminder',
        subject: 'Maintenance Reminder - {{itemName}}',
        body: 'The item "{{itemName}}" requires maintenance.\n\nLast Maintenance: {{lastMaintenance}}\nDays Since Maintenance: {{daysSinceMaintenance}}\n\nPlease schedule maintenance soon.',
        variables: ['itemName', 'lastMaintenance', 'daysSinceMaintenance']
      },
      {
        id: 'welcome_user',
        name: 'Welcome New User',
        subject: 'Welcome to Studio Inventory System',
        body: 'Dear {{userName}},\n\nWelcome to the Studio Inventory System!\n\nYour account has been created successfully.\nEmail: {{userEmail}}\nRole: {{userRole}}\n\nYou can now access the system at {{loginUrl}}.',
        variables: ['userName', 'userEmail', 'userRole', 'loginUrl']
      }
    ];
  }

  /**
   * Render email template with variables
   */
  static renderTemplate(templateId: string, variables: Record<string, string>): { subject: string; body: string } | null {
    const template = this.getEmailTemplates().find(t => t.id === templateId);
    if (!template) return null;

    let subject = template.subject;
    let body = template.body;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      body = body.replace(new RegExp(placeholder, 'g'), value);
    }

    return { subject, body };
  }
} 