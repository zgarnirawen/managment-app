import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID required' }, { status: 400 });
    }

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all time entries for today
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        employeeId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        endTime: {
          not: null,
        },
      },
    });

    // Calculate totals
    let totalWork = 0;
    let totalBreak = 0;

    timeEntries.forEach(entry => {
      if (entry.endTime && entry.duration) {
        if (entry.type === 'CLOCK_IN' || entry.type === 'CLOCK_OUT') {
          totalWork += entry.duration;
        } else if (entry.type === 'BREAK_START' || entry.type === 'BREAK_END') {
          totalBreak += entry.duration;
        }
      }
    });

    return NextResponse.json({
      totalWork,
      totalBreak,
      entries: timeEntries,
    });

  } catch (error) {
    console.error('Error fetching today data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch today data' },
      { status: 500 }
    );
  }
}
