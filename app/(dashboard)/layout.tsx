'use client';

import { ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getUserRole, getDashboardPath } from '../../lib/roles';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      const userRole = getUserRole(user);
      const dashboardPath = getDashboardPath(userRole);
      
      // If user is on the main dashboard route, redirect to their role-specific dashboard
      if (window.location.pathname === '/dashboard') {
        router.push(dashboardPath);
      }
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nextgen-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}