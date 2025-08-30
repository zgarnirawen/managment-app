import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { z } from 'zod';

const createMeetingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  location: z.string().optional(),
  type: z.enum(['GENERAL', 'ONE_ON_ONE', 'TEAM', 'ALL_HANDS', 'TRAINING']),
  organizerId: z.string().min(1, 'Organizer is required'),
  attendeeIds: z.array(z.string()).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    const where: any = {};
    if (employeeId) {
      where.OR = [
        { organizerId: employeeId },
        { attendees: { some: { id: employeeId } } }
      ];
    }

    const meetings = await (prisma as any).meeting.findMany({
      where,
      include: {
        organizer: { select: { id: true, name: true, email: true } },
        attendees: { select: { id: true, name: true, email: true } }
      },
      orderBy: { startDate: 'asc' }
    });

    return NextResponse.json(meetings);
  } catch (error) {
    console.error('GET /api/meetings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate the incoming data
    const validatedData = createMeetingSchema.parse(data);
    
    // Check if organizer exists
    const organizer = await prisma.employee.findUnique({
      where: { id: validatedData.organizerId }
    });
    
    if (!organizer) {
      return NextResponse.json(
        { error: 'Organizer not found' },
        { status: 404 }
      );
    }

    // Prepare attendees connection
    const attendeesConnection = validatedData.attendeeIds && validatedData.attendeeIds.length > 0
      ? { connect: validatedData.attendeeIds.map(id => ({ id })) }
      : undefined;

    const meeting = await (prisma as any).meeting.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        location: validatedData.location,
        type: validatedData.type,
        organizer: { connect: { id: validatedData.organizerId } },
        attendees: attendeesConnection
      },
      include: {
        organizer: { select: { id: true, name: true, email: true } },
        attendees: { select: { id: true, name: true, email: true } }
      }
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error('POST /api/meetings error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.issues 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create meeting' }, 
      { status: 500 }
    );
  }
}
