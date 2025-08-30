import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { z } from 'zod';

const updateLeaveRequestSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED'])
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { 
        employee: { select: { id: true, name: true, email: true } }
      },
    });
    
    if (!leaveRequest) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(leaveRequest);
  } catch (error) {
    console.error('GET /api/leave-requests/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leave request' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    // Validate the incoming data
    const validatedData = updateLeaveRequestSchema.parse(data);
    
    // Check if leave request exists
    const existingLeaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { employee: true }
    });
    
    if (!existingLeaveRequest) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 }
      );
    }
    
    // Update the leave request
    const updatedLeaveRequest = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: validatedData.status,
        // You could add approval/rejection timestamp and approver info here
        ...(validatedData.status !== 'PENDING' && {
          reviewedAt: new Date()
        })
      },
      include: { 
        employee: { select: { id: true, name: true, email: true } }
      },
    });
    
    return NextResponse.json(updatedLeaveRequest);
  } catch (error) {
    console.error('PATCH /api/leave-requests/[id] error:', error);
    
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
      { error: 'Failed to update leave request' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Check if leave request exists
    const existingLeaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
    });
    
    if (!existingLeaveRequest) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 }
      );
    }
    
    // Only allow deletion of pending requests
    if (existingLeaveRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cannot delete approved or rejected leave requests' },
        { status: 409 }
      );
    }
    
    await prisma.leaveRequest.delete({
      where: { id },
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Leave request deleted successfully' 
    });
  } catch (error) {
    console.error('DELETE /api/leave-requests/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete leave request' },
      { status: 500 }
    );
  }
}
