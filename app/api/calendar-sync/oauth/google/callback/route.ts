import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { google } from 'googleapis';
import CryptoJS from 'crypto-js';

// Initialize Google OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar-sync/oauth/google/callback`
);

const ENCRYPTION_KEY = process.env.CALENDAR_SYNC_ENCRYPTION_KEY || 'default-encryption-key';

function encryptToken(token: string): string {
  return CryptoJS.AES.encrypt(token, ENCRYPTION_KEY).toString();
}

// GET /api/calendar-sync/oauth/google/callback - Handle Google OAuth callback
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings/calendar?error=oauth_denied`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings/calendar?error=invalid_callback`
      );
    }

    // Decode and validate state
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings/calendar?error=invalid_state`
      );
    }

    const { employeeId, timestamp } = stateData;
    
    // Check if state is not too old (5 minutes)
    if (Date.now() - timestamp > 5 * 60 * 1000) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings/calendar?error=expired_state`
      );
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings/calendar?error=token_exchange_failed`
      );
    }

    // Get user profile to get account ID
    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const profile = await calendar.calendarList.list();
    
    const primaryCalendar = profile.data.items?.find(cal => cal.primary);
    const providerAccountId = primaryCalendar?.id || 'primary';

    // Encrypt tokens before storing
    const encryptedAccessToken = encryptToken(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token ? encryptToken(tokens.refresh_token) : null;

    // Save or update calendar sync settings
    await prisma.calendarSyncSettings.upsert({
      where: {
        employeeId_provider: {
          employeeId,
          provider: 'GOOGLE',
        },
      },
      create: {
        employeeId,
        provider: 'GOOGLE',
        providerAccountId,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        syncEnabled: true,
        syncDirection: 'BIDIRECTIONAL',
        syncEvents: 'ALL',
        isActive: true,
      },
      update: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        isActive: true,
        updatedAt: new Date(),
      },
    });

    // Create success notification
    await prisma.notification.create({
      data: {
        employeeId,
        message: 'Google Calendar successfully connected! Your work calendar will now sync with your personal calendar.',
        type: 'CALENDAR_SYNC_SUCCESS',
        read: false,
      },
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/calendar?success=google_connected`
    );
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/calendar?error=connection_failed`
    );
  }
}
