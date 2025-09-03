import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const employee = await prisma.employee.findUnique({
      where: { clerkUserId: userId },
      include: {
        department: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      position: employee.position,
      phone: employee.phone,
      address: employee.address,
      hireDate: employee.hireDate,
      department: employee.department,
      manager: employee.manager,
      emergencyContact: {
        name: employee.emergencyContactName,
        phone: employee.emergencyContactPhone,
        relationship: employee.emergencyContactRelationship
      }
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      phone,
      address,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelationship
    } = body;

    const employee = await prisma.employee.findUnique({
      where: { clerkUserId: userId }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee profile not found' }, { status: 404 });
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id: employee.id },
      data: {
        name,
        phone,
        address,
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelationship
      },
      include: {
        department: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      employee: {
        id: updatedEmployee.id,
        name: updatedEmployee.name,
        email: updatedEmployee.email,
        role: updatedEmployee.role,
        position: updatedEmployee.position,
        phone: updatedEmployee.phone,
        address: updatedEmployee.address,
        hireDate: updatedEmployee.hireDate,
        department: updatedEmployee.department,
        manager: updatedEmployee.manager,
        emergencyContact: {
          name: updatedEmployee.emergencyContactName,
          phone: updatedEmployee.emergencyContactPhone,
          relationship: updatedEmployee.emergencyContactRelationship
        }
      }
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
