import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Placeholder debug endpoint for testing
    console.log('Debug endpoint called with:', data);

    return NextResponse.json({
      success: true,
      message: 'Debug endpoint - data received',
      received: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to process debug request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
