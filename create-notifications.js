import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSampleNotifications() {
  try {
    const employeeId = 'cmets2l7w0001mhu87uxes32j'; // John Doe

    // Create some sample notifications
    const notifications = await Promise.all([
      prisma.notification.create({
        data: {
          employeeId,
          message: 'You have been assigned a new task: Complete quarterly report',
          type: 'TASK_ASSIGNED',
          read: false,
          metadata: {
            taskId: 'task-123',
            priority: 'high'
          }
        }
      }),
      prisma.notification.create({
        data: {
          employeeId,
          message: 'Reminder: Project deadline is tomorrow',
          type: 'DEADLINE_REMINDER',
          read: false,
          metadata: {
            projectId: 'project-456',
            deadline: '2025-08-28'
          }
        }
      }),
      prisma.notification.create({
        data: {
          employeeId,
          message: 'Your leave request has been approved',
          type: 'LEAVE_APPROVED',
          read: true,
          metadata: {
            leaveId: 'leave-789',
            startDate: '2025-09-01',
            endDate: '2025-09-05'
          }
        }
      })
    ]);

    console.log(`✅ Created ${notifications.length} sample notifications for John Doe`);
    notifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.message} (${notif.type})`);
    });
  } catch (error) {
    console.error('Error creating notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleNotifications();
