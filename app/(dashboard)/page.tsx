'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardRedirect() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      const userRole = user.unsafeMetadata?.role as string;

      // Redirect based on user role
      const roleRedirects = {
        intern: '/intern',
        employee: '/employee',
        manager: '/manager',
        admin: '/admin',
        super_admin: '/super-admin'
      };

      const redirectPath = roleRedirects[userRole as keyof typeof roleRedirects] || '/employee';
      router.replace(redirectPath);
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nextgen-dark-blue to-nextgen-medium-gray">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-nextgen-teal" />
          <h2 className="text-lg font-semibold text-white mb-2">
            Loading Dashboard...
          </h2>
          <p className="text-nextgen-light-gray">
            Please wait while we set up your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nextgen-dark-blue to-nextgen-medium-gray">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-nextgen-teal" />
        <h2 className="text-lg font-semibold text-white mb-2">
          Redirecting...
        </h2>
        <p className="text-nextgen-light-gray">
          Taking you to your personalized dashboard.
        </p>
      </div>
    </div>
  );
}
