import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { selectedRole } = await request.json();
    
    // Validate selected role - only allow intern or employee for regular users
    if (!['intern', 'employee'].includes(selectedRole)) {
      return NextResponse.json({ 
        error: 'Invalid role selection. New users can only choose between Intern and Employee roles.' 
      }, { status: 400 });
    }

    // Check if user already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { clerkUserId: userId }
    });

    if (existingEmployee) {
      return NextResponse.json({ 
        error: 'User already registered',
        currentRole: existingEmployee.role 
      }, { status: 400 });
    }

    // Get user from Clerk
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    
    // Set user role in Clerk
    await clerk.users.updateUser(userId, {
      unsafeMetadata: {
        role: selectedRole,
        roleSetupComplete: true,
        setupDate: new Date().toISOString()
      }
    });

    // Create employee record in database
    const newEmployee = await prisma.employee.create({
      data: {
        clerkUserId: userId,
        name: `${user.firstName || 'User'} ${user.lastName || 'Employee'}`,
        email: user.primaryEmailAddress?.emailAddress || `user@company.com`,
        role: selectedRole,
        position: selectedRole === 'intern' ? 'Intern' : 'Employee',
        phone: user.primaryPhoneNumber?.phoneNumber || '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        hireDate: new Date(),
      }
    });

    console.log(`✅ New user registered as ${selectedRole}:`, newEmployee.id);

    return NextResponse.json({ 
      success: true, 
      role: selectedRole,
      message: `Welcome! You have been registered as ${selectedRole === 'intern' ? 'an Intern' : 'an Employee'}.`,
      employee: newEmployee
    });

  } catch (error) {
    console.error('❌ User registration failed:', error);
    return NextResponse.json(
      { error: 'User registration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
