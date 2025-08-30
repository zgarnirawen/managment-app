'use client';

import { useUser } from '@clerk/nextjs';
import EmployeeTable from './EmployeeTable';

export default function EmployeesPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user) {
    return <div className="p-8">Please sign in to access this page.</div>;
  }

  // Check if user has admin role (you can customize this logic)
  const isAdmin = user.publicMetadata?.role === 'admin' || user.emailAddresses[0]?.emailAddress?.includes('admin');

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="mt-2 text-gray-600">
            Manage your organization's employees, roles, and departments.
          </p>
        </div>

        {isAdmin ? (
          <EmployeeTable />
        ) : (
          <div className="text-center py-8 text-gray-500">
            You need admin privileges to access employee management.
          </div>
        )}
      </div>
    </div>
  );
}
