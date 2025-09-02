import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../lib/prisma';
import { z } from 'zod';

const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required'),
  taskId: z.string().optional(),
  projectId: z.string().optional(),
  mentions: z.array(z.string()).optional().default([]),
});

const getCommentsSchema = z.object({
  taskId: z.string().optional(),
  projectId: z.string().optional(),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 50),
  offset: z.string().optional().transform(val => val ? parseInt(val) : 0),
});

// GET /api/comments - Fetch comments for a task or project
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams);
    
    const { taskId, projectId, limit, offset } = getCommentsSchema.parse(params);
    
    // Get employee
    const employee = await prisma.employee.findUnique({
      where: { clerkUserId: userId }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee profile required' }, { status: 403 });
    }

    if (!taskId && !projectId) {
      return NextResponse.json({ error: 'Task ID or Project ID required' }, { status: 400 });
    }

    // Check access to entity
    let hasAccess = false;

    if (taskId) {
      const task = await prisma.task.findFirst({
        where: {
          id: taskId,
          OR: [
            { employeeId: employee.id },
            { project: { employees: { some: { id: employee.id } } } }
          ]
        }
      });
      hasAccess = !!task;
    }

    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          employees: { some: { id: employee.id } }
        }
      });
      hasAccess = !!project;
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const where: any = {};
    if (taskId) where.taskId = taskId;
    if (projectId) where.projectId = projectId;

    const comments = await prisma.comment.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('GET /api/comments error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.issues 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// POST /api/comments - Create a new comment
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { content, taskId, projectId, mentions } = createCommentSchema.parse(data);
    
    // Get employee
    const employee = await prisma.employee.findUnique({
      where: { clerkUserId: userId }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee profile required' }, { status: 403 });
    }

    if (!taskId && !projectId) {
      return NextResponse.json({ error: 'Task ID or Project ID required' }, { status: 400 });
    }

    // Check access to entity
    let hasAccess = false;

    if (taskId) {
      const task = await prisma.task.findFirst({
        where: {
          id: taskId,
          OR: [
            { employeeId: employee.id },
            { project: { employees: { some: { id: employee.id } } } }
          ]
        }
      });
      hasAccess = !!task;
    }

    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          employees: { some: { id: employee.id } }
        }
      });
      hasAccess = !!project;
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create comment
    const commentData: any = {
      content,
      authorId: employee.id
    };

    if (taskId) commentData.taskId = taskId;
    if (projectId) commentData.projectId = projectId;

    const comment = await prisma.comment.create({
      data: commentData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Handle mentions and create notifications
    if (mentions && mentions.length > 0) {
      try {
        const mentionedEmployees = await prisma.employee.findMany({
          where: { id: { in: mentions } }
        });

        const notifications = mentionedEmployees
          .filter(emp => emp.clerkUserId && emp.clerkUserId !== userId)
          .map(emp => ({
            employeeId: emp.id,
            message: `${employee.name} mentioned you in a comment`,
            type: 'COMMENT_MENTION' as const,
            metadata: {
              commentId: comment.id,
              taskId,
              projectId
            }
          }));

        if (notifications.length > 0) {
          await prisma.notification.createMany({
            data: notifications
          });
        }
      } catch (notificationError) {
        console.error('Failed to send mention notifications:', notificationError);
      }
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('POST /api/comments error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.issues 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
