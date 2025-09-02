'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { 
  Bell, 
  Mail, 
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  Send,
  Settings,
  Filter,
  CheckCheck,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'

// Mock notifications data
const mockNotifications = [
  {
    id: 1,
    type: 'task_assigned',
    title: 'New Task Assigned',
    message: 'You have been assigned to "Implement User Authentication"',
    timestamp: '2024-12-16T10:30:00',
    read: false,
    priority: 'high',
    sender: 'Sarah Manager',
    category: 'tasks'
  },
  {
    id: 2,
    type: 'sprint_update',
    title: 'Sprint Update',
    message: 'Sprint "Q4 Features" has been updated with new requirements',
    timestamp: '2024-12-16T09:15:00',
    read: false,
    priority: 'medium',
    sender: 'Project Team',
    category: 'sprints'
  },
  {
    id: 3,
    type: 'leave_approved',
    title: 'Leave Request Approved',
    message: 'Your vacation request for Dec 20-27 has been approved',
    timestamp: '2024-12-15T16:45:00',
    read: true,
    priority: 'low',
    sender: 'HR Department',
    category: 'leave'
  },
  {
    id: 4,
    type: 'meeting_reminder',
    title: 'Meeting Reminder',
    message: 'Team standup meeting starts in 15 minutes',
    timestamp: '2024-12-16T08:45:00',
    read: false,
    priority: 'urgent',
    sender: 'Calendar System',
    category: 'meetings'
  },
  {
    id: 5,
    type: 'system_update',
    title: 'System Maintenance',
    message: 'Scheduled maintenance on Dec 20th from 2-6 AM',
    timestamp: '2024-12-15T12:00:00',
    read: true,
    priority: 'medium',
    sender: 'System Admin',
    category: 'system'
  }
]

const notificationTypes = {
  task_assigned: { icon: CheckCircle, color: 'text-blue-600' },
  sprint_update: { icon: Info, color: 'text-green-600' },
  leave_approved: { icon: CheckCircle, color: 'text-green-600' },
  meeting_reminder: { icon: Clock, color: 'text-orange-600' },
  system_update: { icon: AlertTriangle, color: 'text-purple-600' }
}

const priorityColors = {
  urgent: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800'
}

interface EmailNotification {
  to: string[]
  cc: string[]
  subject: string
  message: string
  priority: string
  template: string
}

export default function NotificationCenter() {
  const { user } = useUser()
  const [notifications, setNotifications] = useState(mockNotifications)
  const [activeTab, setActiveTab] = useState('all')
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [filterPriority, setFilterPriority] = useState('all')
  const [emailForm, setEmailForm] = useState<EmailNotification>({
    to: [],
    cc: [],
    subject: '',
    message: '',
    priority: 'medium',
    template: 'default'
  })
  const [settings, setSettings] = useState({
    emailNotifications: true,
    inAppNotifications: true,
    soundNotifications: false,
    taskUpdates: true,
    sprintUpdates: true,
    leaveUpdates: true,
    meetingReminders: true,
    systemUpdates: true
  })

  // Simulate real-time notifications with Socket.io
  useEffect(() => {
    // In a real app, this would be Socket.io connection
    const interval = setInterval(() => {
      // Simulate receiving a new notification
      if (Math.random() > 0.8) {
        const newNotification = {
          id: Date.now(),
          type: 'task_assigned',
          title: 'New Real-time Notification',
          message: 'This is a simulated real-time notification',
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'medium',
          sender: 'System',
          category: 'tasks'
        }
        setNotifications(prev => [newNotification, ...prev])
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const filteredNotifications = notifications.filter(notification => {
    const matchesTab = activeTab === 'all' || notification.category === activeTab
    const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority
    return matchesTab && matchesPriority
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const handleMarkAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleDeleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const handleSendEmailNotification = async () => {
    try {
      // In a real app, this would call the NodeMailer API
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailForm)
      })

      if (response.ok) {
        alert('Email notification sent successfully!')
        setShowEmailDialog(false)
        setEmailForm({
          to: [],
          cc: [],
          subject: '',
          message: '',
          priority: 'medium',
          template: 'default'
        })
      }
    } catch (error) {
      console.error('Failed to send email:', error)
      alert('Failed to send email notification')
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)} minutes ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full flex items-center justify-center text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">Notification Center</h2>
            <p className="text-gray-600">{unreadCount} unread notifications</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setShowSettingsDialog(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" onClick={() => setShowEmailDialog(true)}>
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </Button>
          <Button onClick={handleMarkAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="sprints">Sprints</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No notifications found</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredNotifications.map((notification) => {
                      const TypeIcon = notificationTypes[notification.type as keyof typeof notificationTypes]?.icon || Info
                      const iconColor = notificationTypes[notification.type as keyof typeof notificationTypes]?.color || 'text-gray-600'
                      
                      return (
                        <div
                          key={notification.id}
                          className={`p-4 border-b hover:bg-gray-50 ${
                            !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-4">
                            <TypeIcon className={`h-5 w-5 mt-1 ${iconColor}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`text-sm font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                                  {notification.title}
                                </h4>
                                <div className="flex items-center space-x-2">
                                  <Badge className={priorityColors[notification.priority as keyof typeof priorityColors]}>
                                    {notification.priority}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {formatTimestamp(notification.timestamp)}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">From: {notification.sender}</span>
                                <div className="flex space-x-1">
                                  {!notification.read && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleMarkAsRead(notification.id)}
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteNotification(notification.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Email Notification Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Email Notification</DialogTitle>
            <DialogDescription>
              Send email notifications to team members using NodeMailer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Recipients (To)</label>
              <Input
                placeholder="email1@company.com, email2@company.com"
                onChange={(e) => setEmailForm({
                  ...emailForm,
                  to: e.target.value.split(',').map(email => email.trim())
                })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">CC (Optional)</label>
              <Input
                placeholder="cc@company.com"
                onChange={(e) => setEmailForm({
                  ...emailForm,
                  cc: e.target.value.split(',').map(email => email.trim())
                })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <Select value={emailForm.priority} onValueChange={(value) => setEmailForm({...emailForm, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Template</label>
                <Select value={emailForm.template} onValueChange={(value) => setEmailForm({...emailForm, template: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="task_assignment">Task Assignment</SelectItem>
                    <SelectItem value="sprint_update">Sprint Update</SelectItem>
                    <SelectItem value="meeting_reminder">Meeting Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <Input
                value={emailForm.subject}
                onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                placeholder="Email subject"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <Textarea
                value={emailForm.message}
                onChange={(e) => setEmailForm({...emailForm, message: e.target.value})}
                placeholder="Email message content..."
                rows={6}
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleSendEmailNotification} className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
            <DialogDescription>
              Configure your notification preferences
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-medium">Delivery Methods</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm">Email Notifications</label>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">In-App Notifications</label>
                  <input
                    type="checkbox"
                    checked={settings.inAppNotifications}
                    onChange={(e) => setSettings({...settings, inAppNotifications: e.target.checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">Sound Notifications</label>
                  <input
                    type="checkbox"
                    checked={settings.soundNotifications}
                    onChange={(e) => setSettings({...settings, soundNotifications: e.target.checked})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Notification Types</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm">Task Updates</label>
                  <input
                    type="checkbox"
                    checked={settings.taskUpdates}
                    onChange={(e) => setSettings({...settings, taskUpdates: e.target.checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">Sprint Updates</label>
                  <input
                    type="checkbox"
                    checked={settings.sprintUpdates}
                    onChange={(e) => setSettings({...settings, sprintUpdates: e.target.checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">Leave Updates</label>
                  <input
                    type="checkbox"
                    checked={settings.leaveUpdates}
                    onChange={(e) => setSettings({...settings, leaveUpdates: e.target.checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">Meeting Reminders</label>
                  <input
                    type="checkbox"
                    checked={settings.meetingReminders}
                    onChange={(e) => setSettings({...settings, meetingReminders: e.target.checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">System Updates</label>
                  <input
                    type="checkbox"
                    checked={settings.systemUpdates}
                    onChange={(e) => setSettings({...settings, systemUpdates: e.target.checked})}
                  />
                </div>
              </div>
            </div>

            <Button className="w-full" onClick={() => setShowSettingsDialog(false)}>
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
