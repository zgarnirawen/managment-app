import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the employee record for this user
    const employee = await prisma.employee.findUnique({
      where: { clerkUserId: userId }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Get user settings
    const settings = await prisma.userSettings.findUnique({
      where: { employeeId: employee.id }
    });

    // Return settings in the format expected by the settings page
    const defaultSettings = {
      profile: {
        phone: employee.phone || '',
        department: employee.departmentId || '',
        jobTitle: employee.position || ''
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        taskReminders: true,
        meetingReminders: true,
        weeklyReports: true
      },
      preferences: {
        theme: 'dark',
        timeFormat: '24h',
        dateFormat: 'MM/DD/YYYY',
        timezone: 'UTC',
        language: 'en'
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 30,
        passwordLastChanged: null
      }
    };

    if (settings) {
      // Map existing settings to the expected format
      return NextResponse.json({
        profile: {
          phone: employee.phone || '',
          department: employee.departmentId || '',
          jobTitle: employee.position || ''
        },
        notifications: {
          emailNotifications: settings.emailNotifications,
          pushNotifications: settings.pushNotifications,
          smsNotifications: settings.smsNotifications,
          taskReminders: settings.taskReminders,
          meetingReminders: true, // Not in current schema, use default
          weeklyReports: settings.weeklyReports
        },
        preferences: {
          theme: settings.theme,
          timeFormat: settings.timeFormat,
          dateFormat: settings.dateFormat,
          timezone: settings.timezone,
          language: settings.language
        },
        security: {
          twoFactorEnabled: false, // Not in current schema
          sessionTimeout: 30, // Not in current schema
          passwordLastChanged: null // Not in current schema
        }
      });
    } else {
      return NextResponse.json(defaultSettings);
    }

  } catch (error) {
    console.error('User settings fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch user settings' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Find the employee record for this user
    const employee = await prisma.employee.findUnique({
      where: { clerkUserId: userId }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Extract settings from the new structure
    const notificationSettings = body.notifications || {};
    const preferenceSettings = body.preferences || {};

    // Update or create user settings
    const settings = await prisma.userSettings.upsert({
      where: { employeeId: employee.id },
      update: {
        theme: preferenceSettings.theme || 'dark',
        language: preferenceSettings.language || 'en',
        timezone: preferenceSettings.timezone || 'UTC',
        dateFormat: preferenceSettings.dateFormat || 'MM/DD/YYYY',
        timeFormat: preferenceSettings.timeFormat || '24h',
        emailNotifications: notificationSettings.emailNotifications !== undefined ? notificationSettings.emailNotifications : true,
        pushNotifications: notificationSettings.pushNotifications !== undefined ? notificationSettings.pushNotifications : true,
        smsNotifications: notificationSettings.smsNotifications !== undefined ? notificationSettings.smsNotifications : false,
        weeklyReports: notificationSettings.weeklyReports !== undefined ? notificationSettings.weeklyReports : true,
        taskReminders: notificationSettings.taskReminders !== undefined ? notificationSettings.taskReminders : true,
      },
      create: {
        employeeId: employee.id,
        theme: preferenceSettings.theme || 'dark',
        language: preferenceSettings.language || 'en',
        timezone: preferenceSettings.timezone || 'UTC',
        dateFormat: preferenceSettings.dateFormat || 'MM/DD/YYYY',
        timeFormat: preferenceSettings.timeFormat || '24h',
        emailNotifications: notificationSettings.emailNotifications !== undefined ? notificationSettings.emailNotifications : true,
        pushNotifications: notificationSettings.pushNotifications !== undefined ? notificationSettings.pushNotifications : true,
        smsNotifications: notificationSettings.smsNotifications !== undefined ? notificationSettings.smsNotifications : false,
        weeklyReports: notificationSettings.weeklyReports !== undefined ? notificationSettings.weeklyReports : true,
        taskReminders: notificationSettings.taskReminders !== undefined ? notificationSettings.taskReminders : true,
      }
    });

    return NextResponse.json({ 
      message: 'Settings updated successfully',
      settings
    });

  } catch (error) {
    console.error('User settings update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update user settings' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}