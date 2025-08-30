import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { 
  calculateDailyTimesheet, 
  calculateWeeklyTimesheet, 
  calculateAllEmployeeTimesheets,
  getWeekBounds,
  TimesheetSummary 
} from '../../lib/timesheet-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const period = searchParams.get('period') || 'weekly'; // daily, weekly, monthly
    const date = searchParams.get('date');
    const weekStart = searchParams.get('weekStart');
    const monthStart = searchParams.get('monthStart');
    
    // If no specific date provided, use current date
    const targetDate = date ? new Date(date) : new Date();
    
    if (employeeId) {
      // Get timesheet for specific employee
      if (period === 'daily') {
        const dailyTimesheet = await calculateDailyTimesheet(employeeId, targetDate);
        return NextResponse.json(dailyTimesheet);
      } else if (period === 'weekly') {
        const weekStartDate = weekStart ? new Date(weekStart) : getWeekBounds(targetDate).weekStart;
        const weeklyTimesheet = await calculateWeeklyTimesheet(employeeId, weekStartDate);
        return NextResponse.json(weeklyTimesheet);
      } else if (period === 'monthly') {
        // Calculate monthly summary by getting all weeks in the month
        const monthStartDate = monthStart ? new Date(monthStart) : new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        const monthEndDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
        
        const weeklySummaries = await prisma.weeklySummary.findMany({
          where: {
            employeeId,
            weekStart: {
              gte: monthStartDate,
              lte: monthEndDate,
            },
          },
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            weekStart: 'asc',
          },
        });
        
        const monthlyTotal = weeklySummaries.reduce(
          (acc, summary) => ({
            totalHours: acc.totalHours + summary.totalHours,
            regularHours: acc.regularHours + summary.regularHours,
            overtimeHours: acc.overtimeHours + summary.overtimeHours,
          }),
          { totalHours: 0, regularHours: 0, overtimeHours: 0 }
        );
        
        return NextResponse.json({
          employeeId,
          period: 'monthly',
          monthStart: monthStartDate,
          monthEnd: monthEndDate,
          ...monthlyTotal,
          weeklySummaries,
        });
      }
    } else {
      // Get timesheets for all employees
      if (period === 'weekly') {
        const weekStartDate = weekStart ? new Date(weekStart) : getWeekBounds(targetDate).weekStart;
        const allTimesheets = await calculateAllEmployeeTimesheets(weekStartDate);
        return NextResponse.json(allTimesheets);
      } else if (period === 'monthly') {
        // Get monthly summaries for all employees
        const monthStartDate = monthStart ? new Date(monthStart) : new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        const monthEndDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
        
        const employees = await prisma.employee.findMany({
          select: {
            id: true,
            name: true,
            email: true,
          },
        });
        
        const monthlyTimesheets: TimesheetSummary[] = [];
        
        for (const employee of employees) {
          const weeklySummaries = await prisma.weeklySummary.findMany({
            where: {
              employeeId: employee.id,
              weekStart: {
                gte: monthStartDate,
                lte: monthEndDate,
              },
            },
            orderBy: {
              weekStart: 'asc',
            },
          });
          
          const monthlyTotal = weeklySummaries.reduce(
            (acc, summary) => ({
              totalHours: acc.totalHours + summary.totalHours,
              regularHours: acc.regularHours + summary.regularHours,
              overtimeHours: acc.overtimeHours + summary.overtimeHours,
            }),
            { totalHours: 0, regularHours: 0, overtimeHours: 0 }
          );
          
          monthlyTimesheets.push({
            employeeId: employee.id,
            employeeName: employee.name,
            employeeEmail: employee.email,
            period: `${monthStartDate.toISOString().split('T')[0]} to ${monthEndDate.toISOString().split('T')[0]}`,
            ...monthlyTotal,
          });
        }
        
        return NextResponse.json(monthlyTimesheets);
      }
    }
    
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  } catch (error) {
    console.error('GET /api/timesheets error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action, weekStart, employeeId } = await request.json();
    
    if (action === 'generate-weekly-summary') {
      const weekStartDate = weekStart ? new Date(weekStart) : getWeekBounds(new Date()).weekStart;
      
      if (employeeId) {
        // Generate for specific employee
        const weeklyTimesheet = await calculateWeeklyTimesheet(employeeId, weekStartDate);
        
        const summary = await prisma.weeklySummary.upsert({
          where: {
            employeeId_weekStart: {
              employeeId,
              weekStart: weekStartDate,
            },
          },
          update: {
            weekEnd: weeklyTimesheet.weekEnd,
            totalHours: weeklyTimesheet.totalHours,
            regularHours: weeklyTimesheet.regularHours,
            overtimeHours: weeklyTimesheet.overtimeHours,
          },
          create: {
            employeeId,
            weekStart: weekStartDate,
            weekEnd: weeklyTimesheet.weekEnd,
            totalHours: weeklyTimesheet.totalHours,
            regularHours: weeklyTimesheet.regularHours,
            overtimeHours: weeklyTimesheet.overtimeHours,
          },
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });
        
        return NextResponse.json(summary);
      } else {
        // Generate for all employees
        const summaries = await calculateAllEmployeeTimesheets(weekStartDate);
        return NextResponse.json(summaries);
      }
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/timesheets error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
