import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  console.log('🔥 Setup Role API called');
  
  try {
    // Get the current user
    const { userId } = await auth();
    
    if (!userId) {
      console.log('🔥 No user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { role } = await request.json();
    console.log('🔥 Role received:', role);

    // Validate role
    if (!role || !['employee', 'manager', 'admin', 'intern'].includes(role)) {
      console.log('🔥 Invalid role');
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    try {
      // Update Clerk user metadata
      console.log('🔥 Updating Clerk metadata for user:', userId);
      const client = await clerkClient();
      
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: role,
          roleSetupComplete: true,
          setupDate: new Date().toISOString()
        }
      });

      console.log('✅ Clerk metadata updated successfully');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Role setup completed successfully',
        role: role,
        redirect: getDashboardPath(role)
      });

    } catch (clerkError) {
      console.error('⚠️ Clerk metadata update failed:', clerkError);
      
      // Return success anyway since localStorage fallback will be used
      return NextResponse.json({ 
        success: true, 
        message: 'Role setup completed (using local storage)',
        role: role,
        redirect: getDashboardPath(role),
        warning: 'Clerk metadata update failed, using local storage fallback'
      });
    }

  } catch (error) {
    console.error('🔥 Setup API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function getDashboardPath(role: string): string {
  switch (role) {
    case 'admin': return '/dashboard/admin';
    case 'manager': return '/dashboard/manager';
    case 'employee': return '/dashboard/employee';
    case 'intern': return '/intern-portal';
    default: return '/dashboard';
  }
}
