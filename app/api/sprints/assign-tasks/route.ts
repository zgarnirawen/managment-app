import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for task assignment
const assignTasksSchema = z.object({
  taskIds: z.array(z.string()),
  sprintId: z.string().nullable(),
});

// POST - Assign/unassign tasks to/from a sprint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = assignTasksSchema.parse(body);

    // Update tasks with the new sprint assignment using raw SQL
    await prisma.$queryRaw`
      UPDATE "Task" 
      SET "sprintId" = ${validatedData.sprintId}
      WHERE id = ANY(${validatedData.taskIds})
    `;

    // Fetch the updated tasks with related data
    const tasks = await prisma.task.findMany({
      where: {
        id: {
          in: validatedData.taskIds,
        },
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Get sprint info if assigned
    let sprintInfo = null;
    if (validatedData.sprintId) {
      const sprint = await prisma.$queryRaw`
        SELECT * FROM "Sprint" WHERE id = ${validatedData.sprintId}
      `;
      if (Array.isArray(sprint) && sprint.length > 0) {
        sprintInfo = sprint[0];
      }
    }

    return NextResponse.json({
      message: `Successfully ${validatedData.sprintId ? 'assigned' : 'unassigned'} ${validatedData.taskIds.length} task(s)`,
      tasks: tasks.map(task => ({
        ...task,
        sprint: sprintInfo
      })),
    });
  } catch (error) {
    console.error('Error assigning tasks to sprint:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to assign tasks to sprint' },
      { status: 500 }
    );
  }
}
