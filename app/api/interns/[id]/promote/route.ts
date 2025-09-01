import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user and check permissions
    const currentUser = await prisma.employee.findUnique({
      where: { clerkUserId: userId },
      select: { role: true, id: true }
    });

    if (!currentUser || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id: internId } = await params;

    // Get the intern profile
    const internProfile = await prisma.internProfile.findUnique({
      where: { id: internId },
      include: {
        employee: true
      }
    });

    if (!internProfile) {
      return NextResponse.json({ error: 'Intern not found' }, { status: 404 });
    }

    // Note: Status check temporarily removed until schema is updated
    // if (internProfile.status !== 'ACTIVE') {
    //   return NextResponse.json({ error: 'Only active interns can be promoted' }, { status: 400 });
    // }

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update the employee role from INTERN to EMPLOYEE
      const updatedEmployee = await tx.employee.update({
        where: { id: internProfile.employeeId },
        data: {
          role: 'EMPLOYEE'
        }
      });

      // Update intern profile status to COMPLETED
      const updatedInternProfile = await tx.internProfile.update({
        where: { id: internId },
        data: {
          // status: 'COMPLETED', // Temporarily removed until schema is updated
          endDate: new Date()
        }
      });

      // Create a notification for the promoted intern
      await tx.notification.create({
        data: {
          employeeId: internProfile.employeeId,
          message: 'You have been successfully promoted from intern to full-time employee. Welcome to the team!',
          type: 'INTERN_UPDATE',
          read: false
        }
      });

      // Create a notification for the manager who promoted
      await tx.notification.create({
        data: {
          employeeId: currentUser.id,
          message: `Successfully promoted ${internProfile.employee.name} from intern to employee.`,
          type: 'INTERN_UPDATE',
          read: false
        }
      });

      return { updatedEmployee, updatedInternProfile };
    });

    return NextResponse.json({
      message: 'Intern promoted successfully',
      employee: result.updatedEmployee,
      internProfile: result.updatedInternProfile
    });

  } catch (error) {
    console.error('Error promoting intern:', error);
    return NextResponse.json(
      { error: 'Failed to promote intern' },
      { status: 500 }
    );
  }
}
