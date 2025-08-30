import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔥 Temporary Setup API called');
  
  try {
    const { role } = await request.json();
    console.log('🔥 Role received:', role);

    if (!role || !['employee', 'manager', 'admin'].includes(role)) {
      console.log('🔥 Invalid role');
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Simulate successful setup without Clerk for now
    console.log('🔥 Simulating successful role setup...');
    
    // Add delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 500));

    const response = NextResponse.json({ 
      success: true, 
      message: 'Role setup completed successfully (temporary mode)',
      role: role,
      requiresRefresh: false
    });

    console.log('🔥 Returning success response');
    return response;

  } catch (error) {
    console.error('🔥 Setup API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}
