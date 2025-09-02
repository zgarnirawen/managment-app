/**
 * 🚀 Role-Based Access Control System
 * Comprehensive role hierarchy and permissions management
 */

export type UserRole = 'intern' | 'employee' | 'manager' | 'admin' | 'super_admin';

export interface RoleHierarchy {
  level: number;
  inherits: UserRole[];
  permissions: string[];
  features: string[];
  canPromoteTo?: UserRole[];
  canDemoteTo?: UserRole[];
}

export const ROLE_HIERARCHY: Record<UserRole, RoleHierarchy> = {
  intern: {
    level: 1,
    inherits: [],
    permissions: [
      'view_assigned_tasks',
      'submit_timesheets',
      'submit_reports',
      'request_promotion',
      'view_training_resources',
      'receive_notifications'
    ],
    features: [
      'intern_dashboard',
      'task_viewer',
      'timesheet_submission',
      'training_portal',
      'promotion_requests'
    ],
    canPromoteTo: ['employee']
  },
  
  employee: {
    level: 2,
    inherits: [],
    permissions: [
      'manage_personal_tasks',
      'view_team_calendar',
      'participate_projects',
      'join_video_conferences',
      'access_payroll_view',
      'team_collaboration',
      'email_notifications',
      'sprint_participation'
    ],
    features: [
      'employee_dashboard',
      'full_task_management',
      'personal_calendar',
      'team_collaboration',
      'payroll_view',
      'project_participation',
      'video_conferences'
    ],
    canPromoteTo: ['manager'],
    canDemoteTo: ['intern']
  },
  
  manager: {
    level: 3,
    inherits: ['employee'],
    permissions: [
      'create_teams',
      'assign_tasks',
      'manage_projects',
      'manage_sprints',
      'approve_leave_requests',
      'view_team_performance',
      'moderate_team_communication',
      'schedule_team_meetings',
      'trigger_notifications'
    ],
    features: [
      'manager_dashboard',
      'team_management',
      'project_creation',
      'sprint_management',
      'leave_approval',
      'team_statistics',
      'team_calendar_integration'
    ],
    canPromoteTo: ['admin'],
    canDemoteTo: ['employee']
  },
  
  admin: {
    level: 4,
    inherits: ['manager', 'employee'],
    permissions: [
      'configure_policies',
      'manage_all_roles',
      'access_all_statistics',
      'advanced_reporting',
      'manage_integrations',
      'company_notifications',
      'payroll_management',
      'system_configuration'
    ],
    features: [
      'admin_dashboard',
      'policy_configuration',
      'role_management',
      'company_statistics',
      'advanced_reports',
      'integration_management',
      'payroll_administration'
    ],
    canPromoteTo: [], // Only super_admin can promote to super_admin
    canDemoteTo: ['manager']
  },
  
  super_admin: {
    level: 5,
    inherits: ['admin', 'manager', 'employee'],
    permissions: [
      'assign_admin_roles',
      'promote_demote_admins',
      'transfer_super_admin',
      'global_company_oversight',
      'security_settings',
      'system_configuration',
      'full_access_all_features'
    ],
    features: [
      'super_admin_dashboard',
      'global_oversight',
      'admin_role_management',
      'security_configuration',
      'super_admin_transfer',
      'system_management'
    ],
    canPromoteTo: ['super_admin'], // Can transfer role
    canDemoteTo: ['admin']
  }
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(userRole: UserRole, permission: string): boolean {
  const role = ROLE_HIERARCHY[userRole];
  if (!role) return false;
  
  // Check direct permissions
  if (role.permissions.includes(permission)) return true;
  
  // Check inherited permissions
  for (const inheritedRole of role.inherits) {
    if (hasPermission(inheritedRole, permission)) return true;
  }
  
  return false;
}

/**
 * Check if a role has access to a specific feature
 */
export function hasFeatureAccess(userRole: UserRole, feature: string): boolean {
  const role = ROLE_HIERARCHY[userRole];
  if (!role) return false;
  
  // Check direct features
  if (role.features.includes(feature)) return true;
  
  // Check inherited features
  for (const inheritedRole of role.inherits) {
    if (hasFeatureAccess(inheritedRole, feature)) return true;
  }
  
  return false;
}

/**
 * Get all permissions for a role (including inherited)
 */
export function getAllPermissions(userRole: UserRole): string[] {
  const role = ROLE_HIERARCHY[userRole];
  if (!role) return [];
  
  const permissions = new Set(role.permissions);
  
  // Add inherited permissions
  for (const inheritedRole of role.inherits) {
    const inheritedPermissions = getAllPermissions(inheritedRole);
    inheritedPermissions.forEach(p => permissions.add(p));
  }
  
  return Array.from(permissions);
}

/**
 * Get all features for a role (including inherited)
 */
export function getAllFeatures(userRole: UserRole): string[] {
  const role = ROLE_HIERARCHY[userRole];
  if (!role) return [];
  
  const features = new Set(role.features);
  
  // Add inherited features
  for (const inheritedRole of role.inherits) {
    const inheritedFeatures = getAllFeatures(inheritedRole);
    inheritedFeatures.forEach(f => features.add(f));
  }
  
  return Array.from(features);
}

/**
 * Check if one role can promote another role
 */
export function canPromoteRole(promoterRole: UserRole, targetRole: UserRole, newRole: UserRole): boolean {
  const promoter = ROLE_HIERARCHY[promoterRole];
  const target = ROLE_HIERARCHY[targetRole];
  const newRoleData = ROLE_HIERARCHY[newRole];
  
  if (!promoter || !target || !newRoleData) return false;
  
  // Super admin can do anything
  if (promoterRole === 'super_admin') return true;
  
  // Admin can promote/demote manager and below
  if (promoterRole === 'admin') {
    return newRoleData.level <= 3; // up to manager level
  }
  
  // Manager can promote employees to manager (if they have permission)
  if (promoterRole === 'manager' && targetRole === 'employee' && newRole === 'manager') {
    return true;
  }
  
  return false;
}

/**
 * Check if one role can demote another role
 */
export function canDemoteRole(demoterRole: UserRole, targetRole: UserRole, newRole: UserRole): boolean {
  const demoter = ROLE_HIERARCHY[demoterRole];
  const target = ROLE_HIERARCHY[targetRole];
  const newRoleData = ROLE_HIERARCHY[newRole];
  
  if (!demoter || !target || !newRoleData) return false;
  
  // Super admin can demote anyone except other super admins (unless transferring)
  if (demoterRole === 'super_admin') {
    return targetRole !== 'super_admin' || newRole === 'admin';
  }
  
  // Admin can demote manager and below
  if (demoterRole === 'admin') {
    return target.level <= 3 && newRoleData.level < target.level;
  }
  
  // Manager can demote employees to intern
  if (demoterRole === 'manager' && targetRole === 'employee' && newRole === 'intern') {
    return true;
  }
  
  return false;
}

/**
 * Get dashboard route for a role
 */
export function getDashboardRoute(role: UserRole): string {
  switch (role) {
    case 'intern':
      return '/dashboard/intern';
    case 'employee':
      return '/dashboard/employee';
    case 'manager':
      return '/dashboard/manager';
    case 'admin':
      return '/dashboard/admin';
    case 'super_admin':
      return '/dashboard/super-admin';
    default:
      return '/dashboard';
  }
}

/**
 * Get role display name and color
 */
export function getRoleDisplay(role: UserRole): { name: string; color: string; level: number } {
  switch (role) {
    case 'intern':
      return { name: 'Intern', color: 'bg-green-100 text-green-800', level: 1 };
    case 'employee':
      return { name: 'Employee', color: 'bg-yellow-100 text-yellow-800', level: 2 };
    case 'manager':
      return { name: 'Manager', color: 'bg-blue-100 text-blue-800', level: 3 };
    case 'admin':
      return { name: 'Admin', color: 'bg-orange-100 text-orange-800', level: 4 };
    case 'super_admin':
      return { name: 'Super Admin', color: 'bg-red-100 text-red-800', level: 5 };
    default:
      return { name: 'Unknown', color: 'bg-gray-100 text-gray-800', level: 0 };
  }
}

/**
 * Role validation for sign-up process
 */
export function getAvailableSignupRoles(): { role: UserRole; label: string; description: string }[] {
  return [
    {
      role: 'intern',
      label: 'Intern',
      description: 'Limited access, view assigned tasks, submit reports, access training resources'
    },
    {
      role: 'employee',
      label: 'Employee', 
      description: 'Full task management, team collaboration, project participation, payroll access'
    }
  ];
}

/**
 * Check if this is the first user (should be super admin)
 */
export async function isFirstUser(): Promise<boolean> {
  try {
    const response = await fetch('/api/employees/count');
    const data = await response.json();
    return data.count === 0;
  } catch (error) {
    console.error('Error checking first user:', error);
    return false;
  }
}

/**
 * Get user role from Clerk user object
 */
export function getUserRole(user: any): UserRole {
  if (!user) return 'intern';
  
  // Check for role in user metadata
  const role = user.unsafeMetadata?.role || user.publicMetadata?.role;
  
  // Validate the role exists in our hierarchy
  if (role && Object.keys(ROLE_HIERARCHY).includes(role)) {
    return role as UserRole;
  }
  
  // Default to intern for new users
  return 'intern';
}

/**
 * Get dashboard path for a user role
 */
export function getDashboardPath(role: UserRole): string {
  const dashboardPaths: Record<UserRole, string> = {
    intern: '/intern',
    employee: '/employee', 
    manager: '/manager',
    admin: '/admin',
    super_admin: '/super_admin'
  };
  
  return dashboardPaths[role] || '/intern';
}
