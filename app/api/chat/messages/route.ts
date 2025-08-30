import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import Pusher from 'pusher';

const prisma = new PrismaClient();

// Initialize Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// Validation schemas
const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  channelId: z.string().optional(),
  receiverId: z.string().optional(),
  parentId: z.string().optional(), // For replies
  type: z.enum(['TEXT', 'FILE', 'IMAGE']).default('TEXT'),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
});

const getMessagesSchema = z.object({
  channelId: z.string().optional(),
  receiverId: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  cursor: z.string().optional(), // For pagination
});

// GET /api/chat/messages - Get messages for channel or DM
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const validatedParams = getMessagesSchema.parse({
      channelId: searchParams.get('channelId'),
      receiverId: searchParams.get('receiverId'),
      limit: searchParams.get('limit'),
      cursor: searchParams.get('cursor'),
    });

    // Get user's employee record
    const employee = await prisma.employee.findFirst({
      where: {
        OR: [
          { email: userId },
          { id: userId }
        ]
      },
      select: { id: true, name: true, role: true }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    let messages: any[] = [];

    if (validatedParams.channelId) {
      // Channel messages
      const channel = await prisma.chatChannel.findUnique({
        where: { id: validatedParams.channelId },
        include: {
          members: {
            where: { employeeId: employee.id }
          }
        }
      });

      if (!channel) {
        return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
      }

      // Check if user has access to this channel
      const isMember = channel.members.length > 0;
      const isAdmin = employee.role === 'Admin';
      const canAccess = isMember || (!channel.isPrivate && channel.type === 'GENERAL') || isAdmin;      if (!canAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      messages = await prisma.chatChannelMessage.findMany({
        where: {
          channelId: validatedParams.channelId,
          ...(validatedParams.cursor && {
            id: { lt: validatedParams.cursor }
          })
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          reactions: {
            include: {
              employee: {
                select: {
                  id: true,
                  name: true,
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
            take: 3,
            orderBy: { createdAt: 'asc' }
          },
          _count: {
            select: {
              replies: true,
              reactions: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: validatedParams.limit,
      });
    } else if (validatedParams.receiverId) {
      // Direct messages
      messages = await prisma.directMessage.findMany({
        where: {
          OR: [
            {
              AND: [
                { senderId: employee.id },
                { receiverId: validatedParams.receiverId }
              ]
            },
            {
              AND: [
                { senderId: validatedParams.receiverId },
                { receiverId: employee.id }
              ]
            }
          ],
          ...(validatedParams.cursor && {
            id: { lt: validatedParams.cursor }
          })
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          reactions: {
            include: {
              employee: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: validatedParams.limit,
      });
    } else {
      return NextResponse.json({ error: 'Either channelId or receiverId is required' }, { status: 400 });
    }

    return NextResponse.json({ 
      messages: messages.reverse(), // Reverse to show oldest first
      hasMore: messages.length === validatedParams.limit 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/chat/messages - Send message
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = sendMessageSchema.parse(body);

    // Get user's employee record
    const employee = await prisma.employee.findFirst({
      where: { 
        OR: [
          { email: userId },
          { id: userId }
        ]
      },
      select: { id: true, name: true, role: true }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    let message: any;
    let pusherChannel: string;
    let pusherEvent: string;

    if (validatedData.channelId) {
      // Channel message
      const channel = await prisma.chatChannel.findUnique({
        where: { id: validatedData.channelId },
        include: {
          members: {
            where: { employeeId: employee.id }
          }
        }
      });

      if (!channel) {
        return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
      }

      // Check if user can send messages to this channel
      const isMember = channel.members.length > 0;
      const isAdmin = employee.role === 'Admin';
      const canSend = isMember || (!channel.isPrivate && channel.type === 'GENERAL') || isAdmin;

      if (!canSend) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      message = await prisma.chatChannelMessage.create({
        data: {
          content: validatedData.content,
          messageType: validatedData.type,
          attachments: validatedData.fileUrl ? [validatedData.fileUrl] : [],
          channelId: validatedData.channelId,
          senderId: employee.id,
          replyToId: validatedData.parentId,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
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

      // Update channel's last activity
      await prisma.chatChannel.update({
        where: { id: validatedData.channelId },
        data: { updatedAt: new Date() }
      });

      pusherChannel = `channel-${validatedData.channelId}`;
      pusherEvent = 'new-message';
    } else if (validatedData.receiverId) {
      // Direct message
      message = await prisma.directMessage.create({
        data: {
          content: validatedData.content,
          messageType: validatedData.type,
          attachments: validatedData.fileUrl ? [validatedData.fileUrl] : [],
          senderId: employee.id,
          receiverId: validatedData.receiverId,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      });

      // Trigger for both sender and receiver
      const dmChannelSender = `dm-${employee.id}`;
      const dmChannelReceiver = `dm-${validatedData.receiverId}`;
      
      await Promise.all([
        pusher.trigger(dmChannelSender, 'new-dm', message),
        pusher.trigger(dmChannelReceiver, 'new-dm', message),
      ]);

      return NextResponse.json({ message }, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Either channelId or receiverId is required' }, { status: 400 });
    }

    // Trigger real-time update for channel messages
    if (pusherChannel && pusherEvent) {
      await pusher.trigger(pusherChannel, pusherEvent, message);
    }

    return NextResponse.json({ message }, { status: 201 });
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
