import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        department: true,
      },
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, role, clerkUserId } = await request.json();

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Name, email, and role are required' },
        { status: 400 }
      );
    }

    // Validate that new users can only choose intern or employee
    const allowedInitialRoles = ['intern', 'employee'];
    if (!allowedInitialRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. New users can only choose intern or employee roles.' },
        { status: 400 }
      );
    }

    // Get the role ID from the database
    const roleRecord = await prisma.role.findUnique({
      where: { name: role }
    });

    if (!roleRecord) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 400 }
      );
    }

    // Get or create a default department
    let department = await prisma.department.findFirst({
      where: { name: 'Engineering' }
    });

    if (!department) {
      department = await prisma.department.create({
        data: {
          name: 'Engineering',
          description: 'Default Engineering Department'
        }
      });
    }

    const employee = await prisma.employee.create({
      data: {
        name,
        email,
        role,
        roleId: roleRecord.id,
        position: role === 'intern' ? 'Software Intern' : 'Junior Developer',
        departmentId: department.id,
        clerkUserId,
        hireDate: new Date()
      },
      include: {
        department: true,
        roleModel: true
      },
    });

    // Create welcome notification
    await prisma.notification.create({
      data: {
        employeeId: employee.id,
        message: `Welcome ${name}! You've been assigned the ${role} role. Complete your profile to get started.`,
        type: 'ANNOUNCEMENT'
      }
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}
