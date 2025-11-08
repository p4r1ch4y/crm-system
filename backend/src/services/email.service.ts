import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailEnabled = process.env.EMAIL_ENABLED === 'true';
    
    if (!emailEnabled) {
      logger.info('Email service is disabled');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
    }
  }

  private async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      logger.warn('Email service not configured, skipping email send');
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || '"CRM System" <noreply@crm.com>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  async sendLeadCreatedEmail(
    recipientEmail: string,
    leadData: {
      firstName: string;
      lastName: string;
      company?: string;
      status: string;
      assignedTo: string;
    }
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .lead-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Lead Assigned</h1>
            </div>
            <div class="content">
              <p>Hello ${leadData.assignedTo},</p>
              <p>A new lead has been assigned to you:</p>
              <div class="lead-info">
                <h3>${leadData.firstName} ${leadData.lastName}</h3>
                ${leadData.company ? `<p><strong>Company:</strong> ${leadData.company}</p>` : ''}
                <p><strong>Status:</strong> ${leadData.status}</p>
              </div>
              <p>Please log in to the CRM to view more details and follow up.</p>
            </div>
            <div class="footer">
              <p>This is an automated message from the CRM System. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: recipientEmail,
      subject: `New Lead Assigned: ${leadData.firstName} ${leadData.lastName}`,
      html,
      text: `New lead assigned: ${leadData.firstName} ${leadData.lastName} from ${leadData.company || 'N/A'}. Status: ${leadData.status}`,
    });
  }

  async sendStatusChangeEmail(
    recipientEmail: string,
    leadData: {
      firstName: string;
      lastName: string;
      company?: string;
      oldStatus: string;
      newStatus: string;
      changedBy: string;
    }
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .status-change { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .status { display: inline-block; padding: 5px 10px; border-radius: 3px; font-weight: bold; }
            .status-old { background: #fef3c7; color: #92400e; }
            .status-new { background: #d1fae5; color: #065f46; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Lead Status Updated</h1>
            </div>
            <div class="content">
              <p>The status of your lead has been updated:</p>
              <div class="status-change">
                <h3>${leadData.firstName} ${leadData.lastName}</h3>
                ${leadData.company ? `<p><strong>Company:</strong> ${leadData.company}</p>` : ''}
                <p>
                  <span class="status status-old">${leadData.oldStatus}</span>
                  →
                  <span class="status status-new">${leadData.newStatus}</span>
                </p>
                <p><strong>Changed by:</strong> ${leadData.changedBy}</p>
              </div>
              <p>Log in to the CRM to view complete details and activity history.</p>
            </div>
            <div class="footer">
              <p>This is an automated message from the CRM System. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: recipientEmail,
      subject: `Lead Status Changed: ${leadData.firstName} ${leadData.lastName}`,
      html,
      text: `Lead ${leadData.firstName} ${leadData.lastName} status changed from ${leadData.oldStatus} to ${leadData.newStatus} by ${leadData.changedBy}`,
    });
  }

  async sendTaskAssignedEmail(
    recipientEmail: string,
    taskData: {
      title: string;
      description?: string;
      dueDate?: Date;
      priority: string;
      assignedBy: string;
      leadName?: string;
    }
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .task-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .priority { display: inline-block; padding: 5px 10px; border-radius: 3px; font-weight: bold; }
            .priority-high { background: #fee2e2; color: #991b1b; }
            .priority-medium { background: #fef3c7; color: #92400e; }
            .priority-low { background: #dbeafe; color: #1e40af; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Task Assigned</h1>
            </div>
            <div class="content">
              <p>A new task has been assigned to you:</p>
              <div class="task-info">
                <h3>${taskData.title}</h3>
                ${taskData.description ? `<p>${taskData.description}</p>` : ''}
                ${taskData.leadName ? `<p><strong>Related Lead:</strong> ${taskData.leadName}</p>` : ''}
                <p>
                  <strong>Priority:</strong> 
                  <span class="priority priority-${taskData.priority.toLowerCase()}">${taskData.priority}</span>
                </p>
                ${taskData.dueDate ? `<p><strong>Due Date:</strong> ${new Date(taskData.dueDate).toLocaleDateString()}</p>` : ''}
                <p><strong>Assigned by:</strong> ${taskData.assignedBy}</p>
              </div>
              <p>Please log in to the CRM to manage this task.</p>
            </div>
            <div class="footer">
              <p>This is an automated message from the CRM System. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: recipientEmail,
      subject: `New Task Assigned: ${taskData.title}`,
      html,
      text: `New task assigned: ${taskData.title}. Priority: ${taskData.priority}. Assigned by ${taskData.assignedBy}.`,
    });
  }

  async sendTaskReminderEmail(
    recipientEmail: string,
    taskData: {
      title: string;
      dueDate: Date;
      leadName?: string;
    }
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .task-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #f59e0b; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Task Due Soon</h1>
            </div>
            <div class="content">
              <p>Reminder: You have a task due soon:</p>
              <div class="task-info">
                <h3>${taskData.title}</h3>
                ${taskData.leadName ? `<p><strong>Related Lead:</strong> ${taskData.leadName}</p>` : ''}
                <p><strong>Due Date:</strong> ${new Date(taskData.dueDate).toLocaleDateString()}</p>
              </div>
              <p>Please ensure you complete this task on time.</p>
            </div>
            <div class="footer">
              <p>This is an automated message from the CRM System. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: recipientEmail,
      subject: `Task Reminder: ${taskData.title}`,
      html,
      text: `Task reminder: ${taskData.title} is due on ${new Date(taskData.dueDate).toLocaleDateString()}`,
    });
  }
}

export const emailService = new EmailService();
