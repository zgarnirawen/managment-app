'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ManagerTimeApproval from './ManagerTimeApproval';
import ManagerTimesheets from './ManagerTimesheets';

export default function ManagerDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('approvals');
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (isLoaded && !hasRedirected) {
      const userRole = user?.publicMetadata?.role as string;
      
      // If user is not a manager, redirect to appropriate dashboard
      if (!user) {
        router.replace('/');
        setHasRedirected(true);
      } else if (userRole !== 'manager') {
        // Redirect based on actual role, or default dashboard if no role
        if (userRole === 'admin') {
          router.replace('/dashboard/admin');
        } else if (userRole === 'employee') {
          router.replace('/dashboard/employee');
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

  // Show access denied if not a manager
  if (!user || user.publicMetadata?.role !== 'manager') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the Manager Portal.</p>
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
      <h1 className="text-3xl font-bold mb-6">Manager Dashboard</h1>
      
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('approvals')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'approvals'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Time Approvals
            </button>
            <button
              onClick={() => setActiveTab('timesheets')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'timesheets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Timesheets & Reports
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'approvals' && <ManagerTimeApproval />}
      {activeTab === 'timesheets' && <ManagerTimesheets />}
    </main>
  );
}
