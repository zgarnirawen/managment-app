'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { Loader2, Clock, Coffee, LogOut, LogIn } from 'lucide-react';

interface TimeEntry {
  id: string;
  type: 'CLOCK_IN' | 'CLOCK_OUT' | 'BREAK_START' | 'BREAK_END';
  timestamp: string;
  approved: boolean;
  notes?: string;
  employee: {
    id: string;
    name: string;
  };
}

interface TimeTrackingProps {
  employeeId: string;
}

// API functions
const fetchTodayEntries = async (employeeId: string): Promise<TimeEntry[]> => {
  const today = new Date().toISOString().split('T')[0];
  const response = await fetch(`/api/time-entries?employeeId=${employeeId}&date=${today}`);
  if (!response.ok) throw new Error('Failed to fetch time entries');
  return response.json();
};

const createTimeEntry = async ({ employeeId, type, notes }: { employeeId: string; type: string; notes?: string }) => {
  const response = await fetch('/api/time-entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId, type, notes }),
  });
  if (!response.ok) throw new Error('Failed to create time entry');
  return response.json();
};

const getTimeTypeDisplay = (type: string) => {
  switch (type) {
    case 'CLOCK_IN': return { label: 'Clocked In', icon: LogIn, color: 'text-green-600' };
    case 'CLOCK_OUT': return { label: 'Clocked Out', icon: LogOut, color: 'text-red-600' };
    case 'BREAK_START': return { label: 'Break Started', icon: Coffee, color: 'text-orange-600' };
    case 'BREAK_END': return { label: 'Break Ended', icon: Coffee, color: 'text-blue-600' };
    default: return { label: type, icon: Clock, color: 'text-gray-600' };
  }
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
            clockInTime = entryTime; // Resume from break end time
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

const getCurrentStatus = (entries: TimeEntry[]) => {
  if (entries.length === 0) return 'Not clocked in';
  
  const latestEntry = entries
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  
  switch (latestEntry.type) {
    case 'CLOCK_IN': return 'Working';
    case 'CLOCK_OUT': return 'Clocked out';
    case 'BREAK_START': return 'On break';
    case 'BREAK_END': return 'Working';
    default: return 'Unknown';
  }
};

export default function EmployeeTimeTracking({ employeeId }: TimeTrackingProps) {
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: todayEntries = [], isLoading, error } = useQuery({
    queryKey: ['timeEntries', employeeId, 'today'],
    queryFn: () => fetchTodayEntries(employeeId),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const createEntryMutation = useMutation({
    mutationFn: createTimeEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries', employeeId] });
      setNotes('');
    },
  });

  const currentStatus = getCurrentStatus(todayEntries);
  const totalHours = calculateTotalHours(todayEntries);
  
  // Determine available actions based on current status
  const latestEntry = todayEntries
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  
  const canClockIn = !latestEntry || latestEntry.type === 'CLOCK_OUT';
  const canClockOut = latestEntry && (latestEntry.type === 'CLOCK_IN' || latestEntry.type === 'BREAK_END');
  const canStartBreak = latestEntry && (latestEntry.type === 'CLOCK_IN' || latestEntry.type === 'BREAK_END');
  const canEndBreak = latestEntry && latestEntry.type === 'BREAK_START';

  const handleTimeAction = (type: string) => {
    createEntryMutation.mutate({ employeeId, type, notes: notes || undefined });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading time tracking...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        Error loading time entries: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Time Tracking</h3>
          <div className="text-sm text-gray-500">
            Today&apos;s Total: <span className="font-medium text-gray-900">{totalHours}</span>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="text-sm text-gray-600">Current Status</div>
          <div className="text-xl font-medium text-gray-900">{currentStatus}</div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Button
            onClick={() => handleTimeAction('CLOCK_IN')}
            disabled={!canClockIn || createEntryMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Clock In
          </Button>
          
          <Button
            onClick={() => handleTimeAction('CLOCK_OUT')}
            disabled={!canClockOut || createEntryMutation.isPending}
            variant="destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Clock Out
          </Button>
          
          <Button
            onClick={() => handleTimeAction('BREAK_START')}
            disabled={!canStartBreak || createEntryMutation.isPending}
            variant="outline"
          >
            <Coffee className="w-4 h-4 mr-2" />
            Start Break
          </Button>
          
          <Button
            onClick={() => handleTimeAction('BREAK_END')}
            disabled={!canEndBreak || createEntryMutation.isPending}
            variant="outline"
          >
            <Coffee className="w-4 h-4 mr-2" />
            End Break
          </Button>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Add a note for this time entry..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Today's Entries */}
      <div className="bg-white rounded-lg border p-6">
        <h4 className="text-lg font-semibold mb-4">Today&apos;s Time Entries</h4>
        
        {todayEntries.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No time entries for today. Clock in to get started!
          </div>
        ) : (
          <div className="space-y-3">
            {todayEntries
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((entry) => {
                const { label, icon: Icon, color } = getTimeTypeDisplay(entry.type);
                return (
                  <div key={entry.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <div>
                        <div className="font-medium">{label}</div>
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
                );
              })
            }
          </div>
        )}
      </div>
    </div>
  );
}
