import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Get current user to check permissions
    const currentUser = await prisma.employee.findUnique({
      where: { clerkUserId: userId }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build query based on role and parameters
    let whereClause: any = {};
    
    if (employeeId) {
      // Check if user has permission to view this employee's attendance
      if (currentUser.role === 'employee' && currentUser.id !== employeeId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
      whereClause.employeeId = employeeId;
    } else {
      // For employees, only show their own data
      if (currentUser.role === 'employee') {
        whereClause.employeeId = currentUser.id;
      }
    }

    if (startDate && endDate) {
      whereClause.clockInTime = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const attendance = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            department: { select: { name: true } }
          }
        }
      },
      orderBy: { clockInTime: 'desc' }
    });

    return NextResponse.json({ attendance });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
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

    const { action, location, notes } = await request.json();

    // Get current user
    const currentUser = await prisma.employee.findUnique({
      where: { clerkUserId: userId }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();

    if (action === 'clockIn') {
      // Check if user already clocked in today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const existingAttendance = await prisma.attendance.findFirst({
        where: {
          employeeId: currentUser.id,
          clockInTime: {
            gte: today,
            lt: tomorrow
          },
          clockOutTime: null
        }
      });

      if (existingAttendance) {
        return NextResponse.json(
          { error: 'Already clocked in today' },
          { status: 400 }
        );
      }

      const attendance = await prisma.attendance.create({
        data: {
          employeeId: currentUser.id,
          clockInTime: now,
          location: location || 'Office',
          notes,
          status: 'CHECKED_IN'
        },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return NextResponse.json({ attendance });
    } else if (action === 'clockOut') {
      // Find today's attendance record
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const attendance = await prisma.attendance.findFirst({
        where: {
          employeeId: currentUser.id,
          clockInTime: {
            gte: today,
            lt: tomorrow
          },
          clockOutTime: null
        }
      });

      if (!attendance) {
        return NextResponse.json(
          { error: 'No active clock-in found' },
          { status: 400 }
        );
      }

      // Calculate total hours
      const totalHours = (now.getTime() - attendance.clockInTime.getTime()) / (1000 * 60 * 60);

      const updatedAttendance = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          clockOutTime: now,
          totalHours: Math.round(totalHours * 100) / 100,
          status: 'CHECKED_OUT',
          notes: notes || attendance.notes
        },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return NextResponse.json({ attendance: updatedAttendance });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "clockIn" or "clockOut"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error managing attendance:', error);
    return NextResponse.json(
      { error: 'Failed to manage attendance' },
      { status: 500 }
    );
  }
}
