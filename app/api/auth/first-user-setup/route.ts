import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if this is truly the first user by counting existing users
    const existingUserCount = await prisma.employee.count();
    
    if (existingUserCount > 0) {
      return NextResponse.json({ 
        error: 'First user setup not available - users already exist',
        isFirstUser: false 
      }, { status: 400 });
    }

    // Get user from Clerk
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    
    // Set first user as super admin
    await clerk.users.updateUser(userId, {
      unsafeMetadata: {
        role: 'super_administrator',
        roleSetupComplete: true,
        isFirstUser: true,
        setupDate: new Date().toISOString()
      }
    });

    // Create employee record in database
    await prisma.employee.create({
      data: {
        clerkUserId: userId,
        name: `${user.firstName || 'Super'} ${user.lastName || 'Admin'}`,
        email: user.primaryEmailAddress?.emailAddress || `admin@company.com`,
        role: 'super_administrator',
        position: 'System Administrator',
        phone: user.primaryPhoneNumber?.phoneNumber || '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        hireDate: new Date(),
      }
    });

    console.log('✅ First user setup complete - Super Admin created');

    return NextResponse.json({ 
      success: true, 
      role: 'super_administrator',
      message: 'First user setup complete - you are now the Super Administrator'
    });

  } catch (error) {
    console.error('❌ First user setup failed:', error);
    return NextResponse.json(
      { error: 'First user setup failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if first user setup is available
export async function GET(request: NextRequest) {
  try {
    const userCount = await prisma.employee.count();
    return NextResponse.json({ 
      isFirstUser: userCount === 0,
      userCount 
    });
  } catch (error) {
    console.error('Error checking first user status:', error);
    return NextResponse.json(
      { error: 'Failed to check first user status', isFirstUser: false },
      { status: 500 }
    );
  }
}
