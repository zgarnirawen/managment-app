import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role } = await request.json();
    
    if (!role || !['super_admin', 'admin', 'manager', 'employee', 'intern'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Update user metadata using Clerk backend client
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      unsafeMetadata: {
        role: role,
        roleSetupComplete: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Role setup completed successfully',
      role: role 
    });

  } catch (error) {
    console.error('Role setup API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
