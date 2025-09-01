import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the employee record for this user
    const employee = await prisma.employee.findUnique({
      where: { clerkUserId: userId },
      include: {
        department: true
      }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Get the role information
    const role = await prisma.role.findUnique({
      where: { id: employee.roleId || '' }
    });

    return NextResponse.json({ 
      employee,
      role: role || { name: employee.role, id: null }, // Fallback to legacy role field
      department: employee.department
    });

  } catch (error) {
    console.error('User role fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch user role' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}