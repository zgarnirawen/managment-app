import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';

const updateSyncSettingsSchema = z.object({
  provider: z.enum(['GOOGLE', 'OUTLOOK', 'APPLE', 'CALDAV', 'EXCHANGE']),
  syncEnabled: z.boolean().optional(),
  syncDirection: z.enum(['IMPORT_ONLY', 'EXPORT_ONLY', 'BIDIRECTIONAL']).optional(),
  syncEvents: z.enum(['ALL', 'MEETINGS_ONLY', 'TASKS_ONLY', 'CUSTOM']).optional(),
});

// GET /api/calendar-sync/settings - Get calendar sync settings for current user
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find employee record
    const employee = await prisma.employee.findUnique({
      where: { email: user.emailAddresses[0]?.emailAddress },
      include: {
        calendarSyncSettings: {
          select: {
            id: true,
            provider: true,
            providerAccountId: true,
            syncEnabled: true,
            syncDirection: true,
            syncEvents: true,
            lastSyncAt: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({
      settings: employee.calendarSyncSettings,
    });
  } catch (error) {
    console.error('GET /api/calendar-sync/settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar sync settings' },
      { status: 500 }
    );
  }
}

// PUT /api/calendar-sync/settings - Update calendar sync settings
export async function PUT(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { provider, ...updateData } = updateSyncSettingsSchema.parse(data);

    // Find employee record
    const employee = await prisma.employee.findUnique({
      where: { email: user.emailAddresses[0]?.emailAddress },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Update calendar sync settings
    const settings = await prisma.calendarSyncSettings.update({
      where: {
        employeeId_provider: {
          employeeId: employee.id,
          provider,
        },
      },
      data: updateData,
      select: {
        id: true,
        provider: true,
        providerAccountId: true,
        syncEnabled: true,
        syncDirection: true,
        syncEvents: true,
        lastSyncAt: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('PUT /api/calendar-sync/settings error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update calendar sync settings' },
      { status: 500 }
    );
  }
}

// DELETE /api/calendar-sync/settings - Disconnect calendar sync
export async function DELETE(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const provider = searchParams.get('provider');

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider parameter is required' },
        { status: 400 }
      );
    }

    // Find employee record
    const employee = await prisma.employee.findUnique({
      where: { email: user.emailAddresses[0]?.emailAddress },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Delete calendar sync settings
    await prisma.calendarSyncSettings.delete({
      where: {
        employeeId_provider: {
          employeeId: employee.id,
          provider: provider as any,
        },
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        employeeId: employee.id,
        message: `${provider} Calendar has been disconnected from your work calendar.`,
        type: 'CALENDAR_SYNC_SUCCESS',
        read: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/calendar-sync/settings error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect calendar sync' },
      { status: 500 }
    );
  }
}
