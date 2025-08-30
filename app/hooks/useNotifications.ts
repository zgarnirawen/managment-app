import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscribeTo } from '../lib/pusher';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  employeeId: string;
  message: string;
  type: string;
  read: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  employee: {
    id: string;
    name: string;
    email: string;
  };
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

export const useNotifications = (employeeId: string, options?: { unreadOnly?: boolean; limit?: number }) => {
  const queryClient = useQueryClient();
  const isSubscribedRef = useRef(false);

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery<NotificationsResponse>({
    queryKey: ['notifications', employeeId, options?.unreadOnly],
    queryFn: async () => {
      const params = new URLSearchParams({
        employeeId,
        ...(options?.limit && { limit: options.limit.toString() }),
        ...(options?.unreadOnly && { unreadOnly: 'true' })
      });

      const response = await fetch(`/api/notifications?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      return response.json();
    },
    enabled: !!employeeId,
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', employeeId] });
    },
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', employeeId] });
    },
  });

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!employeeId || isSubscribedRef.current) return;

    const unsubscribe = subscribeTo(
      `employee-${employeeId}`,
      'new-notification',
      (data: Notification) => {
        console.log('New notification received:', data);
        
        // Show toast notification
        toast.info(data.message, {
          description: `${data.type.replace('_', ' ').toLowerCase()}`,
          action: {
            label: 'View',
            onClick: () => {
              // You can add custom action here, like opening a modal
              console.log('View notification:', data);
            },
          },
        });

        // Invalidate queries to refetch notifications
        queryClient.invalidateQueries({ queryKey: ['notifications', employeeId] });
      }
    );

    isSubscribedRef.current = true;

    return () => {
      unsubscribe();
      isSubscribedRef.current = false;
    };
  }, [employeeId, queryClient]);

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unreadCount || 0,
    total: data?.total || 0,
    isLoading,
    error,
    refetch,
    markAsRead: markAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
  };
};
