'use client';

import { useUser } from '@clerk/nextjs';
import { useUserRole } from '../hooks/useUserRole';
import { useEffect, useState } from 'react';

import Link from 'next/link';

export default function DebugPage() {
  const { user, isLoaded } = useUser();
  const { role, loading } = useUserRole();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    setDebugInfo({
      userLoaded: isLoaded,
      userExists: !!user,
      userEmail: user?.emailAddresses?.[0]?.emailAddress,
      userName: user?.firstName + ' ' + user?.lastName,
      roleLoaded: !loading,
      userRole: role,
      timestamp: new Date().toLocaleTimeString()
    });
  }, [isLoaded, user, loading, role]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🔧 Debug Dashboard
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>User Loaded: <span className={isLoaded ? 'text-green-600' : 'text-red-600'}>{isLoaded ? 'Yes' : 'No'}</span></div>
            <div>User Exists: <span className={user ? 'text-green-600' : 'text-red-600'}>{user ? 'Yes' : 'No'}</span></div>
            <div>Role Loaded: <span className={!loading ? 'text-green-600' : 'text-red-600'}>{!loading ? 'Yes' : 'Loading...'}</span></div>
            <div>Current Role: <span className="text-blue-600">{role || 'None'}</span></div>
            {user && (
              <>
                <div>Email: <span className="text-purple-600">{user.emailAddresses?.[0]?.emailAddress}</span></div>
                <div>Name: <span className="text-purple-600">{user.firstName} {user.lastName}</span></div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Available Actions</h2>
          <div className="space-y-2">
            {!user && (
              <Link 
                href="/sign-in" 
                className="block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
              >
                → Sign In to Continue
              </Link>
            )}
            {user && role === 'SUPER_ADMIN' && (
              <div className="space-y-2">
                <a 
                  href="/dashboard/admin" 
                  className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center"
                >
                  → Access Admin Dashboard
                </a>
                <a 
                  href="/email" 
                  className="block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-center"
                >
                  → Email System
                </a>
                <a 
                  href="/statistics" 
                  className="block bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 text-center"
                >
                  → Statistics Dashboard
                </a>
                <a 
                  href="/collaboration" 
                  className="block bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 text-center"
                >
                  → Collaboration Hub
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
