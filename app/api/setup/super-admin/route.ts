import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if this is the first user in the system
    const existingEmployees = await prisma.employee.count();
    
    if (existingEmployees > 0) {
      return NextResponse.json({ error: 'Super admin already exists' }, { status: 400 });
    }

    // Get the super admin role
    const superAdminRole = await prisma.role.findUnique({
      where: { name: 'SUPER_ADMIN' }
    });

    if (!superAdminRole) {
      return NextResponse.json({ error: 'Super admin role not found' }, { status: 500 });
    }

    // Get default department
    const defaultDepartment = await prisma.department.findFirst();

    if (!defaultDepartment) {
      return NextResponse.json({ error: 'No departments found' }, { status: 500 });
    }

    // Create the super admin employee
    const superAdmin = await prisma.employee.create({
      data: {
        clerkUserId: userId,
        email: 'admin@company.com', // This will be updated with actual email
        name: 'Super Admin',
        roleId: superAdminRole.id,
        departmentId: defaultDepartment.id,
        hireDate: new Date(),
      },
      include: {
        department: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      employee: superAdmin,
      message: 'Super admin created successfully'
    });

  } catch (error) {
    console.error('Super admin setup error:', error);
    return NextResponse.json({ 
      error: 'Failed to setup super admin' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}