// Timesheet calculation utilities
import { prisma } from './prisma';

export interface DailyTimesheet {
  date: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  entries: {
    id: string;
    type: 'CLOCK_IN' | 'CLOCK_OUT' | 'BREAK_START' | 'BREAK_END';
    timestamp: Date;
    notes?: string;
  }[];
}

export interface WeeklyTimesheet {
  weekStart: Date;
  weekEnd: Date;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  dailyBreakdown: DailyTimesheet[];
}

export interface TimesheetSummary {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  period: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  dailyTimesheets?: DailyTimesheet[];
}

/**
 * Calculate total working hours for a specific day from time entries
 */
export function calculateDailyHours(entries: Array<{
  type: 'CLOCK_IN' | 'CLOCK_OUT' | 'BREAK_START' | 'BREAK_END';
  createdAt: Date;
}>): { totalHours: number; regularHours: number; overtimeHours: number } {
  // Sort entries by createdAt
  const sortedEntries = entries.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  
  let totalMinutes = 0;
  let clockInTime: Date | null = null;
  let onBreak = false;
  let breakStartTime: Date | null = null;
  
  for (const entry of sortedEntries) {
    const entryTime = entry.createdAt;
    
    switch (entry.type) {
      case 'CLOCK_IN':
        clockInTime = entryTime;
        onBreak = false;
        break;
        
      case 'BREAK_START':
        if (clockInTime && !onBreak) {
          // Add working time before break
          totalMinutes += (entryTime.getTime() - clockInTime.getTime()) / (1000 * 60);
          onBreak = true;
          breakStartTime = entryTime;
        }
        break;
        
      case 'BREAK_END':
        if (onBreak && breakStartTime) {
          // Resume working from break end time
          clockInTime = entryTime;
          onBreak = false;
          breakStartTime = null;
        }
        break;
        
      case 'CLOCK_OUT':
        if (clockInTime && !onBreak) {
          // Add final working period
          totalMinutes += (entryTime.getTime() - clockInTime.getTime()) / (1000 * 60);
          clockInTime = null;
        }
        break;
    }
  }
  
  const totalHours = totalMinutes / 60;
  const regularHours = Math.min(totalHours, 8); // Standard 8-hour workday
  const overtimeHours = Math.max(0, totalHours - 8);
  
  return {
    totalHours: Math.round(totalHours * 100) / 100, // Round to 2 decimal places
    regularHours: Math.round(regularHours * 100) / 100,
    overtimeHours: Math.round(overtimeHours * 100) / 100,
  };
}

/**
 * Get start and end of week for a given date
 */
export function getWeekBounds(date: Date): { weekStart: Date; weekEnd: Date } {
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
  weekEnd.setHours(23, 59, 59, 999);
  
  return { weekStart, weekEnd };
}

/**
 * Calculate daily timesheet for an employee
 */
export async function calculateDailyTimesheet(
  employeeId: string,
  date: Date
): Promise<DailyTimesheet> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const entries = await prisma.timeEntry.findMany({
    where: {
      employeeId,
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
  
  const { totalHours, regularHours, overtimeHours } = calculateDailyHours(entries);
  
  return {
    date: date.toISOString().split('T')[0],
    totalHours,
    regularHours,
    overtimeHours,
    entries: entries.map(entry => ({
      id: entry.id,
      type: entry.type as 'CLOCK_IN' | 'CLOCK_OUT' | 'BREAK_START' | 'BREAK_END',
      timestamp: entry.createdAt,
      notes: entry.notes || undefined,
    })),
  };
}

/**
 * Calculate weekly timesheet for an employee
 */
export async function calculateWeeklyTimesheet(
  employeeId: string,
  weekStart: Date
): Promise<WeeklyTimesheet> {
  const { weekEnd } = getWeekBounds(weekStart);
  
  const dailyTimesheets: DailyTimesheet[] = [];
  let totalHours = 0;
  let totalRegularHours = 0;
  let totalOvertimeHours = 0;
  
  // Calculate for each day of the week
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(weekStart);
    currentDate.setDate(weekStart.getDate() + i);
    
    const dailyTimesheet = await calculateDailyTimesheet(employeeId, currentDate);
    dailyTimesheets.push(dailyTimesheet);
    
    totalHours += dailyTimesheet.totalHours;
    totalRegularHours += dailyTimesheet.regularHours;
    totalOvertimeHours += dailyTimesheet.overtimeHours;
  }
  
  return {
    weekStart,
    weekEnd,
    totalHours: Math.round(totalHours * 100) / 100,
    regularHours: Math.round(totalRegularHours * 100) / 100,
    overtimeHours: Math.round(totalOvertimeHours * 100) / 100,
    dailyBreakdown: dailyTimesheets,
  };
}

/**
 * Save weekly summary to database
 */
export async function saveWeeklySummary(
  employeeId: string,
  weeklyTimesheet: WeeklyTimesheet
): Promise<void> {
  await prisma.weeklySummary.upsert({
    where: {
      employeeId_weekStart: {
        employeeId,
        weekStart: weeklyTimesheet.weekStart,
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
      weekStart: weeklyTimesheet.weekStart,
      weekEnd: weeklyTimesheet.weekEnd,
      totalHours: weeklyTimesheet.totalHours,
      regularHours: weeklyTimesheet.regularHours,
      overtimeHours: weeklyTimesheet.overtimeHours,
    },
  });
}

/**
 * Calculate timesheet summaries for all employees for a given week
 */
export async function calculateAllEmployeeTimesheets(weekStart: Date): Promise<TimesheetSummary[]> {
  const employees = await prisma.employee.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
  
  const summaries: TimesheetSummary[] = [];
  
  for (const employee of employees) {
    const weeklyTimesheet = await calculateWeeklyTimesheet(employee.id, weekStart);
    
    // Save to database
    await saveWeeklySummary(employee.id, weeklyTimesheet);
    
    summaries.push({
      employeeId: employee.id,
      employeeName: employee.name,
      employeeEmail: employee.email,
      period: `${weeklyTimesheet.weekStart.toISOString().split('T')[0]} to ${weeklyTimesheet.weekEnd.toISOString().split('T')[0]}`,
      totalHours: weeklyTimesheet.totalHours,
      regularHours: weeklyTimesheet.regularHours,
      overtimeHours: weeklyTimesheet.overtimeHours,
      dailyTimesheets: weeklyTimesheet.dailyBreakdown,
    });
  }
  
  return summaries;
}
