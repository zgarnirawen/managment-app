import { NextResponse } from 'next/server';
import { runTimesheetCalculationManually } from '../../../services/timesheet-cron';
import { getWeekBounds } from '../../../lib/timesheet-utils';

export async function POST(request: Request) {
  try {
    const { weekStart } = await request.json();
    
    const targetWeek = weekStart ? new Date(weekStart) : getWeekBounds(new Date()).weekStart;
    
    console.log(`🧪 Manual timesheet calculation triggered for week: ${targetWeek.toISOString()}`);
    
    const results = await runTimesheetCalculationManually(targetWeek);
    
    return NextResponse.json({
      success: true,
      message: `Timesheet calculation completed for ${results.length} employees`,
      results: results.map(r => ({
        employeeName: r.employeeName,
        totalHours: r.totalHours,
        overtimeHours: r.overtimeHours,
      })),
    });
  } catch (error) {
    console.error('Manual timesheet calculation error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to trigger manual timesheet calculation',
    usage: 'POST with optional { "weekStart": "2025-01-20" } in body',
  });
}
