// Role-Based Access Control utilities
// This file contains functions for checking user permissions and roles

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
}

export const ROLES = {
  SUPER_ADMIN: 'super_administrator',
  ADMIN: 'administrator',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  INTERN: 'intern'
} as const;

export const PERMISSIONS = {
  READ_USERS: 'read:users',
  WRITE_USERS: 'write:users',
  DELETE_USERS: 'delete:users',
  READ_TASKS: 'read:tasks',
  WRITE_TASKS: 'write:tasks',
  MANAGE_ROLES: 'manage:roles'
} as const;

export function hasPermission(userRole: string, requiredPermission: string): boolean {
  // TODO: Implement proper permission checking logic
  const roleHierarchy: Record<string, string[]> = {
    [ROLES.SUPER_ADMIN]: [PERMISSIONS.READ_USERS, PERMISSIONS.WRITE_USERS, PERMISSIONS.DELETE_USERS, PERMISSIONS.MANAGE_ROLES],
    [ROLES.ADMIN]: [PERMISSIONS.READ_USERS, PERMISSIONS.WRITE_USERS],
    [ROLES.MANAGER]: [PERMISSIONS.READ_TASKS, PERMISSIONS.WRITE_TASKS],
    [ROLES.EMPLOYEE]: [PERMISSIONS.READ_TASKS],
    [ROLES.INTERN]: [PERMISSIONS.READ_TASKS]
  };

  const userPermissions = roleHierarchy[userRole] || [];
  return userPermissions.includes(requiredPermission);
}

export function canManageUsers(userRole: string): boolean {
  return [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(userRole as typeof ROLES.SUPER_ADMIN | typeof ROLES.ADMIN);
}

export function isAdmin(userRole: string): boolean {
  return [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(userRole as typeof ROLES.SUPER_ADMIN | typeof ROLES.ADMIN);
}
