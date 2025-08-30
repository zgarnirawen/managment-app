import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { z } from 'zod';

const createSubTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  taskId: z.string().min(1, 'Task ID is required'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional().default('TODO'),
});

const updateSubTaskSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
});

// Type assertion to handle TypeScript not recognizing the SubTask model
const subTaskClient = (prisma as any).subTask;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (taskId) {
      // Get subtasks for a specific task
      const subtasks = await subTaskClient.findMany({
        where: { taskId },
        orderBy: { createdAt: 'asc' },
      });
      return NextResponse.json(subtasks);
    } else {
      // Get all subtasks
      const subtasks = await subTaskClient.findMany({
        include: {
          task: {
            select: { id: true, title: true }
          }
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(subtasks);
    }
  } catch (error) {
    console.error('GET /api/subtasks error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subtasks' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate the incoming data
    const validatedData = createSubTaskSchema.parse(data);
    
    // Check if task exists
    const taskExists = await prisma.task.findUnique({
      where: { id: validatedData.taskId },
    });
    
    if (!taskExists) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    const subtask = await subTaskClient.create({
      data: validatedData,
      include: {
        task: {
          select: { id: true, title: true }
        }
      }
    });
    
    return NextResponse.json(subtask, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('POST /api/subtasks error:', error);
    return NextResponse.json(
      { error: 'Failed to create subtask' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    // Validate the incoming data
    const validatedData = updateSubTaskSchema.parse(data);
    const { id, ...updateData } = validatedData;
    
    // Check if subtask exists
    const existingSubTask = await subTaskClient.findUnique({
      where: { id },
    });
    
    if (!existingSubTask) {
      return NextResponse.json(
        { error: 'Subtask not found' },
        { status: 404 }
      );
    }
    
    const subtask = await subTaskClient.update({
      where: { id },
      data: updateData,
      include: {
        task: {
          select: { id: true, title: true }
        }
      }
    });
    
    return NextResponse.json(subtask);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('PUT /api/subtasks error:', error);
    return NextResponse.json(
      { error: 'Failed to update subtask' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Subtask ID is required' },
        { status: 400 }
      );
    }
    
    // Check if subtask exists
    const existingSubTask = await subTaskClient.findUnique({
      where: { id },
    });
    
    if (!existingSubTask) {
      return NextResponse.json(
        { error: 'Subtask not found' },
        { status: 404 }
      );
    }
    
    await subTaskClient.delete({
      where: { id },
    });
    
    return NextResponse.json({ message: 'Subtask deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/subtasks error:', error);
    return NextResponse.json(
      { error: 'Failed to delete subtask' }, 
      { status: 500 }
    );
  }
}
