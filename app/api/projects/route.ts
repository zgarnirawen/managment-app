import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../lib/prisma';
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'ON_HOLD']).default('PLANNED'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  departmentId: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  employeeIds: z.array(z.string()).optional(),
});

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const departmentId = searchParams.get('departmentId');

    // Build where clause based on filters
    const where: any = {};
    if (status) where.status = status;
    if (departmentId) where.departmentId = departmentId;

    const projects = await prisma.project.findMany({ 
      where,
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
        },
        members: {
          select: {
            id: true,
            userId: true,
            role: true,
            joinedAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error('GET /api/projects error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
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
    const validatedData = createProjectSchema.parse(data);
    
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
    
    // Prepare data for Prisma
    const projectData: any = {
      name: validatedData.name,
      description: validatedData.description,
      status: validatedData.status,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : new Date(),
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
      departmentId: validatedData.departmentId,
      attachments: validatedData.attachments || [],
    };

    // Handle employee relationships
    if (validatedData.employeeIds && validatedData.employeeIds.length > 0) {
      projectData.employees = { connect: validatedData.employeeIds.map(id => ({ id })) };
    }
    
    const project = await prisma.project.create({
      data: projectData,
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

    // Create notifications for team members
    if (validatedData.employeeIds && validatedData.employeeIds.length > 0) {
      try {
        const notifications = validatedData.employeeIds.map(employeeId => ({
          employeeId,
          message: `You have been added to project: "${project.name}"`,
          type: 'PROJECT_ASSIGNMENT' as const,
          metadata: {
            projectId: project.id
          }
        }));

        await prisma.notification.createMany({
          data: notifications
        });
      } catch (notificationError) {
        console.error('Failed to send project assignment notifications:', notificationError);
      }
    }
    
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('POST /api/projects error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.issues 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
