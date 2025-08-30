'use client';

import Link from 'next/link';
import { useUser, SignInButton, SignOutButton } from '@clerk/nextjs';
import { Suspense, lazy, useState, useEffect } from 'react';
import HomeNavigation from './navigation/HomeNavigation';

// Lazy load notification component
const NotificationCenter = lazy(() => import('./notifications/NotificationCenter'));

export default function Navigation() {
  const { isSignedIn, user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
    // Get role from multiple sources after component mounts
    const role = user?.unsafeMetadata?.role as string || 
                 user?.publicMetadata?.role as string || 
                 localStorage.getItem('userRole');
    setUserRole(role);
  }, [user]);
  
  // Helper function to check if user has access to a feature
  const hasAccess = (requiredRoles: string[]) => {
    if (!userRole || !mounted) return false;
    return requiredRoles.includes(userRole.toLowerCase());
  };

  // Define navigation item interface
  interface NavigationItem {
    href: string;
    label: string;
    show: boolean;
    className?: string;
  }

  // Define navigation items based on detailed role requirements
  const getNavigationItems = (): NavigationItem[] => {
    if (!mounted) return []; // Return empty array during SSR to prevent mismatch
    
    const baseItems: NavigationItem[] = [
      { href: '/', label: 'Home', show: true },
      { href: '/dashboard', label: 'Dashboard', show: !!isSignedIn }
    ];

    // Role-specific items based on detailed requirements
    const roleItems: NavigationItem[] = [
      // 👨‍⚖️ Admin-only items (Administration, Payroll, Audit, Global Management)
      { href: '/dashboard/employees', label: '👥 Employee Management', show: hasAccess(['admin']), className: 'text-red-300 hover:text-red-200' },
      { href: '/payroll', label: '💰 Payroll', show: hasAccess(['admin']), className: 'text-green-300 hover:text-green-200' },
      { href: '/audit', label: '🔍 Audit Logs', show: hasAccess(['admin']), className: 'text-yellow-300 hover:text-yellow-200' },
      { href: '/policies', label: '📋 Policies', show: hasAccess(['admin']), className: 'text-indigo-300 hover:text-indigo-200' },
      
      // 👨‍💼 Manager+ items (Managers and Admins)
      { href: '/sprints', label: '🎯 Sprints', show: hasAccess(['admin', 'manager']), className: 'text-purple-300 hover:text-purple-200' },
      { href: '/leave', label: '🏖️ Leave Management', show: hasAccess(['admin', 'manager']), className: 'text-blue-300 hover:text-blue-200' },
      { href: '/reports', label: '📊 Team Reports', show: hasAccess(['admin', 'manager']), className: 'text-nextgen-lime hover:text-green-200' },
      { href: '/team-management', label: '👨‍👩‍👧‍👦 Team Management', show: hasAccess(['admin', 'manager']), className: 'text-cyan-300 hover:text-cyan-200' },
      
      // 👤 Employee+ items (Employees, Managers, and Admins - not Interns)
      { href: '/dashboard/tasks', label: '📝 Tasks', show: hasAccess(['admin', 'manager', 'employee']), className: 'text-white hover:text-nextgen-teal' },
      { href: '/dashboard/projects', label: '📁 Projects', show: hasAccess(['admin', 'manager', 'employee']), className: 'text-white hover:text-nextgen-teal' },
      { href: '/dashboard/calendar', label: '📅 Calendar', show: hasAccess(['admin', 'manager', 'employee']), className: 'text-white hover:text-nextgen-teal' },
      { href: '/timesheets', label: '⏰ Timesheets', show: hasAccess(['admin', 'manager', 'employee']), className: 'text-orange-300 hover:text-orange-200' },
      { href: '/gamification', label: '🏆 Achievements', show: hasAccess(['admin', 'manager', 'employee']), className: 'text-yellow-300 hover:text-yellow-200' },
      
      // 👨‍🎓 Intern-only items
      { href: '/intern-portal', label: '🎓 Intern Portal', show: hasAccess(['intern']), className: 'text-orange-300 hover:text-orange-200' },
      
      // 🌍 Shared items (All authenticated users)
      { href: '/dashboard/chat', label: '💬 Chat', show: !!isSignedIn && mounted, className: 'text-nextgen-teal hover:text-cyan-300' },
      { href: '/dashboard/notifications', label: '🔔 Notifications', show: !!isSignedIn && mounted, className: 'text-nextgen-teal hover:text-cyan-300' },
      { href: '/profile', label: '👤 Profile', show: !!isSignedIn && mounted, className: 'text-gray-300 hover:text-white' },
      { href: '/settings', label: '⚙️ Settings', show: !!isSignedIn && mounted, className: 'text-nextgen-light-gray hover:text-white' }
    ];

    return [...baseItems, ...roleItems];
  };

  return (
    <nav className="w-full bg-nextgen-dark-blue text-white py-4 px-8 flex gap-6 items-center justify-between border-b border-nextgen-light-gray shadow-lg transition-all duration-300">
      <div className="flex gap-6 items-center">
        <HomeNavigation 
          variant="dropdown" 
          showLabel={true} 
          size="md"
          className="mr-4"
        />
        
        {mounted && getNavigationItems().map((item) => 
          item.show ? (
            <Link 
              key={item.href}
              href={item.href} 
              className={`font-semibold hover:text-nextgen-teal transition-all duration-200 hover:scale-105 ${item.className || 'text-white hover:text-nextgen-teal'}`}
            >
              {item.label}
            </Link>
          ) : null
        )}
        
      </div>
      <div className="flex items-center gap-4">
        {isSignedIn && mounted && (
          <>
            <Suspense fallback={<div className="w-6 h-6 animate-pulse bg-nextgen-medium-gray rounded"></div>}>
              <NotificationCenter 
                employeeId="cmets2l7w0001mhu87uxes32j" 
                onNavigateHome={() => window.location.href = '/dashboard'}
              />
            </Suspense>
            {userRole && (
              <span className="text-xs bg-nextgen-medium-gray px-2 py-1 rounded-lg text-white transition-all duration-200 hover:bg-nextgen-teal hover:text-nextgen-dark-gray">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </span>
            )}
          </>
        )}
        {isSignedIn ? (
          <SignOutButton>
            <button className="bg-nextgen-error hover:bg-red-600 px-3 py-1 rounded-lg text-sm text-white transition-all duration-200 hover:scale-105 hover:shadow-lg">
              Sign Out
            </button>
          </SignOutButton>
        ) : (
          <SignInButton>
            <button className="bg-nextgen-teal hover:bg-nextgen-teal-hover px-3 py-1 rounded-lg text-sm text-nextgen-dark-gray transition-all duration-200 hover:scale-105 hover:shadow-lg">
              Sign In
            </button>
          </SignInButton>
        )}
      </div>
    </nav>
  );
}
