'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Check, X, Eye, Calendar, Clock, Coffee, LogIn, LogOut, Filter } from 'lucide-react';

interface TimeEntry {
  id: string;
  type: 'CLOCK_IN' | 'CLOCK_OUT' | 'BREAK_START' | 'BREAK_END';
  timestamp: string;
  approved: boolean;
  notes?: string;
  employee: {
    id: string;
    name: string;
    email: string;
  };
}

interface EmployeeTimeSheet {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  totalHours: string;
  entries: TimeEntry[];
  pendingApproval: number;
}

// API functions
const fetchTimeEntries = async (filters: { 
  startDate?: string; 
  endDate?: string; 
  employeeId?: string; 
  approved?: boolean;
}): Promise<TimeEntry[]> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, value.toString());
  });
  
  const response = await fetch(`/api/time-entries?${params}`);
  if (!response.ok) throw new Error('Failed to fetch time entries');
  return response.json();
};

const updateTimeEntryApproval = async ({ id, approved }: { id: string; approved: boolean }) => {
  const response = await fetch(`/api/time-entries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approved }),
  });
  if (!response.ok) throw new Error('Failed to update approval status');
  return response.json();
};

const calculateTotalHours = (entries: TimeEntry[]) => {
  let totalMinutes = 0;
  let clockInTime: Date | null = null;
  let onBreak = false;
  let breakStartTime: Date | null = null;

  entries
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .forEach(entry => {
      const entryTime = new Date(entry.timestamp);
      
      switch (entry.type) {
        case 'CLOCK_IN':
          clockInTime = entryTime;
          break;
        case 'BREAK_START':
          if (clockInTime && !onBreak) {
            totalMinutes += (entryTime.getTime() - clockInTime.getTime()) / (1000 * 60);
            onBreak = true;
            breakStartTime = entryTime;
          }
          break;
        case 'BREAK_END':
          if (onBreak && breakStartTime) {
            clockInTime = entryTime;
            onBreak = false;
          }
          break;
        case 'CLOCK_OUT':
          if (clockInTime && !onBreak) {
            totalMinutes += (entryTime.getTime() - clockInTime.getTime()) / (1000 * 60);
            clockInTime = null;
          }
          break;
      }
    });

  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  return `${hours}h ${minutes}m`;
};

const getTimeTypeDisplay = (type: string) => {
  switch (type) {
    case 'CLOCK_IN': return { label: 'Clock In', icon: LogIn, color: 'text-green-600' };
    case 'CLOCK_OUT': return { label: 'Clock Out', icon: LogOut, color: 'text-red-600' };
    case 'BREAK_START': return { label: 'Break Start', icon: Coffee, color: 'text-orange-600' };
    case 'BREAK_END': return { label: 'Break End', icon: Coffee, color: 'text-blue-600' };
    default: return { label: type, icon: Clock, color: 'text-gray-600' };
  }
};

const groupEntriesByEmployee = (entries: TimeEntry[]): EmployeeTimeSheet[] => {
  const grouped = entries.reduce((acc, entry) => {
    const key = entry.employee.id;
    if (!acc[key]) {
      acc[key] = {
        employeeId: entry.employee.id,
        employeeName: entry.employee.name,
        employeeEmail: entry.employee.email,
        entries: [],
        pendingApproval: 0,
      };
    }
    acc[key].entries.push(entry);
    if (!entry.approved) {
      acc[key].pendingApproval++;
    }
    return acc;
  }, {} as Record<string, Omit<EmployeeTimeSheet, 'totalHours'>>);

  return Object.values(grouped).map(sheet => ({
    ...sheet,
    totalHours: calculateTotalHours(sheet.entries),
  }));
};

export default function ManagerTimeApproval() {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 7 days
    endDate: new Date().toISOString().split('T')[0],
  });
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ['timeEntries', 'manager', dateRange, selectedEmployee, showPendingOnly],
    queryFn: () => fetchTimeEntries({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      employeeId: selectedEmployee || undefined,
      approved: showPendingOnly ? false : undefined,
    }),
  });

  const approvalMutation = useMutation({
    mutationFn: updateTimeEntryApproval,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    },
  });

  const employeeSheets = groupEntriesByEmployee(timeEntries);
  const totalPendingApprovals = employeeSheets.reduce((sum, sheet) => sum + sheet.pendingApproval, 0);

  const handleApproval = (entryId: string, approved: boolean) => {
    approvalMutation.mutate({ id: entryId, approved });
  };

  const handleBulkApproval = (entries: TimeEntry[], approved: boolean) => {
    entries
      .filter(entry => !entry.approved)
      .forEach(entry => {
        approvalMutation.mutate({ id: entry.id, approved });
      });
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Time Entry Approvals</h2>
          {totalPendingApprovals > 0 && (
            <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
              {totalPendingApprovals} pending approval{totalPendingApprovals !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">All Employees</option>
              {employeeSheets.map(sheet => (
                <option key={sheet.employeeId} value={sheet.employeeId}>
                  {sheet.employeeName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={() => setShowPendingOnly(!showPendingOnly)}
              variant={showPendingOnly ? "default" : "outline"}
              className="w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showPendingOnly ? 'Show All' : 'Pending Only'}
            </Button>
          </div>
        </div>
      </div>

      {/* Employee Time Sheets */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Loading time entries...</div>
        ) : employeeSheets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No time entries found for the selected criteria.
          </div>
        ) : (
          employeeSheets.map((sheet) => (
            <div key={sheet.employeeId} className="bg-white rounded-lg border">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{sheet.employeeName}</h3>
                    <p className="text-sm text-gray-600">{sheet.employeeEmail}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Total Hours</div>
                      <div className="font-semibold">{sheet.totalHours}</div>
                    </div>
                    {sheet.pendingApproval > 0 && (
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Pending</div>
                        <div className="font-semibold text-orange-600">{sheet.pendingApproval}</div>
                      </div>
                    )}
                    <div className="flex space-x-2">
                      {sheet.pendingApproval > 0 && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleBulkApproval(sheet.entries, true)}
                            disabled={approvalMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve All
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleBulkApproval(sheet.entries, false)}
                            disabled={approvalMutation.isPending}
                          >
                            Reject All
                          </Button>
                        </>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{sheet.employeeName} - Time Entries</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-3">
                            {sheet.entries
                              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                              .map((entry) => {
                                const { label, icon: Icon, color } = getTimeTypeDisplay(entry.type);
                                return (
                                  <div
                                    key={entry.id}
                                    className={`border rounded-lg p-3 ${!entry.approved ? 'border-orange-200 bg-orange-50' : 'border-gray-200'}`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <Icon className={`w-4 h-4 ${color}`} />
                                        <div>
                                          <div className="font-medium">{label}</div>
                                          <div className="text-sm text-gray-500">
                                            {new Date(entry.timestamp).toLocaleString()}
                                          </div>
                                          {entry.notes && (
                                            <div className="text-sm text-gray-600 mt-1">{entry.notes}</div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        {entry.approved ? (
                                          <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                            Approved
                                          </div>
                                        ) : (
                                          <div className="flex space-x-1">
                                            <Button
                                              size="sm"
                                              onClick={() => handleApproval(entry.id, true)}
                                              disabled={approvalMutation.isPending}
                                              className="bg-green-600 hover:bg-green-700 h-8 px-2"
                                            >
                                              <Check className="w-4 h-4" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="destructive"
                                              onClick={() => handleApproval(entry.id, false)}
                                              disabled={approvalMutation.isPending}
                                              className="h-8 px-2"
                                            >
                                              <X className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recent Entries Preview */}
              <div className="p-4">
                <div className="space-y-2">
                  {sheet.entries
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 3)
                    .map((entry) => {
                      const { label, icon: Icon, color } = getTimeTypeDisplay(entry.type);
                      return (
                        <div key={entry.id} className="flex items-center justify-between py-1">
                          <div className="flex items-center space-x-2">
                            <Icon className={`w-3 h-3 ${color}`} />
                            <span className="text-sm">{label}</span>
                            {entry.notes && (
                              <span className="text-xs text-gray-500">- {entry.notes}</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {new Date(entry.timestamp).toLocaleString()}
                            </span>
                            {!entry.approved && (
                              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  {sheet.entries.length > 3 && (
                    <div className="text-xs text-gray-500 text-center pt-2">
                      ... and {sheet.entries.length - 3} more entries
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
