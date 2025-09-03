import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: NextRequest) {
  console.log('🚀 check-user-status API called');
  try {
    const { userId } = await auth();
    console.log('🔍 Auth userId:', userId);
    if (!userId) {
      console.log('❌ No userId found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists in database
    const dbUser = await prisma.employee.findUnique({
      where: { clerkUserId: userId },
      select: { role: true, name: true, email: true }
    });

    if (!dbUser) {
      return NextResponse.json({ exists: false });
    }

    console.log('User found in database:', dbUser);

    // User exists in DB, sync metadata to Clerk
    const clerk = await clerkClient();
    
    // Convert DB role to standard format
    let clerkRole = dbUser.role.toLowerCase().replace(/\s+/g, '_');
    
    // Normalize role formats to match middleware expectations
    switch (clerkRole) {
      case 'super_admin':
      case 'super_administrator':
        clerkRole = 'super_administrator';
        break;
      case 'admin':
      case 'administrator':
        clerkRole = 'administrator';
        break;
      case 'mgr':
      case 'manager':
        clerkRole = 'manager';
        break;
      case 'emp':
      case 'employee':
        clerkRole = 'employee';
        break;
      case 'intern':
        clerkRole = 'intern';
        break;
      default:
        clerkRole = 'employee'; // default fallback
    }

    // Update Clerk metadata
    await clerk.users.updateUser(userId, {
      unsafeMetadata: {
        role: clerkRole,
        roleSetupComplete: true,
        isFirstUser: clerkRole === 'super_administrator',
        setupDate: new Date().toISOString(),
        dbSynced: true
      },
      publicMetadata: {
        role: clerkRole,
        roleSetupComplete: true,
        isFirstUser: clerkRole === 'super_administrator'
      }
    });

    console.log('✅ Metadata synced to Clerk:', clerkRole);

    return NextResponse.json({ 
      exists: true, 
      role: clerkRole,
      message: 'User metadata synced successfully'
    });

  } catch (error) {
    console.error('❌ Error checking user status:', error);
    return NextResponse.json(
      { error: 'Failed to check user status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
