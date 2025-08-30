'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function RoleBasedNavigation() {
  const { user, isLoaded } = useUser();

  const [localRole, setLocalRole] = useState<string | null>(null);

  useEffect(() => {
    setLocalRole(localStorage.getItem('userRole'));
  }, []);

  if (!isLoaded || !user) {
    return null;
  }

  const userRole = user.publicMetadata?.role as string;

  const role = userRole || localRole;

  return (
    <div className="bg-nextgen-teal/10 border border-nextgen-teal/20 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-nextgen-white mb-2">Available Portals</h3>
      <div className="flex flex-wrap gap-2">
        {role === 'admin' && (
          <Link 
            href="/dashboard/admin"
            className="px-3 py-1 bg-nextgen-error/20 text-nextgen-error rounded-full text-sm font-medium hover:bg-nextgen-error/30 transition-colors"
          >
            Admin Portal
          </Link>
        )}
        {(role === 'manager' || role === 'admin') && (
          <Link 
            href="/dashboard/manager"
            className="px-3 py-1 bg-nextgen-teal/20 text-nextgen-teal rounded-full text-sm font-medium hover:bg-nextgen-teal/30 transition-colors"
          >
            Manager Portal
          </Link>
        )}
        {(role === 'employee' || role === 'admin') && (
          <Link 
            href="/dashboard/employee"
            className="px-3 py-1 bg-nextgen-success/20 text-nextgen-success rounded-full text-sm font-medium hover:bg-nextgen-success/30 transition-colors"
          >
            Employee Portal
          </Link>
        )}

      </div>
      <p className="text-sm text-nextgen-light-gray mt-2">
        Your role: <span className="font-semibold capitalize text-nextgen-white">{role || 'Not set'}</span>
        {localRole && !userRole && <span className="text-xs opacity-75 ml-1">(Local)</span>}
      </p>
    </div>
  );
}
