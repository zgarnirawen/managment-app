'use client';

import { useEffect, useRef } from 'react';
import Pusher, { Channel } from 'pusher-js';

interface PusherClientProps {
  userId: string;
  onChannelMessage?: (data: any) => void;
  onDirectMessage?: (data: any) => void;
  onChannelUpdate?: (data: any) => void;
}

export default function PusherClient({ 
  userId, 
  onChannelMessage, 
  onDirectMessage, 
  onChannelUpdate 
}: PusherClientProps) {
  const pusherRef = useRef<Pusher | null>(null);
  const channelsRef = useRef<Map<string, Channel>>(new Map());

  useEffect(() => {
    // Initialize Pusher client
    pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    // Subscribe to user's direct message channel
    const dmChannel = pusherRef.current.subscribe(`dm-${userId}`);
    dmChannel.bind('new-dm', (data: any) => {
      onDirectMessage?.(data);
    });

    // Subscribe to general chat channels updates
    const channelsChannel = pusherRef.current.subscribe('chat-channels');
    channelsChannel.bind('channel-created', (data: any) => {
      onChannelUpdate?.(data);
    });

    return () => {
      // Cleanup all subscriptions
      channelsRef.current.forEach((channel, channelId) => {
        pusherRef.current?.unsubscribe(channelId);
      });
      channelsRef.current.clear();
      
      pusherRef.current?.unsubscribe(`dm-${userId}`);
      pusherRef.current?.unsubscribe('chat-channels');
      pusherRef.current?.disconnect();
    };
  }, [userId, onDirectMessage, onChannelUpdate]);

  // Function to subscribe to a channel
  const subscribeToChannel = (channelId: string) => {
    if (!pusherRef.current || channelsRef.current.has(channelId)) return;

    const channel = pusherRef.current.subscribe(`channel-${channelId}`);
    channel.bind('new-message', (data: any) => {
      onChannelMessage?.(data);
    });
    
    channelsRef.current.set(channelId, channel);
  };

  // Function to unsubscribe from a channel
  const unsubscribeFromChannel = (channelId: string) => {
    const channel = channelsRef.current.get(channelId);
    if (channel && pusherRef.current) {
      pusherRef.current.unsubscribe(`channel-${channelId}`);
      channelsRef.current.delete(channelId);
    }
  };

  // Expose subscription methods
  useEffect(() => {
    (window as any).pusherChatClient = {
      subscribeToChannel,
      unsubscribeFromChannel,
    };

    return () => {
      delete (window as any).pusherChatClient;
    };
  }, []);

  return null; // This component doesn't render anything
}
