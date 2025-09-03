import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, body } = await request.json();

    // Placeholder email sending endpoint
    console.log('Placeholder email send:', { to, subject, body });

    return NextResponse.json({
      success: true,
      message: 'Placeholder email sent successfully',
      data: {
        to,
        subject,
        sent: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to send placeholder email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
