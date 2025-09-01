import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ROLE-BASED PROMOTION SYSTEM
// Implements the exact hierarchy: Intern → Employee → Manager → Admin → Super Admin

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const currentUserData = await currentUser();

    if (!userId || !currentUserData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetUserId, action, newRole } = await request.json();

    // Get current user's role
    const currentUserRole = currentUserData.publicMetadata?.role as string || 'INTERN';
    
    // Get target user's current role
    const targetUser = await prisma.employee.findFirst({
      where: { clerkUserId: targetUserId }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    const targetCurrentRole = targetUser.role;

    // PERMISSION VALIDATION RULES
    if (!canPerformAction(currentUserRole, targetCurrentRole, action, newRole)) {
      return NextResponse.json({ error: 'Insufficient permissions for this action' }, { status: 403 });
    }

    // PROMOTION/DEMOTION LOGIC
    if (action === 'promote') {
      const promotedRole = getNextRole(targetCurrentRole);
      if (!promotedRole) {
        return NextResponse.json({ error: 'Cannot promote further' }, { status: 400 });
      }

      // Update in database
      await prisma.employee.update({
        where: { clerkUserId: targetUserId },
        data: { role: promotedRole }
      });

      // Update Clerk metadata
      const clerkResponse = await fetch(`https://api.clerk.dev/v1/users/${targetUserId}/metadata`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_metadata: {
            role: promotedRole
          }
        }),
      });

      if (!clerkResponse.ok) {
        throw new Error('Failed to update Clerk metadata');
      }

      return NextResponse.json({ 
        success: true, 
        message: `User promoted from ${targetCurrentRole} to ${promotedRole}`,
        newRole: promotedRole
      });

    } else if (action === 'demote') {
      const demotedRole = getPreviousRole(targetCurrentRole);
      if (!demotedRole) {
        return NextResponse.json({ error: 'Cannot demote further' }, { status: 400 });
      }

      // Update in database
      await prisma.employee.update({
        where: { clerkUserId: targetUserId },
        data: { role: demotedRole }
      });

      // Update Clerk metadata
      const clerkResponse = await fetch(`https://api.clerk.dev/v1/users/${targetUserId}/metadata`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_metadata: {
            role: demotedRole
          }
        }),
      });

      if (!clerkResponse.ok) {
        throw new Error('Failed to update Clerk metadata');
      }

      return NextResponse.json({ 
        success: true, 
        message: `User demoted from ${targetCurrentRole} to ${demotedRole}`,
        newRole: demotedRole
      });

    } else if (action === 'transfer_super_admin') {
      // Special case: Super Admin transferring role to an Admin
      if (currentUserRole !== 'SUPER_ADMIN' || targetCurrentRole !== 'ADMIN') {
        return NextResponse.json({ error: 'Super Admin can only transfer role to an Admin' }, { status: 403 });
      }

      // Transfer: Current Super Admin becomes Admin, Target Admin becomes Super Admin
      await prisma.employee.update({
        where: { clerkUserId: userId },
        data: { role: 'ADMIN' }
      });

      await prisma.employee.update({
        where: { clerkUserId: targetUserId },
        data: { role: 'SUPER_ADMIN' }
      });

      // Update Clerk metadata for both users
      await Promise.all([
        fetch(`https://api.clerk.dev/v1/users/${userId}/metadata`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ public_metadata: { role: 'ADMIN' } }),
        }),
        fetch(`https://api.clerk.dev/v1/users/${targetUserId}/metadata`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ public_metadata: { role: 'SUPER_ADMIN' } }),
        })
      ]);

      return NextResponse.json({ 
        success: true, 
        message: 'Super Admin role transferred successfully',
        newRole: 'SUPER_ADMIN'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Role management error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PERMISSION VALIDATION - Who can promote/demote whom
function canPerformAction(currentRole: string, targetRole: string, action: string, newRole?: string): boolean {
  switch (currentRole) {
    case 'SUPER_ADMIN':
      // Super Admin can assign ALL roles and promote to ALL roles
      if (action === 'transfer_super_admin') {
        return targetRole === 'ADMIN';
      }
      // Super Admin has unlimited promotion/demotion powers for all roles
      return true;
      
    case 'ADMIN':
      // Admin can ONLY promote: INTERN → EMPLOYEE and EMPLOYEE → MANAGER
      if (action === 'promote') {
        return (targetRole === 'INTERN') || (targetRole === 'EMPLOYEE');
      }
      if (action === 'demote') {
        return (targetRole === 'EMPLOYEE') || (targetRole === 'MANAGER');
      }
      // Admin cannot access Super Admin level actions
      return !['SUPER_ADMIN'].includes(targetRole);
      
    case 'MANAGER':
      // Managers can: manage teams, projects, assign tasks, and promote INTERN → EMPLOYEE only
      if (action === 'promote') {
        return targetRole === 'INTERN'; // Can only promote interns to employees
      }
      if (action === 'demote') {
        return targetRole === 'EMPLOYEE'; // Can demote employees back to interns
      }
      // Managers can manage team members (employees and interns)
      if (action === 'manage_team' || action === 'assign_project' || action === 'assign_task') {
        return ['INTERN', 'EMPLOYEE'].includes(targetRole);
      }
      return false;
      
    default:
      // EMPLOYEE and INTERN have no promotion permissions
      return false;
  }
}

// ROLE HIERARCHY FUNCTIONS
function getNextRole(currentRole: string): string | null {
  const hierarchy = ['INTERN', 'EMPLOYEE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'];
  const currentIndex = hierarchy.indexOf(currentRole);
  
  if (currentIndex === -1 || currentIndex === hierarchy.length - 1) {
    return null; // Invalid role or already at highest level
  }
  
  return hierarchy[currentIndex + 1];
}

function getPreviousRole(currentRole: string): string | null {
  const hierarchy = ['INTERN', 'EMPLOYEE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'];
  const currentIndex = hierarchy.indexOf(currentRole);
  
  if (currentIndex === -1 || currentIndex === 0) {
    return null; // Invalid role or already at lowest level
  }
  
  // Super Admin cannot be demoted (only transferred)
  if (currentRole === 'SUPER_ADMIN') {
    return null;
  }
  
  return hierarchy[currentIndex - 1];
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all users with their roles for management interface
    const users = await prisma.employee.findMany({
      select: {
        id: true,
        clerkUserId: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json({ users });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
