'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Clock, MapPin, Coffee, LogOut, Activity } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  clockInTime: string;
  clockOutTime?: string;
  totalHours?: number;
  status: string;
  location?: string;
  notes?: string;
}

export default function TimeTrackingWidget() {
  const { user } = useUser();
  const [currentAttendance, setCurrentAttendance] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState('Office');
  const [notes, setNotes] = useState('');
  const [todayHours, setTodayHours] = useState(0);

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/attendance?startDate=${today}&endDate=${today}`);
      const data = await response.json();
      
      if (data.attendance && data.attendance.length > 0) {
        const record = data.attendance[0];
        setCurrentAttendance(record);
        if (record.totalHours) {
          setTodayHours(record.totalHours);
        }
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleClockAction = async (action: 'clockIn' | 'clockOut') => {
    setLoading(true);
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          location,
          notes
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setCurrentAttendance(data.attendance);
        if (action === 'clockOut' && data.attendance.totalHours) {
          setTodayHours(data.attendance.totalHours);
        }
        setNotes('');
        fetchTodayAttendance(); // Refresh data
      } else {
        alert(data.error || 'Failed to update attendance');
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert('Failed to update attendance');
    } finally {
      setLoading(false);
    }
  };

  const isCheckedIn = currentAttendance && !currentAttendance.clockOutTime;
  const currentTime = new Date().toLocaleTimeString();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Time Tracking
        </h3>
        <div className="text-sm text-gray-500">{currentTime}</div>
      </div>

      {/* Current Status */}
      <div className="mb-6">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
          isCheckedIn 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          <Activity className="w-4 h-4" />
          {isCheckedIn ? 'Checked In' : 'Checked Out'}
        </div>
        
        {currentAttendance && (
          <div className="mt-2 text-sm text-gray-600">
            {isCheckedIn ? (
              <p>Clocked in at {new Date(currentAttendance.clockInTime).toLocaleTimeString()}</p>
            ) : (
              <p>Today's total: {todayHours.toFixed(2)} hours</p>
            )}
          </div>
        )}
      </div>

      {/* Location Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="w-4 h-4 inline mr-1" />
          Location
        </label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
        >
          <option value="Office">Office</option>
          <option value="Home">Work from Home</option>
          <option value="Client Site">Client Site</option>
          <option value="Field Work">Field Work</option>
        </select>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about your work today..."
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={2}
          disabled={loading}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!isCheckedIn ? (
          <button
            onClick={() => handleClockAction('clockIn')}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Clock className="w-4 h-4" />
            {loading ? 'Clocking In...' : 'Clock In'}
          </button>
        ) : (
          <button
            onClick={() => handleClockAction('clockOut')}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {loading ? 'Clocking Out...' : 'Clock Out'}
          </button>
        )}
        
        <button
          onClick={fetchTodayAttendance}
          disabled={loading}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Today's Summary */}
      {todayHours > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700 font-medium">Today's Hours:</span>
            <span className="text-blue-900 font-bold">{todayHours.toFixed(2)}h</span>
          </div>
          <div className="mt-1 text-xs text-blue-600">
            {todayHours >= 8 ? '✅ Full day completed' : `${(8 - todayHours).toFixed(2)}h remaining`}
          </div>
        </div>
      )}
    </div>
  );
}
