import { auth } from '@clerk/nextjs/server';
import { prisma } from './prisma';

/**
 * Get the current employee based on the authenticated Clerk user
 * @returns Employee record with role and department info, or null if not found
 */
export async function getCurrentEmployee() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return null;
    }

    // Use raw query to work around TypeScript issues temporarily
    const employee = await prisma.$queryRaw`
      SELECT e.*, e.role as role_name, d.name as department_name
      FROM "Employee" e
      LEFT JOIN "Department" d ON e."departmentId" = d.id
      WHERE e.clerk_user_id = ${userId}
      LIMIT 1
    `;

    return (employee as any)?.[0] || null;
  } catch (error) {
    console.error('Error getting current employee:', error);
    return null;
  }
}

/**
 * Get employee ID for the current authenticated user
 * @returns Employee ID string or null if not found
 */
export async function getCurrentEmployeeId(): Promise<string | null> {
  const employee = await getCurrentEmployee();
  return employee?.id || null;
}

/**
 * Require current employee - throws error if not found
 * @returns Employee record with role and department info
 * @throws Error if user is not authenticated or employee not found
 */
export async function requireCurrentEmployee() {
  const employee = await getCurrentEmployee();
  
  if (!employee) {
    throw new Error('Current employee not found. User may not be linked to an employee record.');
  }
  
  return employee;
}
