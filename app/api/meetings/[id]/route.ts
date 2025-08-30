import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { z } from 'zod';

const updateMeetingSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  startDate: z.string().datetime('Invalid start date').optional(),
  endDate: z.string().datetime('Invalid end date').optional(),
  location: z.string().optional(),
  type: z.enum(['GENERAL', 'ONE_ON_ONE', 'TEAM', 'ALL_HANDS', 'TRAINING']).optional(),
  organizerId: z.string().min(1, 'Organizer is required').optional(),
  attendeeIds: z.array(z.string()).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const meeting = await (prisma as any).meeting.findUnique({
      where: { id },
      include: {
        organizer: { select: { id: true, name: true, email: true } },
        attendees: { select: { id: true, name: true, email: true } }
      }
    });

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(meeting);
  } catch (error) {
    console.error('GET /api/meetings/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meeting' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await request.json();
    const { id } = await params;
    
    // Validate the incoming data
    const validatedData = updateMeetingSchema.parse(data);
    
    // Check if meeting exists
    const existingMeeting = await (prisma as any).meeting.findUnique({
      where: { id }
    });
    
    if (!existingMeeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    // Prepare the update data
    const updateData: any = {};
    
    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.startDate !== undefined) updateData.startDate = new Date(validatedData.startDate);
    if (validatedData.endDate !== undefined) updateData.endDate = new Date(validatedData.endDate);
    if (validatedData.location !== undefined) updateData.location = validatedData.location;
    if (validatedData.type !== undefined) updateData.type = validatedData.type;
    
    if (validatedData.organizerId !== undefined) {
      updateData.organizer = { connect: { id: validatedData.organizerId } };
    }
    
    if (validatedData.attendeeIds !== undefined) {
      // First disconnect all existing attendees, then connect the new ones
      updateData.attendees = {
        set: validatedData.attendeeIds.map(id => ({ id }))
      };
    }

    const meeting = await (prisma as any).meeting.update({
      where: { id },
      data: updateData,
      include: {
        organizer: { select: { id: true, name: true, email: true } },
        attendees: { select: { id: true, name: true, email: true } }
      }
    });

    return NextResponse.json(meeting);
  } catch (error) {
    console.error('PUT /api/meetings/[id] error:', error);
    
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
      { error: 'Failed to update meeting' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if meeting exists
    const existingMeeting = await (prisma as any).meeting.findUnique({
      where: { id }
    });
    
    if (!existingMeeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    await (prisma as any).meeting.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/meetings/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete meeting' }, 
      { status: 500 }
    );
  }
}
