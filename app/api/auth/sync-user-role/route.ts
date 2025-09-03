import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetUserId, newRole } = await request.json();

    if (!targetUserId || !newRole) {
      return NextResponse.json({
        error: 'Missing required fields: targetUserId and newRole'
      }, { status: 400 });
    }

    // Validate role
    const validRoles = ['super_administrator', 'administrator', 'manager', 'employee', 'intern'];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json({
        error: 'Invalid role. Must be one of: ' + validRoles.join(', ')
      }, { status: 400 });
    }

    // Check if the requesting user has permission to change roles
    const requestingUser = await prisma.employee.findUnique({
      where: { clerkUserId: userId },
      select: { role: true }
    });

    if (!requestingUser) {
      return NextResponse.json({ error: 'Requesting user not found' }, { status: 404 });
    }

    // Only super admins and admins can change roles
    if (!['super_administrator', 'administrator'].includes(requestingUser.role.toLowerCase())) {
      return NextResponse.json({
        error: 'Insufficient permissions to change user roles'
      }, { status: 403 });
    }

    // Update user role in database
    const updatedEmployee = await prisma.employee.update({
      where: { clerkUserId: targetUserId },
      data: { role: newRole },
      select: { id: true, name: true, email: true, role: true }
    });

    // Update role in Clerk metadata
    const clerk = await clerkClient();
    await clerk.users.updateUser(targetUserId, {
      unsafeMetadata: {
        role: newRole,
        roleSetupComplete: true,
        dbSynced: true,
        lastRoleUpdate: new Date().toISOString()
      },
      publicMetadata: {
        role: newRole,
        roleSetupComplete: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'User role synchronized successfully',
      user: updatedEmployee
    });

  } catch (error) {
    console.error('Error syncing user role:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync user role',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's current role from database
    const employee = await prisma.employee.findUnique({
      where: { clerkUserId: userId },
      select: { role: true, name: true, email: true }
    });

    if (!employee) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    return NextResponse.json({
      role: employee.role,
      user: employee
    });

  } catch (error) {
    console.error('Error getting user role:', error);
    return NextResponse.json(
      {
        error: 'Failed to get user role',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
