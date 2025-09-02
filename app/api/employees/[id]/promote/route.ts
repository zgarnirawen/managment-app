import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const resolvedParams = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { newRole, reason } = body;
    const employeeId = resolvedParams.id;

    // Get the promoter's role
    const promoter = await prisma.employee.findUnique({
      where: { clerkUserId: userId }
    });

    if (!promoter) {
      return NextResponse.json(
        { error: 'Promoter not found' },
        { status: 404 }
      );
    }

    // Define role hierarchy and permissions
    const roleHierarchy = {
      'intern': 'employee',
      'employee': 'manager',
      'manager': 'admin',
      'admin': 'super_admin'
    };

    const rolePermissions = {
      'manager': ['intern', 'employee'],
      'admin': ['intern', 'employee', 'manager'],
      'super_admin': ['intern', 'employee', 'manager', 'admin']
    };

    // Check if promoter has permission to promote
    const allowedPromotions = rolePermissions[promoter.role as keyof typeof rolePermissions];
    if (!allowedPromotions) {
      return NextResponse.json(
        { error: 'Insufficient permissions to promote employees' },
        { status: 403 }
      );
    }

    // Get the employee to be promoted
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Check if promoter can promote this employee's current role
    if (!allowedPromotions.includes(employee.role)) {
      return NextResponse.json(
        { error: `You cannot promote employees with role: ${employee.role}` },
        { status: 403 }
      );
    }

    // Validate the new role is the next logical step
    const expectedNextRole = roleHierarchy[employee.role as keyof typeof roleHierarchy];
    if (newRole !== expectedNextRole) {
      return NextResponse.json(
        { error: `Invalid promotion. ${employee.role} can only be promoted to ${expectedNextRole}` },
        { status: 400 }
      );
    }

    // Check if employee is already at the highest role
    if (!expectedNextRole) {
      return NextResponse.json(
        { error: 'Employee is already at the highest role' },
        { status: 400 }
      );
    }

    // Perform the promotion
    const updatedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        role: newRole,
        position: `${newRole.charAt(0).toUpperCase()}${newRole.slice(1)}`,
        updatedAt: new Date()
      }
    });

    // Update Clerk user metadata to reflect promotion
    // Note: In a real app, you'd use Clerk's backend API here
    // For now, we'll rely on the frontend to update this when the user logs in next

    // If promoted from intern to employee, they lose intern dashboard access
    const roleTransitions = {
      'intern_to_employee': {
        losesAccess: ['intern-dashboard', 'intern-tasks'],
        gainsAccess: ['employee-dashboard', 'calendar', 'email', 'projects']
      },
      'employee_to_manager': {
        losesAccess: [],
        gainsAccess: ['team-management', 'promotion-system', 'meetings', 'manager-dashboard']
      },
      'manager_to_admin': {
        losesAccess: [],
        gainsAccess: ['user-management', 'system-settings', 'admin-dashboard']
      },
      'admin_to_super_admin': {
        losesAccess: [],
        gainsAccess: ['full-admin-access', 'super-admin-dashboard']
      }
    };

    const transitionKey = `${employee.role}_to_${newRole}` as keyof typeof roleTransitions;
    const transition = roleTransitions[transitionKey];

    // Create notification for the promoted employee
    await prisma.notification.create({
      data: {
        type: 'PROMOTION',
        message: `🎉 Congratulations! You've been promoted from ${employee.role} to ${newRole} by ${promoter.name}. ${reason || 'Keep up the excellent work!'}`,
        employeeId: employeeId,
        read: false,
        metadata: {
          fromRole: employee.role,
          toRole: newRole,
          promotedBy: promoter.name,
          reason: reason
        },
        createdAt: new Date()
      }
    });

    // Create notification for the promoter
    await prisma.notification.create({
      data: {
        type: 'SYSTEM',
        message: `✅ Promotion Completed: You successfully promoted ${employee.name} from ${employee.role} to ${newRole}.`,
        employeeId: promoter.id,
        read: false,
        metadata: {
          promotedEmployee: employee.name,
          fromRole: employee.role,
          toRole: newRole
        },
        createdAt: new Date()
      }
    });

    // If promoting to admin or super_admin, notify other admins
    if (['admin', 'super_admin'].includes(newRole)) {
      const admins = await prisma.employee.findMany({
        where: {
          role: {
            in: ['admin', 'super_admin']
          },
          id: {
            not: promoter.id
          }
        }
      });

      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            type: 'SYSTEM',
            message: `🔔 New Admin Promotion: ${employee.name} has been promoted to ${newRole} by ${promoter.name}.`,
            employeeId: admin.id,
            read: false,
            metadata: {
              promotedEmployee: employee.name,
              promotedBy: promoter.name,
              newRole: newRole
            },
            createdAt: new Date()
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      employee: updatedEmployee,
      message: `Successfully promoted ${employee.name} to ${newRole}`
    });

  } catch (error) {
    console.error('Promotion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
