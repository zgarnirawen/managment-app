import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const timeEntry = await prisma.timeEntry.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    if (!timeEntry) {
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 });
    }
    
    return NextResponse.json(timeEntry);
  } catch (error) {
    console.error(`GET /api/time-entries/${id} error:`, error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const data = await request.json();
    const { type, timestamp, approved, approvedBy, notes } = data;
    
    // Check if time entry exists
    const existingEntry = await prisma.timeEntry.findUnique({
      where: { id },
    });
    
    if (!existingEntry) {
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 });
    }
    
    // Validate type if provided
    if (type) {
      const validTypes = ['CLOCK_IN', 'CLOCK_OUT', 'BREAK_START', 'BREAK_END'];
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { error: 'Invalid time entry type' },
          { status: 400 }
        );
      }
    }
    
    const updateData: any = {};
    if (type !== undefined) updateData.type = type;
    if (timestamp !== undefined) updateData.timestamp = new Date(timestamp);
    if (approved !== undefined) updateData.approved = approved;
    if (approvedBy !== undefined) updateData.approvedBy = approvedBy;
    if (notes !== undefined) updateData.notes = notes;
    
    const timeEntry = await prisma.timeEntry.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    return NextResponse.json(timeEntry);
  } catch (error) {
    console.error(`PUT /api/time-entries/${id} error:`, error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // Check if time entry exists
    const existingEntry = await prisma.timeEntry.findUnique({
      where: { id },
    });
    
    if (!existingEntry) {
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 });
    }
    
    await prisma.timeEntry.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/time-entries/${id} error:`, error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
