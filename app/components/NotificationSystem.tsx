'use client'

import React, { useState, useEffect } from 'react'
import { Bell, Check, X, Clock, User, MessageSquare, Award, AlertTriangle, Settings, Trash2, CheckCircle } from 'lucide-react'

interface Notification {
  id: string
  type: 'promotion' | 'achievement' | 'message' | 'system' | 'security' | 'reminder'
  title: string
  content: string
  timestamp: Date
  isRead: boolean
  isImportant: boolean
  actionUrl?: string
  senderName?: string
  senderRole?: string
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'promotion',
    title: 'Promotion Approved!',
    content: 'Congratulations! You have been promoted to Senior Employee. Your new responsibilities are now active.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    isRead: false,
    isImportant: true,
    actionUrl: '/dashboard',
    senderName: 'John Smith',
    senderRole: 'Manager'
  },
  {
    id: '2',
    type: 'achievement',
    title: 'New Achievement Unlocked!',
    content: 'You have earned the "Task Master" badge for completing 50 tasks this month.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isRead: false,
    isImportant: false,
    actionUrl: '/dashboard?tab=progress'
  },
  {
    id: '3',
    type: 'message',
    title: 'New Message from Sarah Wilson',
    content: 'Hi! Can we schedule a meeting to discuss the quarterly review? I have some questions about the new processes.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    isRead: true,
    isImportant: false,
    actionUrl: '/chat',
    senderName: 'Sarah Wilson',
    senderRole: 'Employee'
  },
  {
    id: '4',
    type: 'system',
    title: 'System Maintenance Scheduled',
    content: 'The system will undergo maintenance on Sunday, 2:00 AM - 4:00 AM. Some features may be temporarily unavailable.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    isRead: true,
    isImportant: true
  },
  {
    id: '5',
    type: 'security',
    title: 'Security Alert',
    content: 'Unusual login activity detected from a new device. If this was not you, please change your password immediately.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
    isRead: false,
    isImportant: true,
    actionUrl: '/settings'
  },
  {
    id: '6',
    type: 'reminder',
    title: 'Meeting Reminder',
    content: 'Team standup meeting starts in 15 minutes. Meeting room: Conference Room A.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
    isRead: true,
    isImportant: false,
    actionUrl: '/calendar'
  }
]

interface NotificationSystemProps {
  userRole?: string
  isDropdown?: boolean
  onClose?: () => void
}

export default function NotificationSystem({ userRole = 'employee', isDropdown = false, onClose }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [filter, setFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'timestamp' | 'importance'>('timestamp')

  const unreadCount = notifications.filter(n => !n.isRead).length
  const importantCount = notifications.filter(n => n.isImportant && !n.isRead).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'promotion':
        return <Award className="w-5 h-5 text-yellow-500" />
      case 'achievement':
        return <Award className="w-5 h-5 text-green-500" />
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-500" />
      case 'system':
        return <Settings className="w-5 h-5 text-gray-500" />
      case 'security':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'reminder':
        return <Clock className="w-5 h-5 text-purple-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-400" />
    }
  }

  const getNotificationColor = (type: string, isImportant: boolean) => {
    if (isImportant) {
      return 'border-l-4 border-l-red-400 bg-red-50'
    }
    switch (type) {
      case 'promotion':
        return 'border-l-4 border-l-yellow-400 bg-yellow-50'
      case 'achievement':
        return 'border-l-4 border-l-green-400 bg-green-50'
      case 'message':
        return 'border-l-4 border-l-blue-400 bg-blue-50'
      case 'system':
        return 'border-l-4 border-l-gray-400 bg-gray-50'
      case 'security':
        return 'border-l-4 border-l-red-400 bg-red-50'
      case 'reminder':
        return 'border-l-4 border-l-purple-400 bg-purple-50'
      default:
        return 'border-l-4 border-l-gray-400 bg-gray-50'
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notification.isRead
    if (filter === 'important') return notification.isImportant
    return notification.type === filter
  })

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    if (sortBy === 'importance') {
      if (a.isImportant && !b.isImportant) return -1
      if (!a.isImportant && b.isImportant) return 1
    }
    return b.timestamp.getTime() - a.timestamp.getTime()
  })

  if (isDropdown) {
    return (
      <div className="w-80 max-h-96 bg-white rounded-lg shadow-lg border overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
              {onClose && (
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-2 border-b bg-white">
          <div className="flex justify-between text-sm">
            <button
              onClick={markAllAsRead}
              className="text-blue-600 hover:text-blue-800"
              disabled={unreadCount === 0}
            >
              Mark all read
            </button>
            <button
              onClick={clearAllNotifications}
              className="text-red-600 hover:text-red-800"
              disabled={notifications.length === 0}
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-64 overflow-y-auto">
          {sortedNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No notifications</p>
            </div>
          ) : (
            sortedNotifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className={`text-sm font-medium text-gray-900 ${
                        !notification.isRead ? 'font-semibold' : ''
                      }`}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.content}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                      {notification.isImportant && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          Important
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {notifications.length > 5 && (
          <div className="px-4 py-3 border-t bg-gray-50 text-center">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all notifications
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
            <p className="text-gray-600 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              {importantCount > 0 && ` • ${importantCount} important`}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={clearAllNotifications}
              disabled={notifications.length === 0}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:text-red-800 disabled:text-gray-400"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear all</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="unread">Unread</option>
              <option value="important">Important</option>
              <option value="promotion">Promotions</option>
              <option value="achievement">Achievements</option>
              <option value="message">Messages</option>
              <option value="system">System</option>
              <option value="security">Security</option>
              <option value="reminder">Reminders</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'timestamp' | 'importance')}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="timestamp">Latest First</option>
              <option value="importance">Important First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {sortedNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You're all caught up! New notifications will appear here."
                : `No notifications found for "${filter}" filter.`
              }
            </p>
          </div>
        ) : (
          sortedNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow-sm border p-6 ${getNotificationColor(
                notification.type,
                notification.isImportant
              )} ${!notification.isRead ? 'ring-2 ring-blue-100' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`text-lg font-medium text-gray-900 ${
                        !notification.isRead ? 'font-semibold' : ''
                      }`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full ml-2 mt-1"></div>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3">{notification.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{formatTimestamp(notification.timestamp)}</span>
                        {notification.senderName && (
                          <span>
                            From: {notification.senderName} ({notification.senderRole})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {notification.isImportant && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                            Important
                          </span>
                        )}
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full capitalize">
                          {notification.type}
                        </span>
                      </div>
                    </div>
                    {notification.actionUrl && (
                      <div className="mt-3">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          View Details →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
