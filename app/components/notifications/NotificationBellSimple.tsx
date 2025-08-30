'use client';

import { useState } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useNotifications, Notification } from '../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

interface NotificationBellProps {
  employeeId: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'TASK_ASSIGNED':
      return '📋';
    case 'DEADLINE_REMINDER':
      return '⏰';
    case 'TASK_COMPLETED':
      return '✅';
    case 'MEETING_REMINDER':
      return '📅';
    case 'LEAVE_APPROVED':
      return '🟢';
    case 'LEAVE_REJECTED':
      return '🔴';
    default:
      return '📢';
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'TASK_ASSIGNED':
      return 'bg-blue-100 text-blue-800';
    case 'DEADLINE_REMINDER':
      return 'bg-red-100 text-red-800';
    case 'TASK_COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'MEETING_REMINDER':
      return 'bg-purple-100 text-purple-800';
    case 'LEAVE_APPROVED':
      return 'bg-green-100 text-green-800';
    case 'LEAVE_REJECTED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function NotificationBell({ employeeId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    deleteNotification,
    isMarkingAsRead,
    isDeleting,
  } = useNotifications(employeeId, { limit: 20 });

  const handleMarkAsRead = (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    markAsRead(notificationId);
  };

  const handleDelete = (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    deleteNotification(notificationId);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Handle navigation based on notification type
    if (notification.type === 'TASK_ASSIGNED' || notification.type === 'DEADLINE_REMINDER') {
      const metadata = notification.metadata as { taskId?: string } | undefined;
      if (metadata?.taskId) {
        window.location.href = `/dashboard/tasks?highlight=${metadata.taskId}`;
      } else {
        window.location.href = '/dashboard/tasks';
      }
    } else if (notification.type === 'MEETING_REMINDER') {
      window.location.href = '/dashboard/calendar';
    } else if (notification.type.includes('LEAVE')) {
      window.location.href = '/dashboard/employee';
    }
    
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="font-medium">Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="secondary">{unreadCount} unread</Badge>
              )}
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-lg">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-sm font-medium truncate ${
                          !notification.read ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {notification.message}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getNotificationColor(notification.type)}`}
                        >
                          {notification.type.replace('_', ' ')}
                        </Badge>
                        
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          disabled={isMarkingAsRead}
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        disabled={isDeleting}
                        onClick={(e) => handleDelete(notification.id, e)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200">
              <button 
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                onClick={() => {
                  window.location.href = '/dashboard/notifications';
                  setIsOpen(false);
                }}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
