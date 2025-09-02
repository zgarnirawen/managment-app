'use client'

import React from 'react'
import { Bell, X, Check, CheckCheck, Trash2, ExternalLink } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { ScrollArea } from '../ui/scroll-area'
import { useNotifications } from '../../contexts/NotificationContext'
import { useRouter } from 'next/navigation'

const NotificationIcon: React.FC = () => {
  const { unreadCount } = useNotifications()

  return (
    <div className="relative">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </div>
  )
}

const NotificationItem: React.FC<{ 
  notification: any
  onMarkAsRead: (id: string) => void
  onClear: (id: string) => void
  onAction?: (url: string) => void
}> = ({ notification, onMarkAsRead, onClear, onAction }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      default: return 'ℹ️'
    }
  }

  return (
    <div className={`p-3 border rounded-lg mb-2 ${getTypeColor(notification.type)} ${!notification.read ? 'font-medium' : 'opacity-75'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm">{getTypeIcon(notification.type)}</span>
            <h4 className="text-sm font-medium">{notification.title}</h4>
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            )}
          </div>
          <p className="text-xs text-gray-600 mb-2">{notification.message}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {notification.timestamp.toLocaleString()}
            </span>
            <div className="flex space-x-1">
              {notification.actionUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAction?.(notification.actionUrl)}
                  className="h-6 px-2 text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {notification.actionText || 'View'}
                </Button>
              )}
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="h-6 px-2"
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onClear(notification.id)}
                className="h-6 px-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const NotificationDropdown: React.FC = () => {
  const router = useRouter()
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotification, 
    clearAllNotifications 
  } = useNotifications()

  const handleAction = (url: string) => {
    router.push(url)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <NotificationIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllNotifications}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <CardDescription>
                You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              <div className="p-3">
                {notifications.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onClear={clearNotification}
                      onAction={handleAction}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}

export { NotificationIcon }
