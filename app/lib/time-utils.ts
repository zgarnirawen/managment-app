/**
 * Time utility functions for formatting and calculations
 */

/**
 * Format duration in seconds to human readable format
 * @param seconds Duration in seconds
 * @returns Formatted string (e.g., "2h 30m", "45m", "1h 5m 30s")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts: string[] = [];
  
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  
  // Only show seconds if less than 1 hour, or if it's the only unit
  if ((hours === 0 && minutes === 0) || (hours === 0 && remainingSeconds > 0)) {
    parts.push(`${remainingSeconds}s`);
  }
  
  return parts.join(' ') || '0s';
}

/**
 * Format time to 12-hour format with AM/PM
 * @param date Date object to format
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format time to 24-hour format
 * @param date Date object to format
 * @returns Formatted time string (e.g., "14:30")
 */
export function formatTime24(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Format date to readable format
 * @param date Date object to format
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format datetime to readable format
 * @param date Date object to format
 * @returns Formatted datetime string (e.g., "Jan 15, 2024 at 2:30 PM")
 */
export function formatDateTime(date: Date): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

/**
 * Calculate duration between two dates in seconds
 * @param startDate Start date
 * @param endDate End date
 * @returns Duration in seconds
 */
export function calculateDuration(startDate: Date, endDate: Date): number {
  return Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
}

/**
 * Convert seconds to hours with decimal places
 * @param seconds Duration in seconds
 * @returns Hours as decimal (e.g., 1.5 for 1 hour 30 minutes)
 */
export function secondsToHours(seconds: number): number {
  return Math.round((seconds / 3600) * 100) / 100;
}

/**
 * Convert hours to seconds
 * @param hours Hours as decimal
 * @returns Duration in seconds
 */
export function hoursToSeconds(hours: number): number {
  return Math.floor(hours * 3600);
}

/**
 * Get start of day for a given date
 * @param date Date object
 * @returns Start of day (00:00:00)
 */
export function getStartOfDay(date: Date): Date {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
}

/**
 * Get end of day for a given date
 * @param date Date object
 * @returns End of day (23:59:59.999)
 */
export function getEndOfDay(date: Date): Date {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
}

/**
 * Check if two dates are on the same day
 * @param date1 First date
 * @param date2 Second date
 * @returns True if same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Get current week start and end dates
 * @param date Reference date (defaults to today)
 * @returns Object with start and end dates of the week
 */
export function getCurrentWeek(date = new Date()): { start: Date; end: Date } {
  const start = new Date(date);
  const dayOfWeek = start.getDay();
  const diff = start.getDate() - dayOfWeek; // Sunday as first day
  
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Get current month start and end dates
 * @param date Reference date (defaults to today)
 * @returns Object with start and end dates of the month
 */
export function getCurrentMonth(date = new Date()): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Calculate overtime hours based on standard work hours
 * @param totalHours Total hours worked
 * @param standardHours Standard work hours (default 8)
 * @returns Overtime hours
 */
export function calculateOvertime(totalHours: number, standardHours = 8): number {
  return Math.max(0, totalHours - standardHours);
}

/**
 * Format duration for display in timesheet
 * @param seconds Duration in seconds
 * @returns Formatted duration (e.g., "8.5" for 8 hours 30 minutes)
 */
export function formatTimesheetDuration(seconds: number): string {
  const hours = secondsToHours(seconds);
  return hours.toFixed(2);
}

/**
 * Parse time string to minutes from midnight
 * @param timeString Time in HH:MM format
 * @returns Minutes from midnight
 */
export function parseTimeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Format minutes from midnight to time string
 * @param minutes Minutes from midnight
 * @returns Time in HH:MM format
 */
export function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
