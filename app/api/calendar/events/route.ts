import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const team = searchParams.get('team') === 'true';

    // Get current user to check permissions
    const currentUser = await prisma.employee.findUnique({
      where: { clerkUserId: userId }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build query based on role and parameters
    let whereClause: any = {};
    
    if (startDate && endDate) {
      whereClause.startDateTime = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    if (!team || currentUser.role === 'employee') {
      // Personal calendar - only show user's events
      whereClause.createdBy = currentUser.id;
    } else if (team && ['manager', 'admin', 'super_admin'].includes(currentUser.role)) {
      // Team calendar - show relevant team events
      if (currentUser.role === 'manager') {
        // Manager sees their department's events
        whereClause.OR = [
          { createdBy: currentUser.id },
          { 
            creator: {
              departmentId: currentUser.departmentId
            }
          }
        ];
      }
      // Admin and super_admin can see all events (no additional filter)
    }

    const events = await prisma.calendarEvent.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            department: { select: { name: true } }
          }
        },
        task: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        meeting: {
          select: {
            id: true,
            title: true,
            type: true
          }
        },
        leaveRequest: {
          select: {
            id: true,
            type: true,
            status: true
          }
        }
      },
      orderBy: { startDateTime: 'asc' }
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      title, 
      description, 
      startDateTime, 
      endDateTime, 
      allDay, 
      eventType, 
      location,
      attendees,
      taskId,
      projectId,
      meetingId,
      leaveRequestId
    } = await request.json();

    // Get current user
    const currentUser = await prisma.employee.findUnique({
      where: { clerkUserId: userId }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate required fields
    if (!title || !startDateTime || !endDateTime || !eventType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate date range
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    if (start >= end) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    const event = await prisma.calendarEvent.create({
      data: {
        title,
        description,
        startDateTime: start,
        endDateTime: end,
        allDay: allDay || false,
        eventType,
        location,
        attendees: attendees || [],
        createdBy: currentUser.id,
        taskId,
        projectId,
        meetingId,
        leaveRequestId
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        task: {
          select: {
            id: true,
            title: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}
