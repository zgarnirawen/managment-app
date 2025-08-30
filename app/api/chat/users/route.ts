import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentEmployee } from '../../../lib/auth-utils';

const prisma = new PrismaClient();

// GET /api/chat/users - Get users for DM (excluding current user)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    // Get current employee using proper Clerk user mapping
    const currentEmployee = await getCurrentEmployee();
    if (!currentEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Build query based on role permissions
    let whereClause: any = {
      id: { not: currentEmployee.id }, // Exclude current user
    };

    // Add search filter if provided
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Role-based filtering
    if (currentEmployee.role.name === 'employee') {
      // Employees can only chat with their team members and managers
      whereClause.OR = [
        ...(whereClause.OR || []),
        {
          AND: [
            { departmentId: currentEmployee.departmentId },
            {
              role: {
                name: { in: ['employee', 'manager'] }
              }
            }
          ]
        }
      ];
    } else if (currentEmployee.role.name === 'manager') {
      // Managers can chat with team members and other managers
      whereClause.OR = [
        ...(whereClause.OR || []),
        {
          departmentId: currentEmployee.departmentId
        },
        {
          role: {
            name: 'manager'
          }
        }
      ];
    }
    // Admins can chat with everyone (no additional restrictions)

    const users = await prisma.employee.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: { name: 'asc' },
      take: 50, // Limit results
    });

    // Get recent conversations for each user
    const usersWithLastMessage = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await prisma.directMessage.findFirst({
          where: {
            OR: [
              {
                AND: [
                  { senderId: currentEmployee.id },
                  { receiverId: user.id }
                ]
              },
              {
                AND: [
                  { senderId: user.id },
                  { receiverId: currentEmployee.id }
                ]
              }
            ]
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
          }
        });

        return {
          ...user,
          lastMessage,
          hasConversation: !!lastMessage,
        };
      })
    );

    // Sort by recent conversations first, then alphabetically
    const sortedUsers = usersWithLastMessage.sort((a, b) => {
      if (a.hasConversation && !b.hasConversation) return -1;
      if (!a.hasConversation && b.hasConversation) return 1;
      
      if (a.hasConversation && b.hasConversation) {
        return new Date(b.lastMessage!.createdAt).getTime() - new Date(a.lastMessage!.createdAt).getTime();
      }
      
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({ users: sortedUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
