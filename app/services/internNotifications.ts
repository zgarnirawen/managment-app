import { PrismaClient } from '@prisma/client';
import Pusher from 'pusher';

const prisma = new PrismaClient();

// Initialize Pusher server instance
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export interface TaskNotification {
  type: 'task_assigned' | 'task_updated' | 'task_completed' | 'task_feedback';
  taskId: string;
  internId: string;
  assignerId: string;
  message: string;
  data: any;
}

export interface AnnouncementNotification {
  type: 'announcement_created';
  announcementId: string;
  target: string;
  departmentId?: string;
  message: string;
  data: any;
}

export interface ChatNotification {
  type: 'message_received' | 'message_reply';
  messageId: string;
  channelId: string;
  senderId: string;
  message: string;
  data: any;
}

// Send task notification to intern
export async function sendTaskNotification(notification: TaskNotification) {
  try {
    // Send to intern's personal channel
    await pusher.trigger(`intern-${notification.internId}`, 'task-notification', {
      ...notification,
      timestamp: new Date().toISOString(),
    });

    // Create persistent notification in database
    await prisma.notification.create({
      data: {
        employeeId: notification.internId,
        message: notification.message,
        type: 'TASK_UPDATE',
        read: false,
      }
    });

    console.log('Task notification sent successfully');
  } catch (error) {
    console.error('Error sending task notification:', error);
  }
}

// Send announcement notification
export async function sendAnnouncementNotification(notification: AnnouncementNotification) {
  try {
    let channels: string[] = [];

    // Determine target channels based on announcement target
    switch (notification.target) {
      case 'ALL':
        channels = ['general-announcements'];
        break;
      case 'INTERNS':
        channels = ['intern-announcements'];
        break;
      case 'DEPARTMENT':
        if (notification.departmentId) {
          channels = [`department-${notification.departmentId}-announcements`];
        }
        break;
      default:
        channels = ['general-announcements'];
    }

    // Send to all relevant channels
    for (const channel of channels) {
      await pusher.trigger(channel, 'announcement-notification', {
        ...notification,
        timestamp: new Date().toISOString(),
      });
    }

    // If targeting interns specifically, also create individual notifications
    if (notification.target === 'INTERNS') {
      const interns = await prisma.internProfile.findMany({
        include: { employee: true }
      });

      for (const intern of interns) {
        await prisma.notification.create({
          data: {
            employeeId: intern.employeeId,
            message: notification.message,
            type: 'ANNOUNCEMENT',
            read: false,
          }
        });
      }
    }

    console.log('Announcement notification sent successfully');
  } catch (error) {
    console.error('Error sending announcement notification:', error);
  }
}

// Send chat notification
export async function sendChatNotification(notification: ChatNotification) {
  try {
    // Send to channel subscribers
    await pusher.trigger(`chat-${notification.channelId}`, 'message-notification', {
      ...notification,
      timestamp: new Date().toISOString(),
    });

    console.log('Chat notification sent successfully');
  } catch (error) {
    console.error('Error sending chat notification:', error);
  }
}

// Send resource upload notification
export async function sendResourceNotification(resourceId: string, departmentId?: string) {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      include: {
        uploader: true,
        department: true
      }
    });

    if (!resource) return;

    const notification = {
      type: 'resource_uploaded',
      resourceId,
      message: `New resource available: ${resource.title}`,
      data: {
        title: resource.title,
        type: resource.type,
        uploader: resource.uploader.name,
        department: resource.department?.name
      },
      timestamp: new Date().toISOString(),
    };

    // Send to appropriate channels
    if (departmentId) {
      await pusher.trigger(`department-${departmentId}-resources`, 'resource-notification', notification);
    } else {
      await pusher.trigger('general-resources', 'resource-notification', notification);
    }

    console.log('Resource notification sent successfully');
  } catch (error) {
    console.error('Error sending resource notification:', error);
  }
}

// Get live intern activity (who's online, active tasks, etc.)
export async function broadcastInternActivity(internId: string, activity: 'online' | 'offline' | 'task_started' | 'task_completed') {
  try {
    const intern = await prisma.employee.findUnique({
      where: { id: internId },
      include: {
        internProfile: true,
        department: true
      }
    });

    if (!intern || !intern.internProfile) return;

    const activityData = {
      internId,
      internName: intern.name,
      department: intern.department?.name,
      activity,
      timestamp: new Date().toISOString(),
    };

    // Broadcast to intern activity channel (visible to mentors and HR)
    await pusher.trigger('intern-activity', 'activity-update', activityData);

    console.log('Intern activity broadcasted successfully');
  } catch (error) {
    console.error('Error broadcasting intern activity:', error);
  }
}

// Mentor notification when intern needs help
export async function sendMentorNotification(internId: string, mentorId: string, message: string, type: 'help_request' | 'task_question' | 'general') {
  try {
    const notification = {
      type,
      internId,
      message,
      timestamp: new Date().toISOString(),
    };

    // Send to mentor's personal channel
    await pusher.trigger(`mentor-${mentorId}`, 'intern-notification', notification);

    // Create persistent notification
    await prisma.notification.create({
      data: {
        employeeId: mentorId,
        message,
        type: 'INTERN_UPDATE',
        read: false,
      }
    });

    console.log('Mentor notification sent successfully');
  } catch (error) {
    console.error('Error sending mentor notification:', error);
  }
}
