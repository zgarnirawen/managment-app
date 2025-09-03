import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('=== FIXING CLERK METADATA ===');
    console.log('User ID:', userId);

    const clerk = await clerkClient();
    
    // Get current user data
    const currentUser = await clerk.users.getUser(userId);
    console.log('Current metadata:', {
      unsafeMetadata: currentUser.unsafeMetadata,
      publicMetadata: currentUser.publicMetadata
    });

    // Update both unsafe and public metadata
    const updatedUser = await clerk.users.updateUser(userId, {
      unsafeMetadata: {
        role: 'super_administrator',
        roleSetupComplete: true,
        isFirstUser: true,
        setupDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      },
      publicMetadata: {
        role: 'super_administrator',
        roleSetupComplete: true,
        isFirstUser: true
      }
    });

    console.log('✅ Clerk metadata updated successfully');
    console.log('New metadata:', {
      unsafeMetadata: updatedUser.unsafeMetadata,
      publicMetadata: updatedUser.publicMetadata
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Clerk metadata fixed successfully',
      metadata: {
        unsafeMetadata: updatedUser.unsafeMetadata,
        publicMetadata: updatedUser.publicMetadata
      }
    });

  } catch (error) {
    console.error('❌ Error fixing Clerk metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fix Clerk metadata', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
