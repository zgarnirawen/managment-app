import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ENHANCED ROLE-BASED ACTION SYSTEM
// Implements specific permissions for each role as requested

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const currentUserData = await currentUser();

    if (!userId || !currentUserData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, targetUserId, data } = await request.json();

    // Get current user's role
    const currentUserEmployee = await prisma.employee.findFirst({
      where: { clerkUserId: userId },
      include: { roleModel: true, department: true }
    });

    if (!currentUserEmployee) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentRole = currentUserEmployee.roleModel?.name || 'EMPLOYEE';

    // Route to appropriate handler based on action
    switch (action) {
      case 'promote_user':
        return await handlePromotion(currentRole, targetUserId, data);
      
      case 'assign_project':
        return await handleProjectAssignment(currentRole, currentUserEmployee, targetUserId, data);
      
      case 'assign_task':
        return await handleTaskAssignment(currentRole, currentUserEmployee, targetUserId, data);
      
      case 'manage_team':
        return await handleTeamManagement(currentRole, currentUserEmployee, targetUserId, data);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Role-based action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PROMOTION HANDLER
async function handlePromotion(currentRole: string, targetUserId: string, data: any) {
  const { newRole } = data;

  // Get target user
  const targetUser = await prisma.employee.findFirst({
    where: { clerkUserId: targetUserId },
    include: { roleModel: true }
  });

  if (!targetUser) {
    return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
  }

  const targetCurrentRole = targetUser.roleModel?.name || 'EMPLOYEE';

  // Validate promotion permissions
  if (!canPromote(currentRole, targetCurrentRole, newRole)) {
    return NextResponse.json({ 
      error: `${currentRole} cannot promote ${targetCurrentRole} to ${newRole}` 
    }, { status: 403 });
  }

  // Get role ID for new role
  const roleModel = await prisma.role.findFirst({
    where: { name: newRole }
  });

  if (!roleModel) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  // Update user role in database
  await prisma.employee.update({
    where: { clerkUserId: targetUserId },
    data: { roleId: roleModel.id }
  });

  // Update Clerk metadata
  const clerkResponse = await fetch(`https://api.clerk.dev/v1/users/${targetUserId}/metadata`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      public_metadata: { role: newRole }
    }),
  });

  if (!clerkResponse.ok) {
    throw new Error('Failed to update Clerk metadata');
  }

  return NextResponse.json({ 
    success: true, 
    message: `User promoted from ${targetCurrentRole} to ${newRole}`,
    newRole 
  });
}

// PROJECT ASSIGNMENT HANDLER
async function handleProjectAssignment(currentRole: string, currentUser: any, targetUserId: string, data: any) {
  const { projectId } = data;

  // Check permissions
  if (!canAssignProject(currentRole)) {
    return NextResponse.json({ 
      error: `${currentRole} cannot assign projects` 
    }, { status: 403 });
  }

  // Get target user
  const targetUser = await prisma.employee.findFirst({
    where: { clerkUserId: targetUserId },
    include: { roleModel: true }
  });

  if (!targetUser) {
    return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
  }

  // For managers, ensure target is in their department
  if (currentRole === 'MANAGER') {
    if (targetUser.departmentId !== currentUser.departmentId) {
      return NextResponse.json({ 
        error: 'Can only assign projects to team members in your department' 
      }, { status: 403 });
    }
  }

  // Verify project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  // Assign project to user
  await prisma.projectMember.create({
    data: {
      projectId,
      userId: targetUser.id,
      role: 'MEMBER'
    }
  });

  // Create notification
  await prisma.notification.create({
    data: {
      message: `You have been assigned to the project "${project.name}".`,
      type: 'PROJECT_ASSIGNMENT',
      employeeId: targetUser.id,
      read: false
    }
  });

  return NextResponse.json({ 
    success: true, 
    message: `Project assigned successfully` 
  });
}

// TASK ASSIGNMENT HANDLER
async function handleTaskAssignment(currentRole: string, currentUser: any, targetUserId: string, data: any) {
  const { taskId } = data;

  // Check permissions
  if (!canAssignTask(currentRole)) {
    return NextResponse.json({ 
      error: `${currentRole} cannot assign tasks` 
    }, { status: 403 });
  }

  // Get target user
  const targetUser = await prisma.employee.findFirst({
    where: { clerkUserId: targetUserId },
    include: { roleModel: true }
  });

  if (!targetUser) {
    return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
  }

  // For managers, ensure target is in their department
  if (currentRole === 'MANAGER') {
    if (targetUser.departmentId !== currentUser.departmentId) {
      return NextResponse.json({ 
        error: 'Can only assign tasks to team members in your department' 
      }, { status: 403 });
    }
  }

  // Verify task exists
  const task = await prisma.task.findUnique({
    where: { id: taskId }
  });

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  // Assign task to user
  await prisma.task.update({
    where: { id: taskId },
    data: { employeeId: targetUser.id }
  });

  // Create notification
  await prisma.notification.create({
    data: {
      message: `You have been assigned a new task: "${task.title}".`,
      type: 'TASK_ASSIGNED',
      employeeId: targetUser.id,
      read: false
    }
  });

  return NextResponse.json({ 
    success: true, 
    message: `Task assigned successfully` 
  });
}

// TEAM MANAGEMENT HANDLER
async function handleTeamManagement(currentRole: string, currentUser: any, targetUserId: string, data: any) {
  const { teamId, operation } = data;

  // Check permissions
  if (!canManageTeam(currentRole)) {
    return NextResponse.json({ 
      error: `${currentRole} cannot manage teams` 
    }, { status: 403 });
  }

  // Get target user
  const targetUser = await prisma.employee.findFirst({
    where: { clerkUserId: targetUserId },
    include: { roleModel: true }
  });

  if (!targetUser) {
    return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
  }

  // For managers, ensure target is in their department
  if (currentRole === 'MANAGER') {
    if (targetUser.departmentId !== currentUser.departmentId) {
      return NextResponse.json({ 
        error: 'Can only manage team members in your department' 
      }, { status: 403 });
    }
  }

  if (operation === 'add_to_team') {
    // Add to team
    await prisma.teamMember.create({
      data: {
        teamId,
        userId: targetUser.id,
        role: 'MEMBER'
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `User added to team successfully` 
    });
  }

  if (operation === 'remove_from_team') {
    // Remove from team
    await prisma.teamMember.deleteMany({
      where: {
        teamId,
        userId: targetUser.id
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `User removed from team successfully` 
    });
  }

  return NextResponse.json({ error: 'Invalid team operation' }, { status: 400 });
}

// PERMISSION VALIDATION FUNCTIONS

function canPromote(currentRole: string, targetCurrentRole: string, newRole: string): boolean {
  switch (currentRole) {
    case 'SUPER_ADMIN':
      // Super Admin can assign ALL roles and promote to ALL roles
      return true;
      
    case 'ADMIN':
      // Admin can only promote: INTERN → EMPLOYEE and EMPLOYEE → MANAGER
      if (targetCurrentRole === 'INTERN' && newRole === 'EMPLOYEE') return true;
      if (targetCurrentRole === 'EMPLOYEE' && newRole === 'MANAGER') return true;
      return false;
      
    case 'MANAGER':
      // Manager can only promote: INTERN → EMPLOYEE
      if (targetCurrentRole === 'INTERN' && newRole === 'EMPLOYEE') return true;
      return false;
      
    default:
      return false;
  }
}

function canAssignProject(currentRole: string): boolean {
  return ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(currentRole);
}

function canAssignTask(currentRole: string): boolean {
  return ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(currentRole);
}

function canManageTeam(currentRole: string): boolean {
  return ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(currentRole);
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user's permissions
    const currentUserEmployee = await prisma.employee.findFirst({
      where: { clerkUserId: userId },
      include: { roleModel: true }
    });

    if (!currentUserEmployee) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentRole = currentUserEmployee.roleModel?.name || 'EMPLOYEE';

    // Return available actions based on role
    const permissions = {
      canPromoteInternToEmployee: canPromote(currentRole, 'INTERN', 'EMPLOYEE'),
      canPromoteEmployeeToManager: canPromote(currentRole, 'EMPLOYEE', 'MANAGER'),
      canPromoteManagerToAdmin: canPromote(currentRole, 'MANAGER', 'ADMIN'),
      canPromoteAdminToSuperAdmin: canPromote(currentRole, 'ADMIN', 'SUPER_ADMIN'),
      canAssignProjects: canAssignProject(currentRole),
      canAssignTasks: canAssignTask(currentRole),
      canManageTeams: canManageTeam(currentRole),
      currentRole
    };

    return NextResponse.json({ permissions });

  } catch (error) {
    console.error('Get permissions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
