import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function PUT(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if notification exists
    const existingNotification = await prisma.notification.findUnique({
      where: { id }
    });    if (!existingNotification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Mark as read
    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('PUT /api/notifications/[id]/read error:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
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
    
    // Check if notification exists
    const existingNotification = await prisma.notification.findUnique({
      where: { id }
    });
    
    if (!existingNotification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/notifications/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
