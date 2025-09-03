// API for role promotion/demotion system
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { 
  updateUserRole, 
  canPerformAction, 
  getNextRole,
  ROLE_HIERARCHY,
  type UserRole 
} from '@/app/lib/roleManagement';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetUserId, action, newRole } = await request.json();

    // Get current user's role from database
    const currentEmployee = await prisma.employee.findUnique({
      where: { clerkUserId: user.id }
    });

    if (!currentEmployee) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get target user
    const targetEmployee = await prisma.employee.findUnique({
      where: { id: targetUserId }
    });

    if (!targetEmployee) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    const currentUserRole = currentEmployee.role as UserRole;
    const targetUserRole = targetEmployee.role as UserRole;

    // Handle different actions
    switch (action) {
      case 'promote':
        const promotionRole = newRole || getNextRole(targetUserRole, 'up');
        if (!promotionRole) {
          return NextResponse.json({ error: 'Cannot promote further' }, { status: 400 });
        }

        if (!canPerformAction(currentUserRole, targetUserRole, 'promote')) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        const promoteResult = await updateUserRole(targetUserId, promotionRole, currentEmployee.id);
        if (!promoteResult.success) {
          return NextResponse.json({ error: promoteResult.error }, { status: 500 });
        }

        return NextResponse.json({ 
          success: true, 
          message: `User promoted to ${promotionRole}`,
          newRole: promotionRole,
          dashboard: getDashboardForRole(promotionRole)
        });

      case 'demote':
        const demotionRole = newRole || getNextRole(targetUserRole, 'down');
        if (!demotionRole) {
          return NextResponse.json({ error: 'Cannot demote further' }, { status: 400 });
        }

        if (!canPerformAction(currentUserRole, targetUserRole, 'demote')) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        const demoteResult = await updateUserRole(targetUserId, demotionRole, currentEmployee.id);
        if (!demoteResult.success) {
          return NextResponse.json({ error: demoteResult.error }, { status: 500 });
        }

        return NextResponse.json({ 
          success: true, 
          message: `User demoted to ${demotionRole}`,
          newRole: demotionRole,
          dashboard: getDashboardForRole(demotionRole)
        });

      case 'transfer_super_admin':
        // Only Super Admin can transfer role
        if (currentUserRole !== 'Super Administrator') {
          return NextResponse.json({ error: 'Only Super Administrator can transfer role' }, { status: 403 });
        }

        // Demote current Super Admin to Administrator
        await updateUserRole(currentEmployee.id, 'Administrator', currentEmployee.id);
        
        // Promote target to Super Administrator
        const transferResult = await updateUserRole(targetUserId, 'Super Administrator', currentEmployee.id);
        
        if (!transferResult.success) {
          return NextResponse.json({ error: transferResult.error }, { status: 500 });
        }

        return NextResponse.json({ 
          success: true, 
          message: 'Super Administrator role transferred successfully',
          newRole: 'Super Administrator'
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Role management error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Helper function
function getDashboardForRole(role: UserRole): string {
  const roleKey = role.toLowerCase().replace(/\s+/g, '-');
  return `/dashboard/${roleKey}`;
}
