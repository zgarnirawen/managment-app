import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { google } from 'googleapis';

// Initialize Google OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar-sync/oauth/google/callback`
);

// GET /api/calendar-sync/oauth/google - Initiate Google OAuth flow
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find employee record
    const employee = await prisma.employee.findUnique({
      where: { email: user.emailAddresses[0]?.emailAddress },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Generate state parameter for security
    const state = Buffer.from(JSON.stringify({
      employeeId: employee.id,
      timestamp: Date.now(),
    })).toString('base64');

    // Define scopes for Google Calendar API
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    // Generate authorization URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: state,
      prompt: 'consent', // Force consent to get refresh token
    });

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google OAuth' },
      { status: 500 }
    );
  }
}
