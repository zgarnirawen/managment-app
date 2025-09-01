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

    return NextResponse.json({ 
      settings: settings || {
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false
      }
    });

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
    const { 
      theme, 
      language, 
      timezone, 
      emailNotifications,
      pushNotifications,
      smsNotifications 
    } = body;

    // Find the employee record for this user
    const employee = await prisma.employee.findUnique({
      where: { clerkUserId: userId }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Update or create user settings
    const settings = await prisma.userSettings.upsert({
      where: { employeeId: employee.id },
      update: {
        theme,
        language,
        timezone,
        emailNotifications,
        pushNotifications,
        smsNotifications,
      },
      create: {
        employeeId: employee.id,
        theme: theme || 'system',
        language: language || 'en',
        timezone: timezone || 'UTC',
        emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
        pushNotifications: pushNotifications !== undefined ? pushNotifications : true,
        smsNotifications: smsNotifications !== undefined ? smsNotifications : false,
      }
    });

    return NextResponse.json({ 
      success: true,
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