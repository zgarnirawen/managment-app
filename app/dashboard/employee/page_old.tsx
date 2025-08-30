'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AssignedTasks from './AssignedTasks';
import WorkingHours from './WorkingHours';
import LeaveRequestForm from './LeaveRequestForm';
import PerformanceSummary from './PerformanceSummary';
import EmployeeTimeTracking from './EmployeeTimeTracking';
import EmployeeTimesheet from './EmployeeTimesheet';

export default function EmployeeDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (isLoaded && !hasRedirected) {
      const userRole = user?.publicMetadata?.role as string;
      
      // If user is not an employee, redirect to appropriate dashboard
      if (!user) {
        router.replace('/');
        setHasRedirected(true);
      } else if (userRole !== 'employee') {
        // Redirect based on actual role, or default dashboard if no role
        if (userRole === 'admin') {
          router.replace('/dashboard/admin');
        } else if (userRole === 'manager') {
          router.replace('/dashboard/manager');
        } else {
          // Default fallback - go to main dashboard instead of creating a loop
          router.replace('/dashboard');
        }
        setHasRedirected(true);
      }
    }
  }, [user, isLoaded, router, hasRedirected]);

  // Show loading while checking auth and role
  if (!isLoaded || hasRedirected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show access denied if not an employee
  if (!user || user.publicMetadata?.role !== 'employee') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the Employee Portal.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Employee Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <EmployeeTimeTracking employeeId={user?.id || ''} />
        </div>
        <div>
          <PerformanceSummary />
        </div>
      </div>
      <div className="mt-6">
        <EmployeeTimesheet employeeId={user?.id || ''} />
      </div>
      <div className="mt-6">
        <AssignedTasks />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div>
          <WorkingHours />
        </div>
        <div>
          <LeaveRequestForm />
        </div>
      </div>
    </main>
  );
}
