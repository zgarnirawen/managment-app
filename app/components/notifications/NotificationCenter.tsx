'use client';

import { useState, useEffect } from 'react';
import { Bell, Home, Settings, Filter, Search, Check, Trash2, Archive, Star, Clock, CheckCircle, Calendar, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
} from '../ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../lib/utils';

interface NotificationCenterProps {
  employeeId: string;
  onNavigateHome?: () => void;
}

type NotificationFilter = 'all' | 'unread' | 'task' | 'meeting' | 'leave' | 'system';
type NotificationSort = 'newest' | 'oldest' | 'priority';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'TASK_ASSIGNED':
    case 'TASK_COMPLETED':
      return <CheckCircle className="h-4 w-4 text-blue-500" />;
    case 'DEADLINE_REMINDER':
      return <Clock className="h-4 w-4 text-orange-500" />;
    case 'MEETING_REMINDER':
      return <Calendar className="h-4 w-4 text-purple-500" />;
    case 'LEAVE_APPROVED':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'LEAVE_REJECTED':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'SYSTEM':
      return <Settings className="h-4 w-4 text-gray-500" />;
    default:
      return <Bell className="h-4 w-4 text-blue-500" />;
  }
};

const getNotificationPriority = (type: string): 'high' | 'medium' | 'low' => {
  switch (type) {
    case 'DEADLINE_REMINDER':
    case 'LEAVE_REJECTED':
      return 'high';
    case 'TASK_ASSIGNED':
    case 'MEETING_REMINDER':
    case 'LEAVE_APPROVED':
      return 'medium';
    default:
      return 'low';
  }
};

const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
  switch (priority) {
    case 'high':
      return 'border-l-red-500 bg-red-50 dark:bg-red-950/20';
    case 'medium':
      return 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/20';
    case 'low':
      return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20';
  }
};

export default function NotificationCenter({ 
  employeeId, 
  onNavigateHome 
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [sort, setSort] = useState<NotificationSort>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    deleteNotification,
    isMarkingAsRead,
    isDeleting,
  } = useNotifications(employeeId, { limit: 100 });

  // Filter and sort notifications
  const filteredNotifications = notifications?.filter(notification => {
    // Filter by type
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'task' && !notification.type.includes('TASK')) return false;
    if (filter === 'meeting' && !notification.type.includes('MEETING')) return false;
    if (filter === 'leave' && !notification.type.includes('LEAVE')) return false;
    if (filter === 'system' && notification.type !== 'SYSTEM') return false;

    // Filter by search term
    if (searchTerm) {
      return notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    }

    return true;
  }).sort((a, b) => {
    if (sort === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sort === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else { // priority
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = getNotificationPriority(a.type);
      const bPriority = getNotificationPriority(b.type);
      return priorityOrder[bPriority] - priorityOrder[aPriority];
    }
  }) || [];

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

  const handleBulkAction = (action: 'markRead' | 'delete') => {
    selectedNotifications.forEach(id => {
      if (action === 'markRead') {
        markAsRead(id);
      } else {
        deleteNotification(id);
      }
    });
    setSelectedNotifications([]);
  };

  const toggleNotificationSelection = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(notificationId => notificationId !== id)
        : [...prev, id]
    );
  };

  const selectAllVisible = () => {
    setSelectedNotifications(filteredNotifications.map(n => n.id));
  };

  const clearSelection = () => {
    setSelectedNotifications([]);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Home Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onNavigateHome || (() => window.location.href = '/dashboard')}
        className="relative hover:bg-nextgen-medium-gray transition-colors"
        title="Go to Dashboard"
      >
        <Home className="h-5 w-5" />
      </Button>

      {/* Notification Bell - Quick View */}
      <DropdownMenu>
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
            <span>Recent Notifications</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Badge variant="secondary">{unreadCount} unread</Badge>
              )}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </SheetTrigger>
              </Sheet>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <ScrollArea className="h-96">
              {filteredNotifications.slice(0, 5).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="p-0 focus:bg-muted"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={cn(
                    "w-full p-3 border-l-4 transition-all hover:bg-muted/50",
                    getPriorityColor(getNotificationPriority(notification.type)),
                    !notification.read && "bg-muted/20"
                  )}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm",
                          !notification.read && "font-semibold"
                        )}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Full Notification Center */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Center
              {unreadCount > 0 && (
                <Badge variant="secondary">{unreadCount} unread</Badge>
              )}
            </SheetTitle>
            <SheetDescription>
              Manage all your notifications and stay updated with important events.
            </SheetDescription>
          </SheetHeader>

          <div className="py-6 space-y-4">
            {/* Search and Filters */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={filter === 'all'}
                    onCheckedChange={() => setFilter('all')}
                  >
                    All Notifications
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filter === 'unread'}
                    onCheckedChange={() => setFilter('unread')}
                  >
                    Unread Only
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filter === 'task'}
                    onCheckedChange={() => setFilter('task')}
                  >
                    Tasks
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filter === 'meeting'}
                    onCheckedChange={() => setFilter('meeting')}
                  >
                    Meetings
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filter === 'leave'}
                    onCheckedChange={() => setFilter('leave')}
                  >
                    Leave Requests
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={sort === 'newest'}
                    onCheckedChange={() => setSort('newest')}
                  >
                    Newest First
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sort === 'oldest'}
                    onCheckedChange={() => setSort('oldest')}
                  >
                    Oldest First
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sort === 'priority'}
                    onCheckedChange={() => setSort('priority')}
                  >
                    Priority
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">
                  {selectedNotifications.length} notification(s) selected
                </span>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkAction('markRead')}
                    disabled={isMarkingAsRead}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Mark Read
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkAction('delete')}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                  <Button size="sm" variant="ghost" onClick={clearSelection}>
                    Clear
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={selectAllVisible}
                disabled={filteredNotifications.length === 0}
              >
                Select All
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleBulkAction('markRead')}
                disabled={unreadCount === 0}
              >
                Mark All Read
              </Button>
            </div>

            {/* Notifications List */}
            <ScrollArea className="h-[600px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm || filter !== 'all' 
                      ? 'No notifications match your filters' 
                      : 'No notifications yet'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map((notification) => (
                    <Card 
                      key={notification.id}
                      className={cn(
                        "p-4 border-l-4 transition-all hover:shadow-md cursor-pointer",
                        getPriorityColor(getNotificationPriority(notification.type)),
                        !notification.read && "bg-muted/20",
                        selectedNotifications.includes(notification.id) && "ring-2 ring-primary"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={() => toggleNotificationSelection(notification.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1"
                        />
                        
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className={cn(
                                "text-sm",
                                !notification.read && "font-semibold"
                              )}>
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {notification.type.replace('_', ' ').toLowerCase()}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  disabled={isMarkingAsRead}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                disabled={isDeleting}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
