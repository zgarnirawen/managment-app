'use client'

import React, { useState, useEffect } from 'react'
import { Shield, Lock, Key, AlertTriangle, Eye, EyeOff, Clock, Users, Activity, CheckCircle, XCircle } from 'lucide-react'

interface SecurityEvent {
  id: string
  type: 'login' | 'logout' | 'failed_login' | 'permission_change' | 'data_access' | 'system_change'
  userId: string
  userName: string
  userRole: string
  description: string
  timestamp: Date
  ipAddress: string
  location: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'resolved' | 'investigating'
}

interface SecurityMetrics {
  totalLogins: number
  failedAttempts: number
  activeUsers: number
  securityScore: number
  vulnerabilities: number
  lastSecurityScan: Date
}

const mockSecurityEvents: SecurityEvent[] = [
  {
    id: '1',
    type: 'failed_login',
    userId: 'unknown',
    userName: 'Unknown User',
    userRole: 'N/A',
    description: 'Multiple failed login attempts detected',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    ipAddress: '192.168.1.100',
    location: 'New York, US',
    severity: 'high',
    status: 'investigating'
  },
  {
    id: '2',
    type: 'permission_change',
    userId: 'user123',
    userName: 'John Smith',
    userRole: 'Admin',
    description: 'User promoted from Employee to Manager',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    ipAddress: '192.168.1.50',
    location: 'California, US',
    severity: 'medium',
    status: 'resolved'
  },
  {
    id: '3',
    type: 'system_change',
    userId: 'admin456',
    userName: 'Sarah Wilson',
    userRole: 'Super Admin',
    description: 'System configuration updated',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    ipAddress: '192.168.1.10',
    location: 'Texas, US',
    severity: 'high',
    status: 'resolved'
  },
  {
    id: '4',
    type: 'login',
    userId: 'user789',
    userName: 'Mike Brown',
    userRole: 'Employee',
    description: 'Successful login from new device',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    ipAddress: '192.168.1.75',
    location: 'Florida, US',
    severity: 'low',
    status: 'active'
  }
]

const mockMetrics: SecurityMetrics = {
  totalLogins: 1247,
  failedAttempts: 23,
  activeUsers: 156,
  securityScore: 87,
  vulnerabilities: 2,
  lastSecurityScan: new Date(Date.now() - 1000 * 60 * 60 * 12)
}

interface SecuritySystemProps {
  userRole: string
}

export default function SecuritySystem({ userRole }: SecuritySystemProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [events, setEvents] = useState<SecurityEvent[]>(mockSecurityEvents)
  const [metrics] = useState<SecurityMetrics>(mockMetrics)
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showDetails, setShowDetails] = useState<string | null>(null)

  // Security permissions based on role
  const canViewEvents = ['admin', 'super_admin'].includes(userRole.toLowerCase())
  const canManageSecurity = ['super_admin'].includes(userRole.toLowerCase())
  const canViewMetrics = ['manager', 'admin', 'super_admin'].includes(userRole.toLowerCase())

  const filteredEvents = events.filter(event => {
    const severityMatch = filterSeverity === 'all' || event.severity === filterSeverity
    const statusMatch = filterStatus === 'all' || event.status === filterStatus
    return severityMatch && statusMatch
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'investigating':
        return <Eye className="w-4 h-4 text-yellow-500" />
      case 'active':
        return <Activity className="w-4 h-4 text-blue-500" />
      default:
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  if (!canViewMetrics) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">You don't have permission to view security information.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Security Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Overview
            </button>
            {canViewEvents && (
              <button
                onClick={() => setActiveTab('events')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'events'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Security Events
              </button>
            )}
            {canManageSecurity && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Key className="w-4 h-4 inline mr-2" />
                Security Settings
              </button>
            )}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Security Score */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Security Score</h3>
                    <div className="flex items-center space-x-2">
                      <div className="text-3xl font-bold text-blue-600">{metrics.securityScore}%</div>
                      <div className="text-sm text-green-600 font-medium">+3% from last week</div>
                    </div>
                  </div>
                  <Shield className="w-12 h-12 text-blue-500" />
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${metrics.securityScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Security Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Logins</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.totalLogins.toLocaleString()}</p>
                    </div>
                    <Users className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Failed Attempts</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.failedAttempts}</p>
                    </div>
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                </div>
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Users</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.activeUsers}</p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Vulnerabilities</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.vulnerabilities}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-orange-500" />
                  </div>
                </div>
              </div>

              {/* Recent Security Events */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Security Events</h4>
                <div className="space-y-3">
                  {events.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(event.status)}
                        <div>
                          <p className="font-medium text-gray-900">{event.description}</p>
                          <p className="text-sm text-gray-600">{event.userName} • {formatTimestamp(event.timestamp)}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getSeverityColor(event.severity)}`}>
                        {event.severity.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security Events Tab */}
          {activeTab === 'events' && canViewEvents && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Events List */}
              <div className="space-y-3">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getStatusIcon(event.status)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{event.description}</h4>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getSeverityColor(event.severity)}`}>
                              {event.severity.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>User: {event.userName} ({event.userRole})</p>
                            <p>Time: {formatTimestamp(event.timestamp)}</p>
                            <p>Location: {event.location} ({event.ipAddress})</p>
                          </div>
                          {showDetails === event.id && (
                            <div className="mt-3 p-3 bg-gray-100 rounded-md">
                              <p className="text-sm text-gray-700">
                                Event Type: {event.type.replace('_', ' ').toUpperCase()}
                              </p>
                              <p className="text-sm text-gray-700">
                                Status: {event.status.toUpperCase()}
                              </p>
                              <p className="text-sm text-gray-700">
                                Full Details: This event requires further investigation based on the security protocols.
                              </p>
                            </div>
                          )}
                          <button
                            onClick={() => setShowDetails(showDetails === event.id ? null : event.id)}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                          >
                            {showDetails === event.id ? 'Hide Details' : 'Show Details'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Settings Tab */}
          {activeTab === 'settings' && canManageSecurity && (
            <div className="space-y-6">
              {/* Security Policies */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Security Policies</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h5 className="font-medium text-gray-900">Two-Factor Authentication</h5>
                      <p className="text-sm text-gray-600">Require 2FA for all admin accounts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h5 className="font-medium text-gray-900">Session Timeout</h5>
                      <p className="text-sm text-gray-600">Auto-logout after 30 minutes of inactivity</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h5 className="font-medium text-gray-900">Failed Login Protection</h5>
                      <p className="text-sm text-gray-600">Lock account after 5 failed attempts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Security Actions */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Security Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="p-4 border border-blue-200 rounded-lg text-left hover:bg-blue-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-6 h-6 text-blue-500" />
                      <div>
                        <h5 className="font-medium text-gray-900">Run Security Scan</h5>
                        <p className="text-sm text-gray-600">Last scan: {formatTimestamp(metrics.lastSecurityScan)}</p>
                      </div>
                    </div>
                  </button>
                  <button className="p-4 border border-green-200 rounded-lg text-left hover:bg-green-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Key className="w-6 h-6 text-green-500" />
                      <div>
                        <h5 className="font-medium text-gray-900">Generate Security Report</h5>
                        <p className="text-sm text-gray-600">Export security analytics</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
