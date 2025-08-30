import { NextResponse } from 'next/server';
import { initializeTimesheetCronJob, getCronJobStatus } from '../../../services/timesheet-cron';

export async function POST() {
  try {
    initializeTimesheetCronJob();
    const status = getCronJobStatus();
    return NextResponse.json({ 
      message: 'Cron job initialized successfully',
      status 
    });
  } catch (error) {
    console.error('Error initializing cron job:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const status = getCronJobStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error getting cron job status:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
