'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallbackPath?: string;
}

export default function RoleGuard({ 
  allowedRoles, 
  children, 
  fallbackPath = '/dashboard' 
}: RoleGuardProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    setIsChecking(true);

    // Add a small delay to prevent rapid redirects
    const checkAccess = setTimeout(() => {
      // If no user, redirect to sign in
      if (!user) {
        router.replace('/sign-in');
        return;
      }

      const userRole = user.unsafeMetadata?.role as string;
      console.log('🔐 RoleGuard Check:', {
        currentPath: window.location.pathname,
        userRole: userRole || 'No role assigned',
        allowedRoles,
        userId: user.id
      });

      // Check if user has any of the allowed roles
      const hasPermission = allowedRoles.includes(userRole) || 
                           (allowedRoles.includes('any') && userRole);

      if (hasPermission) {
        console.log('✅ Access granted');
        setHasAccess(true);
        setIsChecking(false);
      } else {
        console.log('❌ Access denied, redirecting...');
        
        // For users without a role, show access denied instead of redirecting
        if (!userRole) {
          console.log('⚠️ No role assigned, showing access denied page');
          setHasAccess(false);
          setIsChecking(false);
          return;
        }

        // Redirect based on user's actual role
        let redirectPath = fallbackPath;
        
        if (userRole === 'admin' && window.location.pathname !== '/dashboard/admin') {
          redirectPath = '/dashboard/admin';
        } else if (userRole === 'manager' && window.location.pathname !== '/dashboard/manager') {
          redirectPath = '/dashboard/manager';
        } else if (userRole === 'employee' && window.location.pathname !== '/dashboard/employee') {
          redirectPath = '/dashboard/employee';
        }

        // Only redirect if we're not already on the target path
        if (window.location.pathname !== redirectPath) {
          console.log(`🔄 Redirecting to ${redirectPath}`);
          router.replace(redirectPath);
        } else {
          // If we're on the correct path but don't have access, show access denied
          console.log('🚫 On correct path but access denied');
          setHasAccess(false);
          setIsChecking(false);
        }
      }
    }, 100); // Small delay to prevent rapid state changes

    return () => clearTimeout(checkAccess);
  }, [user, isLoaded, allowedRoles, router, fallbackPath]);

  if (!isLoaded || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!hasAccess) {
    const userRole = user?.publicMetadata?.role as string;
    
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            {!userRole 
              ? "You don't have a role assigned yet. Contact your administrator to assign you a role."
              : `You need ${allowedRoles.join(' or ')} role to access this page. Your current role is: ${userRole}`
            }
          </p>
          <div className="space-y-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Go to Dashboard
            </button>
            {!userRole && (
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Continue as Guest
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
