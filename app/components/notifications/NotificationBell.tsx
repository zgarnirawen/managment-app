'use client';

import { useState } from 'react';
import { Bell, X, Check, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { useNotifications } from '../../hooks/useNotifications';
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

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Handle navigation based on notification type
    if (notification.type === 'TASK_ASSIGNED' || notification.type === 'DEADLINE_REMINDER') {
      if (notification.metadata?.taskId) {
        window.location.href = `/dashboard/tasks?highlight=${notification.metadata.taskId}`;
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
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
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
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} unread</Badge>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <ScrollArea className="h-96">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="p-0 focus:bg-muted"
                onClick={() => handleNotificationClick(notification)}
              >
                <div 
                  className={`w-full p-3 cursor-pointer hover:bg-muted transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-lg">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-sm font-medium truncate ${
                          !notification.read ? 'text-foreground' : 'text-muted-foreground'
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
                        
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
              onClick={() => {
                window.location.href = '/dashboard/notifications';
                setIsOpen(false);
              }}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
