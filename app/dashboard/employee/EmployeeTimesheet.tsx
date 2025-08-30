'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { Clock, Download, Calendar, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface DailyTimesheet {
  date: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  entries: Array<{
    id: string;
    type: 'CLOCK_IN' | 'CLOCK_OUT' | 'BREAK_START' | 'BREAK_END';
    timestamp: string;
    notes?: string;
  }>;
}

interface WeeklyTimesheet {
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  dailyBreakdown: DailyTimesheet[];
}

interface EmployeeTimesheetProps {
  employeeId: string;
}

const fetchEmployeeTimesheet = async (employeeId: string, period: string, date?: string): Promise<WeeklyTimesheet | DailyTimesheet> => {
  const params = new URLSearchParams({
    employeeId,
    period,
    ...(date && { date }),
  });
  
  const response = await fetch(`/api/timesheets?${params}`);
  if (!response.ok) throw new Error('Failed to fetch timesheet');
  return response.json();
};

const getTimeTypeIcon = (type: string) => {
  switch (type) {
    case 'CLOCK_IN': return '🟢';
    case 'CLOCK_OUT': return '🔴';
    case 'BREAK_START': return '☕';
    case 'BREAK_END': return '🔄';
    default: return '⏰';
  }
};

const exportToExcel = (timesheetData: WeeklyTimesheet, employeeName: string) => {
  const workbook = XLSX.utils.book_new();
  
  // Summary sheet
  const summaryData = [
    ['Employee Timesheet Summary'],
    ['Employee:', employeeName],
    ['Week:', `${new Date(timesheetData.weekStart).toLocaleDateString()} - ${new Date(timesheetData.weekEnd).toLocaleDateString()}`],
    [''],
    ['Total Hours:', timesheetData.totalHours],
    ['Regular Hours:', timesheetData.regularHours],
    ['Overtime Hours:', timesheetData.overtimeHours],
    [''],
    ['Daily Breakdown:'],
    ['Date', 'Total Hours', 'Regular Hours', 'Overtime Hours'],
  ];
  
  timesheetData.dailyBreakdown.forEach(day => {
    summaryData.push([
      new Date(day.date).toLocaleDateString(),
      day.totalHours,
      day.regularHours,
      day.overtimeHours,
    ]);
  });
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  // Detailed entries sheet
  const detailData = [
    ['Daily Time Entries'],
    ['Date', 'Time', 'Action', 'Notes'],
  ];
  
  timesheetData.dailyBreakdown.forEach(day => {
    day.entries.forEach(entry => {
      detailData.push([
        new Date(entry.timestamp).toLocaleDateString(),
        new Date(entry.timestamp).toLocaleTimeString(),
        entry.type.replace('_', ' '),
        entry.notes || '',
      ]);
    });
  });
  
  const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
  XLSX.utils.book_append_sheet(workbook, detailSheet, 'Detailed Entries');
  
  // Download file
  const fileName = `${employeeName}_Timesheet_${new Date(timesheetData.weekStart).toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export default function EmployeeTimesheet({ employeeId }: EmployeeTimesheetProps) {
  const [period, setPeriod] = useState<'daily' | 'weekly'>('weekly');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const { data: timesheetData, isLoading, error } = useQuery({
    queryKey: ['employeeTimesheet', employeeId, period, selectedDate],
    queryFn: () => fetchEmployeeTimesheet(employeeId, period, selectedDate),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleExport = () => {
    if (timesheetData && 'dailyBreakdown' in timesheetData) {
      exportToExcel(timesheetData, 'Employee'); // In real app, get employee name from context
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Clock className="w-8 h-8 animate-spin mr-2" />
        <span>Loading timesheet...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        Error loading timesheet: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            My Timesheet
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => setPeriod('daily')}
                className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                  period === 'daily'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setPeriod('weekly')}
                className={`px-4 py-2 text-sm font-medium rounded-r-md border-l-0 border ${
                  period === 'weekly'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Weekly
              </button>
            </div>
            
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            
            {period === 'weekly' && timesheetData && 'dailyBreakdown' in timesheetData && (
              <Button onClick={handleExport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Timesheet Summary */}
      {timesheetData && (
        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-lg font-semibold mb-4">
            {period === 'weekly' && 'dailyBreakdown' in timesheetData ? 'Weekly Summary' : 'Daily Summary'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium">Total Hours</div>
              <div className="text-2xl font-bold text-blue-900">{timesheetData.totalHours}h</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium">Regular Hours</div>
              <div className="text-2xl font-bold text-green-900">{timesheetData.regularHours}h</div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-sm text-orange-600 font-medium">Overtime Hours</div>
              <div className="text-2xl font-bold text-orange-900 flex items-center">
                {timesheetData.overtimeHours}h
                {timesheetData.overtimeHours > 0 && (
                  <AlertTriangle className="w-5 h-5 ml-2 text-orange-600" />
                )}
              </div>
            </div>
          </div>

          {/* Overtime Alert */}
          {timesheetData.overtimeHours > 0 && (
            <div className="bg-orange-100 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                <span className="text-orange-800 font-medium">
                  You worked {timesheetData.overtimeHours} hours of overtime this {period}.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Daily Breakdown (for weekly view) */}
      {period === 'weekly' && timesheetData && 'dailyBreakdown' in timesheetData && (
        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-lg font-semibold mb-4">Daily Breakdown</h4>
          
          <div className="space-y-4">
            {timesheetData.dailyBreakdown.map((day) => (
              <div key={day.date} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-medium">
                    {new Date(day.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-blue-600">{day.totalHours}h total</span>
                    {day.overtimeHours > 0 && (
                      <span className="text-orange-600 font-medium">+{day.overtimeHours}h OT</span>
                    )}
                  </div>
                </div>
                
                {day.entries.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    {day.entries.map((entry) => (
                      <div key={entry.id} className="flex items-center space-x-2 text-sm">
                        <span>{getTimeTypeIcon(entry.type)}</span>
                        <span className="font-medium">{entry.type.replace('_', ' ')}</span>
                        <span className="text-gray-500">
                          {new Date(entry.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">No time entries for this day</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Entries (for daily view) */}
      {period === 'daily' && timesheetData && 'entries' in timesheetData && (
        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-lg font-semibold mb-4">Time Entries</h4>
          
          {timesheetData.entries.length > 0 ? (
            <div className="space-y-3">
              {timesheetData.entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getTimeTypeIcon(entry.type)}</span>
                    <div>
                      <div className="font-medium">{entry.type.replace('_', ' ')}</div>
                      {entry.notes && (
                        <div className="text-sm text-gray-500">{entry.notes}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(entry.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No time entries for this day.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
