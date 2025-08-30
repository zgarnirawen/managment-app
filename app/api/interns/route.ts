import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createInternProfileSchema = z.object({
  employeeId: z.string(),
  mentorId: z.string().optional(),
  startDate: z.string().transform((date) => new Date(date)),
  endDate: z.string().transform((date) => new Date(date)).optional(),
  university: z.string().optional(),
  major: z.string().optional(),
  yearOfStudy: z.number().min(1).max(8).optional(),
  skills: z.array(z.string()).default([]),
  goals: z.string().optional(),
});

const updateInternProfileSchema = createInternProfileSchema.partial();

// GET /api/interns - List all interns or get specific intern profile
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const employeeId = url.searchParams.get('employeeId');

    if (employeeId) {
      // Get specific intern profile
      const internProfile = await prisma.internProfile.findUnique({
        where: { employeeId },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              department: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          },
          mentor: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      });

      if (!internProfile) {
        return NextResponse.json({ error: 'Intern profile not found' }, { status: 404 });
      }

      return NextResponse.json(internProfile);
    } else {
      // List all interns
      const interns = await prisma.internProfile.findMany({
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              department: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          },
          mentor: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
        orderBy: {
          startDate: 'desc'
        }
      });

      return NextResponse.json(interns);
    }
  } catch (error) {
    console.error('Error fetching interns:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/interns - Create new intern profile
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createInternProfileSchema.parse(body);

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: validatedData.employeeId }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Check if intern profile already exists
    const existingProfile = await prisma.internProfile.findUnique({
      where: { employeeId: validatedData.employeeId }
    });

    if (existingProfile) {
      return NextResponse.json({ error: 'Intern profile already exists' }, { status: 409 });
    }

    // Create intern profile
    const internProfile = await prisma.internProfile.create({
      data: {
        employeeId: validatedData.employeeId,
        mentorId: validatedData.mentorId,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        university: validatedData.university,
        major: validatedData.major,
        yearOfStudy: validatedData.yearOfStudy,
        skills: validatedData.skills,
        goals: validatedData.goals,
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            department: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json(internProfile, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating intern profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/interns - Update intern profile
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { employeeId, ...updateData } = body;
    const validatedData = updateInternProfileSchema.parse(updateData);

    // Check if intern profile exists
    const existingProfile = await prisma.internProfile.findUnique({
      where: { employeeId }
    });

    if (!existingProfile) {
      return NextResponse.json({ error: 'Intern profile not found' }, { status: 404 });
    }

    // Update intern profile
    const updatedProfile = await prisma.internProfile.update({
      where: { employeeId },
      data: validatedData,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            department: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating intern profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/interns - Delete intern profile
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const employeeId = url.searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    // Check if intern profile exists
    const existingProfile = await prisma.internProfile.findUnique({
      where: { employeeId }
    });

    if (!existingProfile) {
      return NextResponse.json({ error: 'Intern profile not found' }, { status: 404 });
    }

    // Delete intern profile
    await prisma.internProfile.delete({
      where: { employeeId }
    });

    return NextResponse.json({ message: 'Intern profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting intern profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
