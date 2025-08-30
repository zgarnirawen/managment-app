import { Resend } from 'resend';
import { prisma } from '../lib/prisma';
import Pusher from 'pusher';

const resend = new Resend(process.env.RESEND_API_KEY);

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export interface NotificationData {
  employeeId: string;
  message: string;
  type: 'TASK_ASSIGNED' | 'DEADLINE_REMINDER' | 'TASK_COMPLETED' | 'MEETING_REMINDER' | 'LEAVE_APPROVED' | 'LEAVE_REJECTED';
  metadata?: Record<string, unknown>;
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
}

// Create in-app notification
export async function createNotification(data: NotificationData): Promise<{ id: string; employeeId: string; message: string; type: string; read: boolean; createdAt: Date; metadata: Record<string, unknown> | null; }> {
  try {
    const notification = await (prisma as any).notification.create({
      data: {
        employeeId: data.employeeId,
        message: data.message,
        type: data.type,
        metadata: data.metadata || {},
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    // Send real-time notification via Pusher
    await pusher.trigger(`employee-${data.employeeId}`, 'new-notification', {
      id: notification.id,
      message: notification.message,
      type: notification.type,
      createdAt: notification.createdAt,
      metadata: notification.metadata,
    });

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
}

// Send email notification
export async function sendEmailNotification(emailData: EmailData) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'notifications@yourdomain.com',
      to: [emailData.to],
      subject: emailData.subject,
      html: emailData.html,
    });

    if (error) {
      console.error('Failed to send email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}

// Task assignment notification
export async function notifyTaskAssignment(taskId: string, employeeId: string, assignedBy?: string) {
  try {
    // Get task details
    const task = await (prisma as any).task.findUnique({
      where: { id: taskId },
      include: {
        assignedTo: true,
        project: true,
      }
    });

    if (!task || !task.assignedTo) {
      throw new Error('Task or employee not found');
    }

    const employee = task.assignedTo;
    const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline set';
    
    // Create in-app notification
    await createNotification({
      employeeId: employee.id,
      message: `New task assigned: "${task.title}"`,
      type: 'TASK_ASSIGNED',
      metadata: {
        taskId: task.id,
        taskTitle: task.title,
        dueDate: task.dueDate,
        assignedBy,
      }
    });

    // Send email notification
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Task Assigned</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2563eb;">${task.title}</h3>
          <p><strong>Description:</strong> ${task.description || 'No description provided'}</p>
          <p><strong>Due Date:</strong> ${dueDate}</p>
          <p><strong>Priority:</strong> ${task.priority}</p>
          ${task.project ? `<p><strong>Project:</strong> ${task.project.name}</p>` : ''}
          ${assignedBy ? `<p><strong>Assigned by:</strong> ${assignedBy}</p>` : ''}
        </div>
        <p>Please log in to your dashboard to view the full details and start working on this task.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tasks" 
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Task
        </a>
      </div>
    `;

    await sendEmailNotification({
      to: employee.email,
      subject: `New Task Assigned: ${task.title}`,
      html: emailHtml,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to notify task assignment:', error);
    throw error;
  }
}

// Deadline reminder notification
export async function notifyDeadlineReminder(taskId: string) {
  try {
    const task = await (prisma as any).task.findUnique({
      where: { id: taskId },
      include: {
        assignedTo: true,
        project: true,
      }
    });

    if (!task || !task.assignedTo || !task.dueDate) {
      return;
    }

    const employee = task.assignedTo;
    const dueDate = new Date(task.dueDate).toLocaleDateString();
    
    // Create in-app notification
    await createNotification({
      employeeId: employee.id,
      message: `Task deadline tomorrow: "${task.title}"`,
      type: 'DEADLINE_REMINDER',
      metadata: {
        taskId: task.id,
        taskTitle: task.title,
        dueDate: task.dueDate,
      }
    });

    // Send email notification
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Task Deadline Reminder</h2>
        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #dc2626;">${task.title}</h3>
          <p><strong>⚠️ Due Date:</strong> ${dueDate} (Tomorrow!)</p>
          <p><strong>Description:</strong> ${task.description || 'No description provided'}</p>
          <p><strong>Priority:</strong> ${task.priority}</p>
          <p><strong>Status:</strong> ${task.status}</p>
          ${task.project ? `<p><strong>Project:</strong> ${task.project.name}</p>` : ''}
        </div>
        <p>Don't forget to complete this task before the deadline!</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tasks" 
           style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Task
        </a>
      </div>
    `;

    await sendEmailNotification({
      to: employee.email,
      subject: `⚠️ Task Deadline Tomorrow: ${task.title}`,
      html: emailHtml,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send deadline reminder:', error);
    throw error;
  }
}
