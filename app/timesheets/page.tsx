'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '../components/ui/button';
import LoadingSpinner from '../components/LoadingSpinner';

interface TimeEntry {
  id: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  breakTime: number;
  totalHours: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export default function TimesheetsPage() {
  const { user, isLoaded } = useUser();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  useEffect(() => {
    if (isLoaded) {
      fetchTimeEntries();
    }
  }, [isLoaded, selectedWeek]);

  const fetchTimeEntries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/timesheets?week=${selectedWeek.toISOString()}`);
      if (response.ok) {
        const data = await response.json();
        setTimeEntries(data.entries || []);
      }
    } catch (error) {
      console.error('Error fetching time entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestEdit = async (entryId: string, reason: string) => {
    try {
      const response = await fetch(`/api/timesheets/${entryId}/edit-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      
      if (response.ok) {
        fetchTimeEntries(); // Refresh data
      }
    } catch (error) {
      console.error('Error requesting edit:', error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400';
      case 'rejected': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  if (!isLoaded) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-nextgen-dark-gray text-nextgen-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-nextgen-teal mb-2">
            ⏰ My Timesheets
          </h1>
          <p className="text-nextgen-light-gray">
            View and manage your time entries, request edits, and track attendance
          </p>
        </div>

        {/* Week Selector */}
        <div className="mb-6 bg-nextgen-medium-gray rounded-lg p-4">
          <div className="flex items-center gap-4">
            <label className="text-nextgen-light-gray">Week of:</label>
            <input
              type="week"
              value={selectedWeek.toISOString().split('T')[0]}
              onChange={(e) => setSelectedWeek(new Date(e.target.value))}
              className="bg-nextgen-dark-blue text-nextgen-white border border-nextgen-light-gray rounded px-3 py-2"
            />
            <Button 
              onClick={fetchTimeEntries}
              className="bg-nextgen-teal hover:bg-nextgen-teal-hover"
            >
              Load Week
            </Button>
          </div>
        </div>

        {/* Time Entries Table */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-nextgen-medium-gray rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-nextgen-dark-blue">
                  <tr>
                    <th className="px-6 py-3 text-left text-nextgen-teal">Date</th>
                    <th className="px-6 py-3 text-left text-nextgen-teal">Clock In</th>
                    <th className="px-6 py-3 text-left text-nextgen-teal">Clock Out</th>
                    <th className="px-6 py-3 text-left text-nextgen-teal">Break (mins)</th>
                    <th className="px-6 py-3 text-left text-nextgen-teal">Total Hours</th>
                    <th className="px-6 py-3 text-left text-nextgen-teal">Status</th>
                    <th className="px-6 py-3 text-left text-nextgen-teal">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {timeEntries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-nextgen-light-gray">
                        No time entries found for this week
                      </td>
                    </tr>
                  ) : (
                    timeEntries.map((entry) => (
                      <tr key={entry.id} className="border-t border-nextgen-light-gray hover:bg-nextgen-dark-blue/30">
                        <td className="px-6 py-4">{formatDate(entry.date)}</td>
                        <td className="px-6 py-4">{formatTime(entry.clockIn)}</td>
                        <td className="px-6 py-4">
                          {entry.clockOut ? formatTime(entry.clockOut) : 'Not clocked out'}
                        </td>
                        <td className="px-6 py-4">{entry.breakTime}</td>
                        <td className="px-6 py-4 font-semibold">
                          {entry.totalHours.toFixed(2)}h
                        </td>
                        <td className={`px-6 py-4 font-semibold ${getStatusColor(entry.status)}`}>
                          {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                        </td>
                        <td className="px-6 py-4">
                          {entry.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const reason = prompt('Reason for edit request:');
                                if (reason) requestEdit(entry.id, reason);
                              }}
                            >
                              Request Edit
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary Card */}
        <div className="mt-6 bg-nextgen-medium-gray rounded-lg p-6">
          <h3 className="text-xl font-semibold text-nextgen-teal mb-4">Week Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-nextgen-white">
                {timeEntries.reduce((sum, entry) => sum + entry.totalHours, 0).toFixed(1)}h
              </div>
              <div className="text-nextgen-light-gray">Total Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {timeEntries.filter(e => e.status === 'approved').length}
              </div>
              <div className="text-nextgen-light-gray">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {timeEntries.filter(e => e.status === 'pending').length}
              </div>
              <div className="text-nextgen-light-gray">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {timeEntries.filter(e => e.status === 'rejected').length}
              </div>
              <div className="text-nextgen-light-gray">Rejected</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex gap-4">
          <Button className="bg-nextgen-teal hover:bg-nextgen-teal-hover">
            📥 Export Timesheet
          </Button>
          <Button variant="outline">
            ⏰ Clock In/Out
          </Button>
          <Button variant="outline">
            📊 View Reports
          </Button>
        </div>
      </div>
    </div>
  );
}
