// Quick fix for redirect issue
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function SetupQuickFix() {
  const { user } = useUser();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (user && !redirecting) {
      setRedirecting(true);
      // Force redirect to admin dashboard for first user
      setTimeout(() => {
        window.location.href = '/dashboard/admin';
      }, 1000);
    }
  }, [user, redirecting]);

  const handleManualRedirect = () => {
    window.location.href = '/dashboard/admin';
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Configuration terminée !
          </h2>
          <p className="text-gray-600 mb-6">
            Redirection vers votre dashboard Super Admin...
          </p>
          <button
            onClick={handleManualRedirect}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Aller au Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}
