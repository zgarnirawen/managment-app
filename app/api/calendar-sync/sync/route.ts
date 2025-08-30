import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { google } from 'googleapis';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.CALENDAR_SYNC_ENCRYPTION_KEY || 'default-encryption-key';

function decryptToken(encryptedToken: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedToken, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// POST /api/calendar-sync/sync - Manually trigger calendar sync
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider, direction = 'BIDIRECTIONAL' } = await request.json();

    // Find employee record
    const employee = await prisma.employee.findUnique({
      where: { email: user.emailAddresses[0]?.emailAddress },
      include: {
        calendarSyncSettings: {
          where: {
            provider,
            isActive: true,
            syncEnabled: true,
          },
        },
      },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const syncSettings = employee.calendarSyncSettings[0];
    if (!syncSettings) {
      return NextResponse.json(
        { error: 'Calendar sync not configured for this provider' },
        { status: 404 }
      );
    }

    let syncResult = {
      success: true,
      imported: 0,
      exported: 0,
      errors: [] as string[],
    };

    if (provider === 'GOOGLE') {
      syncResult = await syncWithGoogle(syncSettings, direction);
    } else {
      throw new Error(`Provider ${provider} not yet implemented`);
    }

    // Update last sync time
    await prisma.calendarSyncSettings.update({
      where: { id: syncSettings.id },
      data: { lastSyncAt: new Date() },
    });

    // Log sync operation
    await prisma.calendarSyncLog.create({
      data: {
        settingsId: syncSettings.id,
        operation: 'IMPORT',
        status: syncResult.success ? 'SUCCESS' : 'ERROR',
        metadata: {
          imported: syncResult.imported,
          exported: syncResult.exported,
          errors: syncResult.errors,
        },
      },
    });

    return NextResponse.json({
      success: syncResult.success,
      message: `Sync completed. Imported: ${syncResult.imported}, Exported: ${syncResult.exported}`,
      details: syncResult,
    });
  } catch (error) {
    console.error('Calendar sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync calendar' },
      { status: 500 }
    );
  }
}

async function syncWithGoogle(syncSettings: any, direction: string) {
  const result = {
    success: true,
    imported: 0,
    exported: 0,
    errors: [] as string[],
  };

  try {
    // Initialize Google Calendar API
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    // Decrypt and set tokens
    const accessToken = decryptToken(syncSettings.accessToken);
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: syncSettings.refreshToken ? decryptToken(syncSettings.refreshToken) : undefined,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Import from Google Calendar (if direction allows)
    if (direction === 'IMPORT_ONLY' || direction === 'BIDIRECTIONAL') {
      const now = new Date();
      const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const events = await calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        timeMax: oneMonthFromNow.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      for (const event of events.data.items || []) {
        try {
          // Skip events that are already from our work calendar
          if (event.description?.includes('[WORK_CALENDAR_SYNC]')) {
            continue;
          }

          // Check if meeting already exists
          const existingMeeting = await prisma.meeting.findFirst({
            where: {
              title: event.summary || '',
              startDate: new Date(event.start?.dateTime || event.start?.date || ''),
            },
          });

          if (!existingMeeting && syncSettings.syncEvents !== 'TASKS_ONLY') {
            // Create new meeting from Google Calendar event
            await prisma.meeting.create({
              data: {
                title: event.summary || 'Imported Event',
                description: `${event.description || ''}\n\n[IMPORTED_FROM_GOOGLE_CALENDAR]`,
                startDate: new Date(event.start?.dateTime || event.start?.date || ''),
                endDate: new Date(event.end?.dateTime || event.end?.date || ''),
                location: event.location || undefined,
                type: 'GENERAL',
                organizerId: syncSettings.employeeId,
                attendees: {
                  connect: [{ id: syncSettings.employeeId }],
                },
              },
            });
            result.imported++;
          }
        } catch (error) {
          result.errors.push(`Failed to import event: ${event.summary}`);
        }
      }
    }

    // Export to Google Calendar (if direction allows)
    if (direction === 'EXPORT_ONLY' || direction === 'BIDIRECTIONAL') {
      const now = new Date();
      const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Export meetings
      if (syncSettings.syncEvents === 'ALL' || syncSettings.syncEvents === 'MEETINGS_ONLY') {
        const meetings = await prisma.meeting.findMany({
          where: {
            startDate: {
              gte: now,
              lte: oneMonthFromNow,
            },
            OR: [
              { organizerId: syncSettings.employeeId },
              { attendees: { some: { id: syncSettings.employeeId } } },
            ],
          },
          include: {
            organizer: true,
            attendees: true,
          },
        });

        for (const meeting of meetings) {
          try {
            // Check if already exported
            if (meeting.description?.includes('[EXPORTED_TO_GOOGLE_CALENDAR]')) {
              continue;
            }

            const googleEvent = {
              summary: meeting.title,
              description: `${meeting.description || ''}\n\n[WORK_CALENDAR_SYNC]`,
              start: {
                dateTime: meeting.startDate.toISOString(),
                timeZone: 'UTC',
              },
              end: {
                dateTime: meeting.endDate.toISOString(),
                timeZone: 'UTC',
              },
              location: meeting.location || undefined,
              attendees: meeting.attendees.map(attendee => ({
                email: attendee.email,
                displayName: attendee.name,
              })),
            };

            await calendar.events.insert({
              calendarId: 'primary',
              requestBody: googleEvent,
            });

            // Update meeting to mark as exported
            await prisma.meeting.update({
              where: { id: meeting.id },
              data: {
                description: `${meeting.description || ''}\n\n[EXPORTED_TO_GOOGLE_CALENDAR]`,
              },
            });

            result.exported++;
          } catch (error) {
            result.errors.push(`Failed to export meeting: ${meeting.title}`);
          }
        }
      }

      // Export tasks with due dates
      if (syncSettings.syncEvents === 'ALL' || syncSettings.syncEvents === 'TASKS_ONLY') {
        const tasks = await prisma.task.findMany({
          where: {
            employeeId: syncSettings.employeeId,
            deadline: {
              gte: now,
              lte: oneMonthFromNow,
            },
          },
          include: {
            assignedTo: true,
            project: true,
          },
        });

        for (const task of tasks) {
          try {
            if (!task.deadline) continue;

            const googleEvent = {
              summary: `Task: ${task.title}`,
              description: `${task.description || ''}\n\nProject: ${task.project?.name || 'N/A'}\n\n[WORK_CALENDAR_SYNC]`,
              start: {
                dateTime: task.deadline.toISOString(),
                timeZone: 'UTC',
              },
              end: {
                dateTime: new Date(task.deadline.getTime() + 60 * 60 * 1000).toISOString(), // +1 hour
                timeZone: 'UTC',
              },
            };

            await calendar.events.insert({
              calendarId: 'primary',
              requestBody: googleEvent,
            });

            result.exported++;
          } catch (error) {
            result.errors.push(`Failed to export task: ${task.title}`);
          }
        }
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Google Calendar API error: ${error}`);
  }

  return result;
}
