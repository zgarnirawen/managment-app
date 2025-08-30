import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
  senderId: z.string(),
  channelId: z.string(),
  channelType: z.enum(['INTERN_GENERAL', 'INTERN_DEPARTMENT', 'INTERN_PROJECT', 'INTERN_MENTOR', 'INTERN_HELP']).default('INTERN_GENERAL'),
  replyToId: z.string().optional(),
  attachments: z.array(z.string()).default([]),
});

const updateMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
});

// GET /api/intern-chat - Get chat messages
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const channelId = url.searchParams.get('channelId');
    const channelType = url.searchParams.get('channelType');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let where: any = {};

    if (channelId) {
      where.channelId = channelId;
    }

    if (channelType) {
      where.channelType = channelType;
    }

    const messages = await prisma.chatMessage.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            internProfile: {
              select: {
                university: true,
                major: true,
              }
            }
          }
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        replies: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    return NextResponse.json(messages.reverse()); // Reverse to show oldest first
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/intern-chat - Send new message
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = sendMessageSchema.parse(body);

    // Verify sender exists and is an intern
    const sender = await prisma.employee.findUnique({
      where: { id: validatedData.senderId },
      include: { internProfile: true }
    });

    if (!sender) {
      return NextResponse.json({ error: 'Sender not found' }, { status: 404 });
    }

    // If replying to a message, verify it exists
    if (validatedData.replyToId) {
      const replyToMessage = await prisma.chatMessage.findUnique({
        where: { id: validatedData.replyToId }
      });

      if (!replyToMessage) {
        return NextResponse.json({ error: 'Reply message not found' }, { status: 404 });
      }
    }

    // Create message
    const message = await prisma.chatMessage.create({
      data: validatedData,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            internProfile: {
              select: {
                university: true,
                major: true,
              }
            }
          }
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    });

    // TODO: Send real-time message via Pusher
    // await sendChatNotification(message);

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/intern-chat - Edit message
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    const validatedData = updateMessageSchema.parse(updateData);

    // Check if message exists
    const existingMessage = await prisma.chatMessage.findUnique({
      where: { id }
    });

    if (!existingMessage) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Update message
    const updatedMessage = await prisma.chatMessage.update({
      where: { id },
      data: {
        ...validatedData,
        isEdited: true,
        editedAt: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/intern-chat - Delete message
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const messageId = url.searchParams.get('id');

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    // Check if message exists
    const existingMessage = await prisma.chatMessage.findUnique({
      where: { id: messageId }
    });

    if (!existingMessage) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Delete message (this will also delete replies due to cascade)
    await prisma.chatMessage.delete({
      where: { id: messageId }
    });

    return NextResponse.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
