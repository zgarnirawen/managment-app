import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ChatInterface from '@/app/components/chat/ChatInterface';

export default async function ChatPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="h-screen">
      <ChatInterface />
    </div>
  );
}
