import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requestedRole, reason } = await request.json();

    // Placeholder promotion request endpoint
    console.log('Placeholder promotion request:', {
      userId,
      requestedRole,
      reason
    });

    return NextResponse.json({
      success: true,
      message: 'Promotion request submitted successfully',
      data: {
        requestId: 'placeholder-request-id',
        userId,
        requestedRole,
        reason,
        status: 'pending',
        submittedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to submit promotion request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Promotion request endpoint available',
    available: true
  });
}
