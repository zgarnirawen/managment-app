import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import Pusher from 'pusher';
import { getCurrentEmployee } from '../../../lib/auth-utils';

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
const createChannelSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  type: z.enum(['GENERAL', 'TEAM', 'DEPARTMENT', 'PROJECT', 'INTERN', 'ANNOUNCEMENT']).default('GENERAL'),
  isPrivate: z.boolean().default(false),
  departmentId: z.string().optional(),
  memberIds: z.array(z.string()).default([]),
});

const updateChannelSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().optional(),
});

// GET /api/chat/channels - List user's channels
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to find employee by Clerk user ID, fallback to hardcoded ID
    let employee: any = null;
    try {
      const result = await prisma.$queryRaw`
        SELECT * FROM "Employee" WHERE clerk_user_id = ${userId} LIMIT 1
      `;
      employee = (result as any)?.[0];
    } catch (error) {
      console.log('Clerk user lookup failed, using fallback');
    }

    // Fallback to hardcoded employee for development
    if (!employee) {
      employee = await prisma.employee.findUnique({
        where: { id: "cmewvkbao0002mhcgxshbkghx" }
      });
    }

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Get user's role for permission checking (using role string directly)
    const userRole = employee.role;

    // Build channel query based on role permissions
    let channelQuery: any = {
      OR: [
        // Channels where user is a member
        {
          members: {
            some: {
              employeeId: employee.id
            }
          }
        },
        // Public general channels
        {
          AND: [
            { isPrivate: false },
            { type: 'GENERAL' }
          ]
        }
      ]
    };

    // Admins can see all channels except private DMs
    if (userRole === 'Admin') {
      channelQuery = {
        NOT: {
          AND: [
            { isPrivate: true },
            { type: 'GENERAL' }
          ]
        }
      };
    }
    // Managers can see team and department channels
    else if (userRole === 'Manager') {
      channelQuery.OR.push(
        {
          AND: [
            { departmentId: employee.departmentId },
            { type: { in: ['TEAM', 'DEPARTMENT'] } }
          ]
        }
      );
    }

    const channels = await prisma.chatChannel.findMany({
      where: channelQuery,
      include: {
        members: {
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        department: {
          select: {
            id: true,
            name: true,
          }
        },
        _count: {
          select: {
            messages: true,
            members: true,
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json({ channels });
  } catch (error) {
    console.error('Error fetching channels:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/chat/channels - Create new channel
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createChannelSchema.parse(body);

    // Get current employee using proper Clerk user mapping
    const employee = await getCurrentEmployee();
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Check permissions for channel creation
    const userRole = employee.role;
    if (validatedData.type === 'ANNOUNCEMENT' && !['Admin', 'Manager'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Create channel
    const channel = await prisma.chatChannel.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        type: validatedData.type,
        isPrivate: validatedData.isPrivate,
        departmentId: validatedData.departmentId,
        createdBy: employee.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        department: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    // Add creator as admin member
    await prisma.chatChannelMember.create({
      data: {
        channelId: channel.id,
        employeeId: employee.id,
        role: 'ADMIN',
      }
    });

    // Add other members if specified
    if (validatedData.memberIds.length > 0) {
      await prisma.chatChannelMember.createMany({
        data: validatedData.memberIds.map(memberId => ({
          channelId: channel.id,
          employeeId: memberId,
          role: 'MEMBER',
        }))
      });
    }

    // Trigger real-time update
    await pusher.trigger('chat-channels', 'channel-created', {
      channel,
      creatorId: employee.id,
    });

    return NextResponse.json({ channel }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating channel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
