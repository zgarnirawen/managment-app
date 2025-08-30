import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const preferences = await prisma.employee.findUnique({
      where: { id },
      select: {
        notificationPreferences: true,
      }
    });

    if (!preferences) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Parse JSON string or return defaults
    let parsedPreferences;
    try {
      parsedPreferences = preferences.notificationPreferences 
        ? JSON.parse(preferences.notificationPreferences)
        : getDefaultPreferences();
    } catch (error) {
      console.error('Error parsing notification preferences:', error);
      parsedPreferences = getDefaultPreferences();
    }

    return NextResponse.json({
      preferences: parsedPreferences
    });

  } catch (error) {
    console.error('GET /api/employees/[id]/notification-preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { preferences } = await request.json();

    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: 'Invalid preferences data' },
        { status: 400 }
      );
    }

    // Validate preference structure
    const validatedPreferences = validatePreferences(preferences);
    
    // Store as JSON string
    const employee = await prisma.employee.update({
      where: { id },
      data: {
        notificationPreferences: JSON.stringify(validatedPreferences),
      },
      select: {
        id: true,
        notificationPreferences: true,
      }
    });

    return NextResponse.json({
      success: true,
      preferences: JSON.parse(employee.notificationPreferences || '{}')
    });

  } catch (error) {
    console.error('PUT /api/employees/[id]/notification-preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}

function getDefaultPreferences() {
  return {
    email: {
      taskAssignments: true,
      deadlineReminders: true,
      meetingInvites: true,
      systemUpdates: false,
      chatMessages: true,
    },
    inApp: {
      taskAssignments: true,
      deadlineReminders: true,
      meetingInvites: true,
      systemUpdates: true,
      chatMessages: true,
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
    frequency: {
      immediate: true,
      daily: false,
      weekly: false,
    }
  };
}

function validatePreferences(preferences: any) {
  const defaults = getDefaultPreferences();
  
  return {
    email: { ...defaults.email, ...preferences.email },
    inApp: { ...defaults.inApp, ...preferences.inApp },
    quietHours: { ...defaults.quietHours, ...preferences.quietHours },
    frequency: { ...defaults.frequency, ...preferences.frequency },
  };
}
