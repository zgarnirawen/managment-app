import Pusher from 'pusher-js';

let pusherClient: Pusher | null = null;

export function getPusherClient(): Pusher {
  if (!pusherClient) {
    pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      forceTLS: true,
    });
  }
  return pusherClient;
}

export function subscribeTo(channel: string, event: string, callback: (data: any) => void) {
  const pusher = getPusherClient();
  const pusherChannel = pusher.subscribe(channel);
  pusherChannel.bind(event, callback);
  
  return () => {
    pusherChannel.unbind(event, callback);
    pusher.unsubscribe(channel);
  };
}

export function unsubscribeFrom(channel: string) {
  if (pusherClient) {
    pusherClient.unsubscribe(channel);
  }
}
