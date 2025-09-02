import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/prisma';
import { z } from 'zod';

const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').optional(),
  description: z.string().optional(),
  status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'ON_HOLD']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  departmentId: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  employeeIds: z.array(z.string()).optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: { 
        department: { select: { id: true, name: true } },
        employees: { select: { id: true, name: true, email: true, position: true } },
        tasks: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            dueDate: true,
            assignedTo: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        members: {
          select: {
            id: true,
            userId: true,
            role: true,
            joinedAt: true
          }
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('GET /api/projects/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
      include: { employees: { select: { id: true } } }
    });

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const data = await request.json();
    
    // Validate the incoming data
    const validatedData = updateProjectSchema.parse(data);
    
    // Check if department exists
    if (validatedData.departmentId) {
      const departmentExists = await prisma.department.findUnique({
        where: { id: validatedData.departmentId },
      });
      
      if (!departmentExists) {
        return NextResponse.json(
          { error: 'Department not found' },
          { status: 404 }
        );
      }
    }

    // Validate employees exist
    if (validatedData.employeeIds && validatedData.employeeIds.length > 0) {
      const existingEmployees = await prisma.employee.findMany({
        where: { id: { in: validatedData.employeeIds } }
      });
      
      if (existingEmployees.length !== validatedData.employeeIds.length) {
        return NextResponse.json(
          { error: 'One or more employees not found' },
          { status: 404 }
        );
      }
    }
    
    // Prepare update data
    const updateData: any = {};
    
    // Update basic fields
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.departmentId !== undefined) updateData.departmentId = validatedData.departmentId;
    if (validatedData.attachments !== undefined) updateData.attachments = validatedData.attachments;
    
    if (validatedData.startDate !== undefined) {
      updateData.startDate = new Date(validatedData.startDate);
    }
    if (validatedData.endDate !== undefined) {
      updateData.endDate = new Date(validatedData.endDate);
    }

    // Handle employee relationships
    if (validatedData.employeeIds !== undefined) {
      // First disconnect all existing employees
      updateData.employees = { set: [] };
      
      // Then connect the new employees
      if (validatedData.employeeIds.length > 0) {
        updateData.employees = { 
          set: validatedData.employeeIds.map(id => ({ id })) 
        };
      }
    }
    
    const updatedProject = await prisma.project.update({
      where: { id },
      data: updateData,
      include: { 
        department: { select: { id: true, name: true } },
        employees: { select: { id: true, name: true, email: true } },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            assignedTo: { select: { id: true, name: true } }
          }
        }
      },
    });

    // Send notifications for newly added employees
    if (validatedData.employeeIds) {
      const previousEmployeeIds = existingProject.employees.map(emp => emp.id);
      const newEmployeeIds = validatedData.employeeIds.filter(
        id => !previousEmployeeIds.includes(id)
      );

      if (newEmployeeIds.length > 0) {
        try {
          const notifications = newEmployeeIds.map(employeeId => ({
            employeeId,
            message: `You have been added to project: "${updatedProject.name}"`,
            type: 'PROJECT_ASSIGNMENT' as const,
            metadata: {
              projectId: updatedProject.id
            }
          }));

          await prisma.notification.createMany({
            data: notifications
          });
        } catch (notificationError) {
          console.error('Failed to send project assignment notifications:', notificationError);
        }
      }
    }
    
    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('PUT /api/projects/[id] error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.issues 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: { select: { id: true } },
        employees: { select: { id: true } }
      }
    });

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Optional: Prevent deletion if project has active tasks
    const activeTasks = await prisma.task.count({
      where: {
        projectId: id,
        status: { in: ['TODO', 'IN_PROGRESS'] }
      }
    });

    if (activeTasks > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete project with active tasks',
          details: `Project has ${activeTasks} active task(s). Please complete or reassign them first.`
        },
        { status: 400 }
      );
    }

    // Delete the project (this will cascade to related records due to Prisma schema)
    await prisma.project.delete({
      where: { id },
    });

    // Send notifications to project members
    if (existingProject.employees.length > 0) {
      try {
        const notifications = existingProject.employees.map(employee => ({
          employeeId: employee.id,
          message: `Project "${existingProject.name}" has been deleted`,
          type: 'SYSTEM' as const,
          metadata: {
            projectId: id,
            projectName: existingProject.name
          }
        }));

        await prisma.notification.createMany({
          data: notifications
        });
      } catch (notificationError) {
        console.error('Failed to send project deletion notifications:', notificationError);
      }
    }

    return NextResponse.json(
      { 
        message: 'Project deleted successfully',
        id 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/projects/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
