import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  console.log('🔥 Setup API called');
  
  try {
    const { userId } = await auth();
    console.log('🔥 User ID:', userId);
    
    if (!userId) {
      console.log('🔥 No user ID - returning unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role } = await request.json();
    console.log('🔥 Role received:', role);

    if (!role || !['employee', 'manager', 'admin'].includes(role)) {
      console.log('🔥 Invalid role');
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Update Clerk user metadata
    console.log('🔥 Updating Clerk metadata...');
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      unsafeMetadata: {
        role: role,
        roleSetupComplete: true,
        setupDate: new Date().toISOString()
      }
    });
    console.log('🔥 Clerk metadata updated');

    // Add a longer delay to ensure Clerk processes the update
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create response that instructs frontend to refresh session
    const response = NextResponse.json({ 
      success: true, 
      message: 'Role setup completed successfully',
      role: role,
      requiresRefresh: true
    });

    console.log('🔥 Returning success response');
    return response;

  } catch (error) {
    console.error('🔥 Setup API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
