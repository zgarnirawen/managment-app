'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getUserRole, getDashboardPath } from '../../lib/roles';

export default function MainDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      const userRole = getUserRole(user);
      const dashboardPath = getDashboardPath(userRole);
      router.push(dashboardPath);
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nextgen-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to your dashboard...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nextgen-primary mx-auto"></div>
      </div>
    </div>
  );
}
