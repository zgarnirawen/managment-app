'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useUser } from '@clerk/nextjs'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionText?: string
  data?: any
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotification: (id: string) => void
  clearAllNotifications: () => void
  sendEmailNotification: (to: string, subject: string, message: string, type?: string) => Promise<boolean>
  socket: Socket | null
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io({
      path: '/api/socket',
    })

    socketInstance.on('connect', () => {
      console.log('Connected to notification socket')
      if (user?.id) {
        socketInstance.emit('join', user.id)
        
        // Join role-based rooms
        const userRole = user.publicMetadata?.role as string
        if (userRole) {
          socketInstance.emit('join-role', userRole)
        }

        // Join department rooms if available
        const userDepartment = user.publicMetadata?.department as string
        if (userDepartment) {
          socketInstance.emit('join-department', userDepartment)
        }
      }
    })

    // Listen for notifications
    socketInstance.on('notification', (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      addNotification(notification)
    })

    // Listen for specific event types
    socketInstance.on('task-updated', (data) => {
      addNotification({
        type: 'info',
        title: 'Task Updated',
        message: `Task "${data.title}" has been updated`,
        actionUrl: `/dashboard/projects?task=${data.id}`,
        actionText: 'View Task',
        data
      })
    })

    socketInstance.on('leave-request-submitted', (data) => {
      addNotification({
        type: 'info',
        title: 'New Leave Request',
        message: `${data.employeeName} has submitted a leave request`,
        actionUrl: '/dashboard/leave',
        actionText: 'Review Request',
        data
      })
    })

    socketInstance.on('meeting-reminder', (data) => {
      addNotification({
        type: 'warning',
        title: 'Meeting Reminder',
        message: `Meeting "${data.title}" starts in 15 minutes`,
        actionUrl: `/dashboard/video-meetings?id=${data.id}`,
        actionText: 'Join Meeting',
        data
      })
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [user])

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    }

    setNotifications(prev => [newNotification, ...prev])

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico'
      })
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const sendEmailNotification = async (
    to: string, 
    subject: string, 
    message: string, 
    type: string = 'general'
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          html: message,
          type
        }),
      })

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error('Failed to send email notification:', error)
      return false
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    sendEmailNotification,
    socket
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
