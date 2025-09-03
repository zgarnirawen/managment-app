import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetUserId, newRole, reason } = await request.json();
    
    // Get current user's role to check permissions
    const clerk = await clerkClient();
    const currentUser = await clerk.users.getUser(userId);
    const currentUserRole = currentUser.unsafeMetadata?.role as string;

    // Role promotion/demotion permissions
    const roleHierarchy = ['intern', 'employee', 'manager', 'admin', 'super_admin'];
    const currentUserLevel = roleHierarchy.indexOf(currentUserRole);
    const newRoleLevel = roleHierarchy.indexOf(newRole);

    // Permission check: only admins+ can change roles, and only to roles equal or below their level
    if (!['admin', 'super_admin'].includes(currentUserRole)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions. Only administrators can change user roles.' 
      }, { status: 403 });
    }

    // Super admin check: only super admin can create other admins or super admins
    if (newRole === 'super_admin' && currentUserRole !== 'super_admin') {
      return NextResponse.json({ 
        error: 'Only Super Administrators can assign Super Admin role.' 
      }, { status: 403 });
    }

    if (newRole === 'admin' && currentUserRole !== 'super_admin') {
      return NextResponse.json({ 
        error: 'Only Super Administrators can assign Admin role.' 
      }, { status: 403 });
    }

    // Get target user
    const targetUser = await clerk.users.getUser(targetUserId);
    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    const oldRole = targetUser.unsafeMetadata?.role as string;

    // Prevent demoting the last super admin
    if (oldRole === 'super_admin' && newRole !== 'super_admin') {
      const superAdminCount = await prisma.employee.count({
        where: { role: 'super_admin' }
      });
      
      if (superAdminCount <= 1) {
        return NextResponse.json({ 
          error: 'Cannot demote the last Super Administrator. Promote another user to Super Admin first.' 
        }, { status: 400 });
      }
    }

    // Update user role in Clerk
    await clerk.users.updateUser(targetUserId, {
      unsafeMetadata: {
        ...targetUser.unsafeMetadata,
        role: newRole,
        lastRoleChange: new Date().toISOString(),
        roleChangedBy: userId,
        roleChangeReason: reason || 'Role update'
      }
    });

    // Update employee record in database
    const updatedEmployee = await prisma.employee.update({
      where: { clerkUserId: targetUserId },
      data: {
        role: newRole,
        position: newRole === 'intern' ? 'Intern' :
                 newRole === 'employee' ? 'Employee' :
                 newRole === 'manager' ? 'Manager' :
                 newRole === 'admin' ? 'Administrator' :
                 newRole === 'super_admin' ? 'Super Administrator' : 'Employee'
      }
    });

    // Log the role change for audit purposes
    await prisma.auditLog.create({
      data: {
        userId: userId,
        userName: currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : 'Admin',
        userRole: currentUserRole,
        action: 'ROLE_CHANGE',
        resource: 'EMPLOYEE',
        resourceId: updatedEmployee.id.toString(),
        details: JSON.stringify({
          oldRole,
          newRole,
          reason: reason || 'Role update',
          targetUser: targetUserId,
          targetUserEmail: targetUser.primaryEmailAddress?.emailAddress
        }),
        ipAddress: 'unknown',
        userAgent: 'API'
      }
    }).catch(error => {
      // Log creation might fail if auditLog table doesn't exist, but role change should still succeed
      console.warn('Failed to create audit log:', error);
    });

    console.log(`✅ Role changed: ${oldRole} → ${newRole} for user ${targetUserId}`);

    return NextResponse.json({ 
      success: true,
      oldRole,
      newRole,
      message: `User role successfully changed from ${oldRole} to ${newRole}`,
      employee: updatedEmployee
    });

  } catch (error) {
    console.error('❌ Role change failed:', error);
    return NextResponse.json(
      { error: 'Role change failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
