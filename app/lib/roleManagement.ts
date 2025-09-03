// Role Management System - Comprehensive Implementation
import { PrismaClient } from '@prisma/client';
import { clerkClient } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// Role hierarchy definition
export const ROLE_HIERARCHY = {
  'Super Administrator': 4,
  'Administrator': 3,
  'Manager': 2,
  'Employee': 1,
  'Intern': 0
} as const;

export type UserRole = keyof typeof ROLE_HIERARCHY;

export const ROLE_PERMISSIONS = {
  'Super Administrator': {
    canPromote: ['Administrator', 'Manager', 'Employee', 'Intern'] as UserRole[],
    canDemote: ['Administrator', 'Manager', 'Employee', 'Intern'] as UserRole[],
    canResign: true,
    canTransferRole: true,
    dashboard: '/dashboard/super-admin'
  },
  'Administrator': {
    canPromote: ['Manager', 'Employee', 'Intern'] as UserRole[],
    canDemote: ['Manager', 'Employee', 'Intern'] as UserRole[],
    canResign: false,
    canTransferRole: false,
    dashboard: '/dashboard/admin'
  },
  'Manager': {
    canPromote: ['Employee'] as UserRole[], // Can promote Interns to Employees
    canDemote: ['Intern'] as UserRole[],
    canResign: false,
    canTransferRole: false,
    dashboard: '/dashboard/manager'
  },
  'Employee': {
    canPromote: [] as UserRole[],
    canDemote: [] as UserRole[],
    canResign: false,
    canTransferRole: false,
    dashboard: '/dashboard/employee'
  },
  'Intern': {
    canPromote: [] as UserRole[],
    canDemote: [] as UserRole[],
    canResign: false,
    canTransferRole: false,
    dashboard: '/dashboard/intern'
  }
} as const;

// Check if user can perform action on target user
export function canPerformAction(
  userRole: UserRole, 
  targetRole: UserRole, 
  action: 'promote' | 'demote'
): boolean {
  const userLevel = ROLE_HIERARCHY[userRole];
  const targetLevel = ROLE_HIERARCHY[targetRole];
  
  // User must have higher level than target
  if (userLevel <= targetLevel) return false;
  
  const permissions = ROLE_PERMISSIONS[userRole];
  return action === 'promote' 
    ? permissions.canPromote.includes(targetRole)
    : permissions.canDemote.includes(targetRole);
}

// Get next role in hierarchy
export function getNextRole(currentRole: UserRole, direction: 'up' | 'down'): UserRole | null {
  const currentLevel = ROLE_HIERARCHY[currentRole];
  const roles = Object.keys(ROLE_HIERARCHY) as UserRole[];
  
  if (direction === 'up') {
    const nextRole = roles.find(role => ROLE_HIERARCHY[role] === currentLevel + 1);
    return nextRole || null;
  } else {
    const nextRole = roles.find(role => ROLE_HIERARCHY[role] === currentLevel - 1);
    return nextRole || null;
  }
}

// Update user role in both database and Clerk
export async function updateUserRole(
  userId: string,
  newRole: UserRole,
  promotedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update database
    const updatedUser = await prisma.employee.update({
      where: { id: userId },
      data: { 
        role: newRole,
        updatedAt: new Date()
      }
    });

    // Update Clerk metadata
    const clerkRole = newRole.toLowerCase().replace(/\s+/g, '_');
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(updatedUser.clerkUserId!, {
      unsafeMetadata: {
        role: clerkRole,
        roleSetupComplete: true,
        databaseUserId: updatedUser.id,
        lastRoleUpdate: new Date().toISOString()
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: promotedBy,
        userName: 'System Admin',
        userRole: 'Administrator',
        action: 'ROLE_CHANGE',
        resource: 'Employee',
        resourceId: userId,
        details: JSON.stringify({
          newRole,
          targetUserId: userId,
          promotedBy,
          timestamp: new Date().toISOString()
        }),
        severity: 'medium',
        ipAddress: '127.0.0.1',
        userAgent: 'System'
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Check if this is the first user (should be Super Admin)
export async function isFirstUser(): Promise<boolean> {
  const userCount = await prisma.employee.count();
  return userCount === 0;
}

// Initial role selection for new users
export function getInitialRoleOptions(): UserRole[] {
  return ['Employee', 'Intern'];
}

// Get dashboard URL for role
export function getDashboardForRole(role: UserRole): string {
  return ROLE_PERMISSIONS[role].dashboard;
}

export { prisma };
