import cron from 'node-cron';
import { calculateAllEmployeeTimesheets, getWeekBounds } from '../lib/timesheet-utils';

// Flag to track if cron job is initialized
let cronJobInitialized = false;

/**
 * Initialize the weekly timesheet calculation cron job
 * Runs every Monday at 1:00 AM to calculate the previous week's timesheets
 */
export function initializeTimesheetCronJob() {
  if (cronJobInitialized) {
    console.log('⏰ Timesheet cron job already initialized');
    return;
  }

  // Schedule to run every Monday at 1:00 AM
  cron.schedule('0 1 * * 1', async () => {
    console.log('🕐 Running weekly timesheet calculation cron job...');
    
    try {
      // Calculate for the previous week (week that just ended)
      const today = new Date();
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 7);
      
      const { weekStart } = getWeekBounds(lastWeek);
      
      console.log(`📊 Calculating timesheets for week starting: ${weekStart.toISOString()}`);
      
      const timesheetSummaries = await calculateAllEmployeeTimesheets(weekStart);
      
      console.log(`✅ Successfully processed timesheets for ${timesheetSummaries.length} employees`);
      console.log('📈 Summary:');
      
      timesheetSummaries.forEach((summary) => {
        console.log(`  - ${summary.employeeName}: ${summary.totalHours}h total (${summary.overtimeHours}h overtime)`);
      });
      
      // Log any employees with overtime
      const overtimeEmployees = timesheetSummaries.filter(s => s.overtimeHours > 0);
      if (overtimeEmployees.length > 0) {
        console.log(`⚠️  ${overtimeEmployees.length} employees worked overtime this week:`);
        overtimeEmployees.forEach((emp) => {
          console.log(`    - ${emp.employeeName}: ${emp.overtimeHours}h overtime`);
        });
      }
      
    } catch (error) {
      console.error('❌ Error in weekly timesheet cron job:', error);
    }
  });
  
  cronJobInitialized = true;
  console.log('✅ Weekly timesheet cron job initialized (runs every Monday at 1:00 AM)');
}

/**
 * Run timesheet calculation manually (for testing purposes)
 */
export async function runTimesheetCalculationManually(weekStart?: Date) {
  console.log('🧪 Running timesheet calculation manually...');
  
  try {
    const targetWeek = weekStart || getWeekBounds(new Date()).weekStart;
    console.log(`📊 Calculating timesheets for week starting: ${targetWeek.toISOString()}`);
    
    const timesheetSummaries = await calculateAllEmployeeTimesheets(targetWeek);
    
    console.log(`✅ Successfully processed timesheets for ${timesheetSummaries.length} employees`);
    
    return timesheetSummaries;
  } catch (error) {
    console.error('❌ Error in manual timesheet calculation:', error);
    throw error;
  }
}

/**
 * Get cron job status
 */
export function getCronJobStatus() {
  return {
    initialized: cronJobInitialized,
    schedule: 'Every Monday at 1:00 AM',
    description: 'Calculates weekly timesheets for all employees',
  };
}
