import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { notifyDeadlineReminder } from '../services/notificationService';

// Function to check for tasks with deadlines tomorrow
async function checkDeadlineReminders() {
  try {
    console.log('Checking for deadline reminders...');
    
    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Find tasks due tomorrow that are not completed
    const tasksDueTomorrow = await (prisma as any).task.findMany({
      where: {
        dueDate: {
          gte: tomorrow,
          lt: dayAfterTomorrow,
        },
        status: {
          not: 'DONE'
        },
        assignedTo: {
          isNot: null
        }
      },
      include: {
        assignedTo: true,
        project: true,
      }
    });

    console.log(`Found ${tasksDueTomorrow.length} tasks due tomorrow`);

    // Send reminder for each task
    for (const task of tasksDueTomorrow) {
      try {
        await notifyDeadlineReminder(task.id);
        console.log(`Sent deadline reminder for task: ${task.title}`);
      } catch (error) {
        console.error(`Failed to send reminder for task ${task.id}:`, error);
      }
    }

    console.log('Deadline reminder check completed');
  } catch (error) {
    console.error('Error checking deadline reminders:', error);
  }
}

// Function to start the cron job
export function startDeadlineReminderCron() {
  // Run every day at 9:00 AM
  cron.schedule('0 9 * * *', checkDeadlineReminders, {
    timezone: 'UTC'
  });

  console.log('Deadline reminder cron job started - runs daily at 9:00 AM UTC');
}

// Function to run deadline check manually (for testing)
export async function runDeadlineCheckNow() {
  await checkDeadlineReminders();
}

// Export the check function for manual testing
export { checkDeadlineReminders };
