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

    // Find active (ongoing) session
    const activeSession = await prisma.timeEntry.findFirst({
      where: {
        employeeId,
        endTime: null,
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    return NextResponse.json({
      activeSession: activeSession ? {
        id: activeSession.id,
        type: activeSession.type,
        startTime: activeSession.startTime,
        location: activeSession.location,
        isOnline: activeSession.isOnline,
      } : null,
    });

  } catch (error) {
    console.error('Error fetching active session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active session' },
      { status: 500 }
    );
  }
}
