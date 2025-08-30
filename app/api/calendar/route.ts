import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    const events: any[] = [];

    // Build date filter if provided
    const dateFilter: any = {};
    if (start && end) {
      dateFilter.gte = new Date(start);
      dateFilter.lte = new Date(end);
    }

    // Initialize events array

    // Fetch Tasks with deadlines
    const taskFilter: any = {
      deadline: dateFilter.gte ? { gte: dateFilter.gte, lte: dateFilter.lte } : { not: null }
    };
    if (employeeId) taskFilter.employeeId = employeeId;

    const tasks = await prisma.task.findMany({
      where: taskFilter,
      include: {
        assignedTo: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } }
      }
    });

    // Convert tasks to calendar events
    tasks.forEach(task => {
      const taskWithDeadline = task as any;
      if (taskWithDeadline.deadline) {
        events.push({
          id: `task-${task.id}`,
          title: task.title,
          start: taskWithDeadline.deadline,
          end: taskWithDeadline.deadline,
          type: 'TASK',
          employeeId: task.employeeId,
          employeeName: task.assignedTo?.name,
          projectName: task.project?.name,
          description: task.description,
          priority: task.priority,
          status: task.status,
          backgroundColor: '#3b82f6', // Blue for tasks
          borderColor: '#2563eb',
          extendedProps: {
            type: 'TASK',
            taskId: task.id,
            priority: task.priority,
            status: task.status,
            assignedTo: task.assignedTo,
            project: task.project
          }
        });
      }
    });

    // Fetch Sprints
    const sprintFilter: any = {};
    if (start && end) {
      sprintFilter.OR = [
        { startDate: { gte: dateFilter.gte, lte: dateFilter.lte } },
        { endDate: { gte: dateFilter.gte, lte: dateFilter.lte } },
        { 
          AND: [
            { startDate: { lte: dateFilter.gte } },
            { endDate: { gte: dateFilter.lte } }
          ]
        }
      ];
    }

    const sprints = await prisma.sprint.findMany({
      where: sprintFilter,
      include: {
        tasks: { select: { id: true, title: true } }
      }
    });

    // Convert sprints to calendar events
    sprints.forEach(sprint => {
      events.push({
        id: `sprint-${sprint.id}`,
        title: `Sprint: ${sprint.name}`,
        start: sprint.startDate,
        end: sprint.endDate,
        type: 'SPRINT',
        description: `Sprint with ${sprint.tasks.length} tasks`,
        backgroundColor: '#f97316', // Orange for sprints
        borderColor: '#ea580c',
        extendedProps: {
          type: 'SPRINT',
          sprintId: sprint.id,
          tasksCount: sprint.tasks.length,
          tasks: sprint.tasks
        }
      });
    });

    // Fetch Meetings
    const meetingFilter: any = {};
    if (start && end) {
      meetingFilter.OR = [
        { startDate: { gte: dateFilter.gte, lte: dateFilter.lte } },
        { endDate: { gte: dateFilter.gte, lte: dateFilter.lte } },
        { 
          AND: [
            { startDate: { lte: dateFilter.gte } },
            { endDate: { gte: dateFilter.lte } }
          ]
        }
      ];
    }
    if (employeeId) {
      meetingFilter.OR = [
        { organizerId: employeeId },
        { attendees: { some: { id: employeeId } } }
      ];
    }

    const meetings = await (prisma as any).meeting.findMany({
      where: meetingFilter,
      include: {
        organizer: { select: { id: true, name: true } },
        attendees: { select: { id: true, name: true } }
      }
    });

    // Convert meetings to calendar events
    meetings.forEach((meeting: any) => {
      events.push({
        id: `meeting-${meeting.id}`,
        title: meeting.title,
        start: meeting.startDate,
        end: meeting.endDate,
        type: 'MEETING',
        description: meeting.description,
        location: meeting.location,
        backgroundColor: '#10b981', // Green for meetings
        borderColor: '#059669',
        extendedProps: {
          type: 'MEETING',
          meetingId: meeting.id,
          meetingType: meeting.type,
          organizer: meeting.organizer,
          attendees: meeting.attendees,
          location: meeting.location
        }
      });
    });

    // Fetch Leave Requests (optional)
    const leaveFilter: any = {};
    if (start && end) {
      leaveFilter.OR = [
        { startDate: { gte: dateFilter.gte, lte: dateFilter.lte } },
        { endDate: { gte: dateFilter.gte, lte: dateFilter.lte } },
        { 
          AND: [
            { startDate: { lte: dateFilter.gte } },
            { endDate: { gte: dateFilter.lte } }
          ]
        }
      ];
    }
    if (employeeId) leaveFilter.employeeId = employeeId;
    leaveFilter.status = 'APPROVED'; // Only show approved leave

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: leaveFilter,
      include: {
        employee: { select: { id: true, name: true } }
      }
    });

    // Convert leave requests to calendar events
    leaveRequests.forEach(leave => {
      events.push({
        id: `leave-${leave.id}`,
        title: `${leave.employee.name} - Leave`,
        start: leave.startDate,
        end: leave.endDate,
        type: 'LEAVE',
        employeeId: leave.employeeId,
        employeeName: leave.employee.name,
        description: leave.reason || 'Leave request',
        backgroundColor: '#8b5cf6', // Purple for leave
        borderColor: '#7c3aed',
        extendedProps: {
          type: 'LEAVE',
          leaveId: leave.id,
          reason: leave.reason,
          employee: leave.employee
        }
      });
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('GET /api/calendar error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

// PUT endpoint for updating task deadlines via drag & drop
export async function PUT(request: NextRequest) {
  try {
    const { id, start, end } = await request.json();
    
    if (!id || !start) {
      return NextResponse.json(
        { error: 'Event ID and start date are required' },
        { status: 400 }
      );
    }

    const [type, entityId] = id.split('-');

    if (type === 'task') {
      await prisma.task.update({
        where: { id: entityId },
        data: { 
          deadline: new Date(start),
          updatedAt: new Date()
        } as any
      });
    } else if (type === 'meeting') {
      await (prisma as any).meeting.update({
        where: { id: entityId },
        data: {
          startDate: new Date(start),
          endDate: end ? new Date(end) : new Date(start),
          updatedAt: new Date()
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Cannot reschedule this type of event' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/calendar error:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}
