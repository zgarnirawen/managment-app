'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the actual chat page
    router.replace('/dashboard/chat');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-nextgen-dark-gray to-nextgen-dark-blue flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nextgen-teal mx-auto mb-4"></div>
        <p className="text-nextgen-white">Redirecting to chat...</p>
      </div>
    </div>
  );
}
