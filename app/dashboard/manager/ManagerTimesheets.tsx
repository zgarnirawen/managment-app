'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Download, Calendar, Users, AlertTriangle, Filter, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';

interface TimesheetSummary {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  period: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  dailyTimesheets?: Array<{
    date: string;
    totalHours: number;
    regularHours: number;
    overtimeHours: number;
    entries: Array<{
      id: string;
      type: string;
      timestamp: string;
      notes?: string;
    }>;
  }>;
}

const fetchManagerTimesheets = async (
  period: string, 
  weekStart?: string, 
  monthStart?: string
): Promise<TimesheetSummary[]> => {
  const params = new URLSearchParams({
    period,
    ...(weekStart && { weekStart }),
    ...(monthStart && { monthStart }),
  });
  
  const response = await fetch(`/api/timesheets?${params}`);
  if (!response.ok) throw new Error('Failed to fetch timesheets');
  return response.json();
};

const generateWeeklySummary = async (weekStart: string) => {
  const response = await fetch('/api/timesheets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      action: 'generate-weekly-summary',
      weekStart 
    }),
  });
  if (!response.ok) throw new Error('Failed to generate weekly summary');
  return response.json();
};

const exportAllToExcel = (timesheets: TimesheetSummary[], period: string) => {
  const workbook = XLSX.utils.book_new();
  
  // Summary sheet
  const summaryData = [
    [`Team Timesheet Report - ${period.charAt(0).toUpperCase() + period.slice(1)}`],
    ['Generated:', new Date().toLocaleString()],
    [''],
    ['Employee', 'Email', 'Total Hours', 'Regular Hours', 'Overtime Hours'],
  ];
  
  timesheets.forEach(emp => {
    summaryData.push([
      emp.employeeName,
      emp.employeeEmail,
      emp.totalHours.toString(),
      emp.regularHours.toString(),
      emp.overtimeHours.toString(),
    ]);
  });
  
  // Add totals row
  const totals = timesheets.reduce((acc, emp) => ({
    totalHours: acc.totalHours + emp.totalHours,
    regularHours: acc.regularHours + emp.regularHours,
    overtimeHours: acc.overtimeHours + emp.overtimeHours,
  }), { totalHours: 0, regularHours: 0, overtimeHours: 0 });
  
  summaryData.push(['', '', '', '', '']); // Empty row
  summaryData.push(['TOTALS', '', totals.totalHours.toString(), totals.regularHours.toString(), totals.overtimeHours.toString()]);
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Team Summary');
  
  // Individual employee sheets
  timesheets.forEach(emp => {
    if (emp.dailyTimesheets) {
      const empData = [
        [`${emp.employeeName} - Detailed Timesheet`],
        ['Email:', emp.employeeEmail],
        ['Period:', emp.period],
        [''],
        ['Date', 'Total Hours', 'Regular Hours', 'Overtime Hours', 'Entries Count'],
      ];
      
      emp.dailyTimesheets.forEach(day => {
        empData.push([
          new Date(day.date).toLocaleDateString(),
          day.totalHours.toString(),
          day.regularHours.toString(),
          day.overtimeHours.toString(),
          day.entries.length.toString(),
        ]);
      });
      
      const empSheet = XLSX.utils.aoa_to_sheet(empData);
      XLSX.utils.book_append_sheet(workbook, empSheet, emp.employeeName.substring(0, 31)); // Excel sheet name limit
    }
  });
  
  // Download file
  const fileName = `Team_Timesheet_${period}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

const getWeekStart = (date: Date) => {
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

const getMonthStart = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

export default function ManagerTimesheets() {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showOvertimeOnly, setShowOvertimeOnly] = useState(false);
  
  const queryClient = useQueryClient();
  
  const currentDate = new Date(selectedDate);
  const weekStart = period === 'weekly' ? getWeekStart(currentDate).toISOString().split('T')[0] : undefined;
  const monthStart = period === 'monthly' ? getMonthStart(currentDate).toISOString().split('T')[0] : undefined;

  const { data: timesheets = [], isLoading, error } = useQuery({
    queryKey: ['managerTimesheets', period, weekStart, monthStart],
    queryFn: () => fetchManagerTimesheets(period, weekStart, monthStart),
    refetchInterval: 60000, // Refresh every minute
  });

  const generateSummaryMutation = useMutation({
    mutationFn: (weekStart: string) => generateWeeklySummary(weekStart),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managerTimesheets'] });
    },
  });

  const filteredTimesheets = showOvertimeOnly 
    ? timesheets.filter(t => t.overtimeHours > 0)
    : timesheets;

  const handleExportAll = () => {
    exportAllToExcel(filteredTimesheets, period);
  };

  const handleGenerateWeeklySummary = () => {
    if (weekStart) {
      generateSummaryMutation.mutate(weekStart);
    }
  };

  const totalSummary = filteredTimesheets.reduce((acc, emp) => ({
    totalHours: acc.totalHours + emp.totalHours,
    regularHours: acc.regularHours + emp.regularHours,
    overtimeHours: acc.overtimeHours + emp.overtimeHours,
  }), { totalHours: 0, regularHours: 0, overtimeHours: 0 });

  const overtimeEmployees = timesheets.filter(t => t.overtimeHours > 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin mr-2" />
        <span>Loading timesheets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        Error loading timesheets: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Users className="w-6 h-6 mr-2" />
            Team Timesheets
          </h2>
          
          {overtimeEmployees.length > 0 && (
            <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {overtimeEmployees.length} employee{overtimeEmployees.length !== 1 ? 's' : ''} with overtime
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Period Toggle */}
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                period === 'weekly'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md border-l-0 border ${
                period === 'monthly'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Monthly
            </button>
          </div>

          {/* Date Picker */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          {/* Filter Toggle */}
          <Button
            onClick={() => setShowOvertimeOnly(!showOvertimeOnly)}
            variant={showOvertimeOnly ? "default" : "outline"}
            size="sm"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showOvertimeOnly ? 'Show All' : 'Overtime Only'}
          </Button>

          {/* Generate Summary (Weekly only) */}
          {period === 'weekly' && (
            <Button
              onClick={handleGenerateWeeklySummary}
              disabled={generateSummaryMutation.isPending}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${generateSummaryMutation.isPending ? 'animate-spin' : ''}`} />
              Generate Summary
            </Button>
          )}

          {/* Export Button */}
          <Button onClick={handleExportAll} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-600 font-medium">Total Employees</div>
          <div className="text-2xl font-bold text-gray-900">{filteredTimesheets.length}</div>
        </div>
        
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <div className="text-sm text-blue-600 font-medium">Total Hours</div>
          <div className="text-2xl font-bold text-blue-900">{totalSummary.totalHours.toFixed(1)}h</div>
        </div>
        
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="text-sm text-green-600 font-medium">Regular Hours</div>
          <div className="text-2xl font-bold text-green-900">{totalSummary.regularHours.toFixed(1)}h</div>
        </div>
        
        <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
          <div className="text-sm text-orange-600 font-medium">Overtime Hours</div>
          <div className="text-2xl font-bold text-orange-900 flex items-center">
            {totalSummary.overtimeHours.toFixed(1)}h
            {totalSummary.overtimeHours > 0 && (
              <AlertTriangle className="w-5 h-5 ml-2 text-orange-600" />
            )}
          </div>
        </div>
      </div>

      {/* Timesheets Table */}
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Employee Timesheets</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Regular Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overtime
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTimesheets.map((employee) => (
                <tr key={employee.employeeId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{employee.employeeName}</div>
                      <div className="text-sm text-gray-500">{employee.employeeEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{employee.totalHours.toFixed(1)}h</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.regularHours.toFixed(1)}h</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${
                        employee.overtimeHours > 0 ? 'text-orange-600' : 'text-gray-900'
                      }`}>
                        {employee.overtimeHours.toFixed(1)}h
                      </span>
                      {employee.overtimeHours > 0 && (
                        <AlertTriangle className="w-4 h-4 ml-1 text-orange-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {employee.dailyTimesheets && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{employee.employeeName} - Detailed Timesheet</DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                              <div className="bg-blue-50 rounded p-3">
                                <div className="text-xs text-blue-600">Total Hours</div>
                                <div className="text-lg font-bold text-blue-900">{employee.totalHours.toFixed(1)}h</div>
                              </div>
                              <div className="bg-green-50 rounded p-3">
                                <div className="text-xs text-green-600">Regular Hours</div>
                                <div className="text-lg font-bold text-green-900">{employee.regularHours.toFixed(1)}h</div>
                              </div>
                              <div className="bg-orange-50 rounded p-3">
                                <div className="text-xs text-orange-600">Overtime Hours</div>
                                <div className="text-lg font-bold text-orange-900">{employee.overtimeHours.toFixed(1)}h</div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              {employee.dailyTimesheets.map((day) => (
                                <div key={day.date} className="border rounded p-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <div className="font-medium">
                                      {new Date(day.date).toLocaleDateString('en-US', { 
                                        weekday: 'long', 
                                        month: 'short', 
                                        day: 'numeric' 
                                      })}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {day.totalHours.toFixed(1)}h total
                                      {day.overtimeHours > 0 && (
                                        <span className="text-orange-600 ml-2">
                                          (+{day.overtimeHours.toFixed(1)}h OT)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="text-sm text-gray-500">
                                    {day.entries.length} time entries
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredTimesheets.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No timesheets found for the selected criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
