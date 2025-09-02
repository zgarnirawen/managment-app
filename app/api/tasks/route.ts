import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../lib/prisma';
import { createTaskSchema } from '../../lib/validations';
import { ZodError } from 'zod';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sprintId = searchParams.get('sprintId');
    const employeeId = searchParams.get('employeeId');
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');

    // Build where clause based on filters
    const where: any = {};
    if (sprintId) where.sprintId = sprintId;
    if (employeeId) where.employeeId = employeeId;
    if (priority) where.priority = priority;
    if (status) where.status = status;

    const tasks = await prisma.task.findMany({ 
      where,
      include: { 
        assignedTo: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        sprint: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate the incoming data
    const validatedData = createTaskSchema.parse(data);
    
    // Check if employee exists
    if (validatedData.employeeId) {
      const employeeExists = await prisma.employee.findUnique({
        where: { id: validatedData.employeeId },
      });
      
      if (!employeeExists) {
        return NextResponse.json(
          { error: 'Assigned employee not found' },
          { status: 404 }
        );
      }
    }
    
    // Check if project exists
    if (validatedData.projectId) {
      const projectExists = await prisma.project.findUnique({
        where: { id: validatedData.projectId },
      });
      
      if (!projectExists) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
    }
    
    // Prepare data for Prisma, converting empty strings to undefined
    const taskData = {
      ...validatedData,
      employeeId: validatedData.employeeId || undefined,
      projectId: validatedData.projectId || undefined,
      sprintId: validatedData.sprintId || undefined,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
      deadline: validatedData.deadline ? new Date(validatedData.deadline) : undefined,
    };
    
    const task = await prisma.task.create({
      data: taskData as any,
      include: { 
        assignedTo: { select: { name: true, email: true } },
        project: { select: { name: true } }
      },
    });

    // Create notification if task is assigned to an employee
    if (validatedData.employeeId) {
      try {
        await prisma.notification.create({
          data: {
            employeeId: validatedData.employeeId,
            message: `You have been assigned a new task: "${task.title}"`,
            type: 'TASK_ASSIGNED',
            metadata: {
              taskId: task.id
            }
          }
        });
      } catch (notificationError) {
        console.error('Failed to send task assignment notification:', notificationError);
        // Don't fail the task creation if notification fails
      }
    }
    
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.issues 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create task' }, 
      { status: 500 }
    );
  }
}
