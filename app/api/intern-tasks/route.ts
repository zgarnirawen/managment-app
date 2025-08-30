import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createInternTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  deadline: z.string().transform((date) => new Date(date)).optional(),
  internId: z.string(),
  assignedBy: z.string(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  attachments: z.array(z.string()).default([]),
});

const updateInternTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['ASSIGNED', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  deadline: z.string().transform((date) => new Date(date)).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional(),
  feedback: z.string().optional(),
});

// GET /api/intern-tasks - List intern tasks
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const internId = url.searchParams.get('internId');
    const status = url.searchParams.get('status');
    const assignedBy = url.searchParams.get('assignedBy');

    let where: any = {};

    if (internId) {
      where.internId = internId;
    }

    if (status) {
      where.status = status;
    }

    if (assignedBy) {
      where.assignedBy = assignedBy;
    }

    const tasks = await prisma.internTask.findMany({
      where,
      include: {
        intern: {
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
        assigner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: [
        { deadline: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching intern tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/intern-tasks - Create new intern task
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createInternTaskSchema.parse(body);

    // Verify intern exists
    const intern = await prisma.employee.findUnique({
      where: { id: validatedData.internId },
      include: { internProfile: true }
    });

    if (!intern || !intern.internProfile) {
      return NextResponse.json({ error: 'Intern not found' }, { status: 404 });
    }

    // Create intern task
    const task = await prisma.internTask.create({
      data: validatedData,
      include: {
        intern: {
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
        assigner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    // TODO: Send real-time notification via Pusher
    // await sendTaskNotification(task);

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating intern task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/intern-tasks - Update intern task
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const validatedData = updateInternTaskSchema.parse(updateData);

    // Check if task exists
    const existingTask = await prisma.internTask.findUnique({
      where: { id }
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // If status is being changed to COMPLETED, set completedAt
    if (validatedData.status === 'COMPLETED' && existingTask.status !== 'COMPLETED') {
      (validatedData as any).completedAt = new Date();
    }

    // Update task
    const updatedTask = await prisma.internTask.update({
      where: { id },
      data: validatedData,
      include: {
        intern: {
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
        assigner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating intern task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/intern-tasks - Delete intern task
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const taskId = url.searchParams.get('id');

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    // Check if task exists
    const existingTask = await prisma.internTask.findUnique({
      where: { id: taskId }
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Delete task
    await prisma.internTask.delete({
      where: { id: taskId }
    });

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting intern task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
