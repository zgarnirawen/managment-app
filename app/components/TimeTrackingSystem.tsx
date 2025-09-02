// Employee Directory and Time Tracking Implementation
// This will create the core time tracking functionality

'use client'

import React, { useState, useEffect } from 'react'
import { Clock, Play, Pause, Coffee, Users, Calendar, CheckCircle, XCircle, Timer } from 'lucide-react'

interface TimeEntry {
  id: string
  employeeId: string
  date: string
  clockIn: string | null
  clockOut: string | null
  breakStart: string | null
  breakEnd: string | null
  totalHours: number
  breakHours: number
  status: 'clocked_in' | 'on_break' | 'clocked_out'
  notes?: string
}

interface Employee {
  id: string
  name: string
  email: string
  role: string
  department: string
  avatar?: string
  isActive: boolean
  currentStatus: 'clocked_in' | 'on_break' | 'clocked_out'
  todayHours: number
}

const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    role: 'Manager',
    department: 'Engineering',
    isActive: true,
    currentStatus: 'clocked_in',
    todayHours: 6.5
  },
  {
    id: '2', 
    name: 'Sarah Wilson',
    email: 'sarah.wilson@company.com',
    role: 'Employee',
    department: 'Design',
    isActive: true,
    currentStatus: 'on_break',
    todayHours: 4.2
  },
  {
    id: '3',
    name: 'Mike Brown',
    email: 'mike.brown@company.com', 
    role: 'Employee',
    department: 'Marketing',
    isActive: true,
    currentStatus: 'clocked_out',
    todayHours: 8.0
  },
  {
    id: '4',
    name: 'Emma Davis',
    email: 'emma.davis@company.com',
    role: 'Intern',
    department: 'Engineering',
    isActive: true,
    currentStatus: 'clocked_in',
    todayHours: 3.5
  }
]

interface TimeTrackingSystemProps {
  userRole: string
  currentUserId: string
}

export default function TimeTrackingSystem({ userRole, currentUserId }: TimeTrackingSystemProps) {
  const [activeTab, setActiveTab] = useState('clock')
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [userTimeEntry, setUserTimeEntry] = useState<TimeEntry | null>(null)
  const [todayStats, setTodayStats] = useState({
    totalEmployees: 4,
    clockedIn: 2,
    onBreak: 1,
    clockedOut: 1,
    avgHours: 5.55
  })

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Mock current user time entry
  useEffect(() => {
    setUserTimeEntry({
      id: 'current',
      employeeId: currentUserId,
      date: new Date().toISOString().split('T')[0],
      clockIn: '09:00:00',
      clockOut: null,
      breakStart: null,
      breakEnd: null,
      totalHours: 0,
      breakHours: 0,
      status: 'clocked_in',
      notes: ''
    })
  }, [currentUserId])

  const handleClockAction = (action: 'clock_in' | 'clock_out' | 'break_start' | 'break_end') => {
    const now = new Date()
    const timeString = now.toTimeString().split(' ')[0]
    
    setUserTimeEntry(prev => {
      if (!prev) return null
      
      switch (action) {
        case 'clock_in':
          return { ...prev, clockIn: timeString, status: 'clocked_in' }
        case 'clock_out':
          return { ...prev, clockOut: timeString, status: 'clocked_out' }
        case 'break_start':
          return { ...prev, breakStart: timeString, status: 'on_break' }
        case 'break_end':
          return { ...prev, breakEnd: timeString, status: 'clocked_in' }
        default:
          return prev
      }
    })

    // Update employee status in the list
    setEmployees(prev => prev.map(emp => 
      emp.id === currentUserId 
        ? { ...emp, currentStatus: action === 'break_start' ? 'on_break' : 
            action === 'break_end' ? 'clocked_in' :
            action === 'clock_out' ? 'clocked_out' : 'clocked_in' }
        : emp
    ))
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(date)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'clocked_in':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'on_break':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200' 
      case 'clocked_out':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'clocked_in':
        return <CheckCircle className="w-4 h-4" />
      case 'on_break':
        return <Coffee className="w-4 h-4" />
      case 'clocked_out':
        return <XCircle className="w-4 h-4" />
      default:
        return <Timer className="w-4 h-4" />
    }
  }

  const tabs = [
    { id: 'clock', label: 'Time Clock', icon: Clock },
    { id: 'directory', label: 'Employee Directory', icon: Users },
    { id: 'timesheet', label: 'Timesheets', icon: Calendar }
  ]

  return (
    <div className="space-y-6">
      {/* Header with Current Time */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Time & Attendance</h2>
            <p className="text-gray-600">Manage time tracking and employee attendance</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-mono font-bold text-blue-600">
              {formatTime(currentTime)}
            </div>
            <div className="text-sm text-gray-500">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{todayStats.totalEmployees}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clocked In</p>
              <p className="text-2xl font-bold text-green-600">{todayStats.clockedIn}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">On Break</p>
              <p className="text-2xl font-bold text-yellow-600">{todayStats.onBreak}</p>
            </div>
            <Coffee className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Hours</p>
              <p className="text-2xl font-bold text-blue-600">{todayStats.avgHours}</p>
            </div>
            <Timer className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Time Clock Tab */}
          {activeTab === 'clock' && (
            <div className="space-y-6">
              {/* Current Status */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Current Status</h3>
                {userTimeEntry && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(userTimeEntry.status)}`}>
                          {getStatusIcon(userTimeEntry.status)}
                          <span className="ml-1">
                            {userTimeEntry.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Clock In:</span>
                          <span className="font-medium">{userTimeEntry.clockIn || '--:--'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Clock Out:</span>
                          <span className="font-medium">{userTimeEntry.clockOut || '--:--'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Break Time:</span>
                          <span className="font-medium">{userTimeEntry.breakHours}h</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Clock Actions */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Quick Actions</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleClockAction('clock_in')}
                          disabled={userTimeEntry.status !== 'clocked_out'}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Play className="w-4 h-4" />
                          Clock In
                        </button>
                        <button
                          onClick={() => handleClockAction('clock_out')}
                          disabled={userTimeEntry.status === 'clocked_out'}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Pause className="w-4 h-4" />
                          Clock Out
                        </button>
                        <button
                          onClick={() => handleClockAction('break_start')}
                          disabled={userTimeEntry.status !== 'clocked_in'}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Coffee className="w-4 h-4" />
                          Start Break
                        </button>
                        <button
                          onClick={() => handleClockAction('break_end')}
                          disabled={userTimeEntry.status !== 'on_break'}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Play className="w-4 h-4" />
                          End Break
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Employee Directory Tab */}
          {activeTab === 'directory' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Employee Directory</h3>
                <div className="text-sm text-gray-600">
                  {employees.length} total employees
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.map((employee) => (
                  <div key={employee.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                          {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{employee.name}</h4>
                          <p className="text-sm text-gray-600">{employee.role}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(employee.currentStatus)}`}>
                        {getStatusIcon(employee.currentStatus)}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Department:</span>
                        <span className="font-medium">{employee.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Today's Hours:</span>
                        <span className="font-medium">{employee.todayHours}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="text-blue-600 truncate">{employee.email}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timesheets Tab */}
          {activeTab === 'timesheet' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Timesheets</h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                    Export PDF
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                    Generate Report
                  </button>
                </div>
              </div>
              
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock In</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock Out</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {employees.map((employee) => (
                        <tr key={employee.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                                <div className="text-sm text-gray-500">{employee.role}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date().toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            09:00 AM
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {employee.currentStatus === 'clocked_out' ? '05:30 PM' : '--:--'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {employee.todayHours}h
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(employee.currentStatus)}`}>
                              {employee.currentStatus.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
