import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, name } = await request.json();

    // Update user metadata via Clerk admin API
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      unsafeMetadata: {
        role,
        name,
        roleSetupComplete: true
      }
    });

    // Return the appropriate dashboard path
    const getDashboardPath = (role: string) => {
      switch (role) {
        case 'super_admin':
        case 'admin':
          return '/dashboard/admin';
        case 'manager':
          return '/dashboard/manager';
        case 'intern':
          return '/intern-portal';
        default:
          return '/dashboard/employee';
      }
    };

    return NextResponse.json({ 
      success: true, 
      redirectPath: getDashboardPath(role) 
    });

  } catch (error) {
    console.error('Setup API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
