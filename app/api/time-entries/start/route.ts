import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { employeeId, type, location, timestamp } = await request.json();

    if (!employeeId || !type) {
      return NextResponse.json(
        { error: 'Employee ID and type are required' },
        { status: 400 }
      );
    }

    // Check if employee has an active session
    const activeSession = await prisma.timeEntry.findFirst({
      where: {
        employeeId,
        endTime: null,
      },
    });

    if (activeSession) {
      return NextResponse.json(
        { error: 'Employee already has an active session' },
        { status: 400 }
      );
    }

    // Create new time entry
    const timeEntry = await prisma.timeEntry.create({
      data: {
        employeeId,
        type,
        startTime: timestamp ? new Date(timestamp) : new Date(),
        location: location || null,
        isOnline: true,
      },
    });

    return NextResponse.json({
      id: timeEntry.id,
      type: timeEntry.type,
      startTime: timeEntry.startTime,
      location: timeEntry.location,
    });

  } catch (error) {
    console.error('Error starting time session:', error);
    return NextResponse.json(
      { error: 'Failed to start time session' },
      { status: 500 }
    );
  }
}
