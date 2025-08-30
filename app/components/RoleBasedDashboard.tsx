'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from './ui/button';

interface DashboardCard {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: string;
  restricted?: boolean;
}

export default function RoleBasedDashboard() {
  const { user, isLoaded } = useUser();
  
  // Get role from multiple sources
  const userRole = user?.unsafeMetadata?.role as string || 
                   user?.publicMetadata?.role as string || 
                   (typeof window !== 'undefined' ? localStorage.getItem('userRole') : null);

  // Helper function to check if user has access to a feature
  const hasAccess = (requiredRoles: string[]) => {
    if (!userRole) return false;
    return requiredRoles.includes(userRole.toLowerCase());
  };

  // Role-specific dashboard cards
  const getDashboardCards = (): DashboardCard[] => {
    const baseCards: DashboardCard[] = [
      {
        title: 'Profile',
        description: 'Manage your personal information',
        href: '/profile',
        icon: '👤',
        color: 'bg-blue-500/20 border-blue-500'
      },
      {
        title: 'Notifications',
        description: 'View your notifications and updates',
        href: '/dashboard/notifications',
        icon: '🔔',
        color: 'bg-green-500/20 border-green-500'
      },
      {
        title: 'Chat',
        description: 'Communicate with your team',
        href: '/dashboard/chat',
        icon: '💬',
        color: 'bg-purple-500/20 border-purple-500'
      }
    ];

    const roleCards: DashboardCard[] = [
      // Admin-only cards
      {
        title: 'Employee Management',
        description: 'Manage all employees and organizational structure',
        href: '/dashboard/employees',
        icon: '👥',
        color: 'bg-red-500/20 border-red-500',
        restricted: !hasAccess(['admin'])
      },
      {
        title: 'Payroll System',
        description: 'Manage payroll, salaries, and compensation',
        href: '/payroll',
        icon: '💰',
        color: 'bg-green-600/20 border-green-600',
        restricted: !hasAccess(['admin'])
      },
      {
        title: 'Audit Logs',
        description: 'Monitor system activity and security events',
        href: '/audit',
        icon: '🔍',
        color: 'bg-yellow-500/20 border-yellow-500',
        restricted: !hasAccess(['admin'])
      },
      {
        title: 'Policies',
        description: 'Create and manage organizational policies',
        href: '/policies',
        icon: '📋',
        color: 'bg-indigo-500/20 border-indigo-500',
        restricted: !hasAccess(['admin'])
      },

      // Manager+ cards
      {
        title: 'Sprint Management',
        description: 'Plan and track development sprints',
        href: '/sprints',
        icon: '🎯',
        color: 'bg-purple-600/20 border-purple-600',
        restricted: !hasAccess(['admin', 'manager'])
      },
      {
        title: 'Leave Management',
        description: 'Approve and manage team leave requests',
        href: '/leave',
        icon: '🏖️',
        color: 'bg-blue-600/20 border-blue-600',
        restricted: !hasAccess(['admin', 'manager'])
      },
      {
        title: 'Team Reports',
        description: 'View team performance and analytics',
        href: '/reports',
        icon: '📊',
        color: 'bg-cyan-500/20 border-cyan-500',
        restricted: !hasAccess(['admin', 'manager'])
      },

      // Employee+ cards
      {
        title: 'My Tasks',
        description: 'View and manage your assigned tasks',
        href: '/dashboard/tasks',
        icon: '📝',
        color: 'bg-orange-500/20 border-orange-500',
        restricted: !hasAccess(['admin', 'manager', 'employee'])
      },
      {
        title: 'Projects',
        description: 'Access your project workspaces',
        href: '/dashboard/projects',
        icon: '📁',
        color: 'bg-teal-500/20 border-teal-500',
        restricted: !hasAccess(['admin', 'manager', 'employee'])
      },
      {
        title: 'Calendar',
        description: 'Manage your schedule and meetings',
        href: '/dashboard/calendar',
        icon: '📅',
        color: 'bg-rose-500/20 border-rose-500',
        restricted: !hasAccess(['admin', 'manager', 'employee'])
      },
      {
        title: 'Timesheets',
        description: 'Track and manage your work hours',
        href: '/timesheets',
        icon: '⏰',
        color: 'bg-amber-500/20 border-amber-500',
        restricted: !hasAccess(['admin', 'manager', 'employee'])
      },
      {
        title: 'Achievements',
        description: 'View your badges and progress',
        href: '/gamification',
        icon: '🏆',
        color: 'bg-yellow-600/20 border-yellow-600',
        restricted: !hasAccess(['admin', 'manager', 'employee'])
      },

      // Intern-only cards
      {
        title: 'Intern Portal',
        description: 'Access your learning resources and mentorship',
        href: '/intern-portal',
        icon: '🎓',
        color: 'bg-pink-500/20 border-pink-500',
        restricted: !hasAccess(['intern'])
      }
    ];

    return [...baseCards, ...roleCards.filter(card => !card.restricted)];
  };

  const getRoleGreeting = () => {
    if (!userRole) return 'Welcome to your dashboard';
    
    switch (userRole.toLowerCase()) {
      case 'admin':
        return '👨‍⚖️ Admin Dashboard - Full System Access';
      case 'manager':
        return '👨‍💼 Manager Dashboard - Team & Project Management';
      case 'employee':
        return '👤 Employee Dashboard - Personal Workspace';
      case 'intern':
        return '👨‍🎓 Intern Portal - Learning & Development';
      default:
        return 'Welcome to your dashboard';
    }
  };

  const getRoleStats = () => {
    switch (userRole?.toLowerCase()) {
      case 'admin':
        return [
          { label: 'Total Employees', value: '156', icon: '👥' },
          { label: 'Active Policies', value: '23', icon: '📋' },
          { label: 'Pending Approvals', value: '8', icon: '⏳' },
          { label: 'System Health', value: '99.9%', icon: '💚' }
        ];
      case 'manager':
        return [
          { label: 'Team Members', value: '12', icon: '👥' },
          { label: 'Active Sprints', value: '3', icon: '🎯' },
          { label: 'Pending Reviews', value: '5', icon: '📝' },
          { label: 'Team Performance', value: '94%', icon: '📊' }
        ];
      case 'employee':
        return [
          { label: 'Active Tasks', value: '7', icon: '📝' },
          { label: 'This Week Hours', value: '32.5', icon: '⏰' },
          { label: 'Completed Projects', value: '4', icon: '✅' },
          { label: 'Achievement Score', value: '850', icon: '🏆' }
        ];
      case 'intern':
        return [
          { label: 'Learning Tasks', value: '5', icon: '📚' },
          { label: 'Mentor Sessions', value: '3', icon: '👨‍🏫' },
          { label: 'Skills Learned', value: '8', icon: '🎯' },
          { label: 'Progress', value: '76%', icon: '📈' }
        ];
      default:
        return [];
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nextgen-teal"></div>
      </div>
    );
  }

  const dashboardCards = getDashboardCards();
  const stats = getRoleStats();

  return (
    <div className="space-y-8">
      {/* Role-based Greeting */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-nextgen-white mb-2">
          {getRoleGreeting()}
        </h1>
        <p className="text-nextgen-light-gray">
          {user?.firstName ? `Welcome back, ${user.firstName}!` : 'Welcome back!'}
        </p>
        {userRole && (
          <div className="mt-4">
            <span className="inline-block px-4 py-2 bg-nextgen-teal/20 text-nextgen-teal rounded-full text-sm font-semibold">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Access Level
            </span>
          </div>
        )}
      </div>

      {/* Role-based Statistics */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-nextgen-medium-gray rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-nextgen-light-gray text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-nextgen-white">{stat.value}</p>
                </div>
                <div className="text-2xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dashboard Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card, index) => (
          <Link key={index} href={card.href}>
            <div className={`
              bg-nextgen-medium-gray rounded-lg p-6 
              hover:bg-nextgen-dark-blue/50 transition-all duration-200 
              border-2 ${card.color}
              hover:scale-105 cursor-pointer
            `}>
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{card.icon}</div>
                <div className="text-nextgen-light-gray text-xs">
                  {userRole?.toUpperCase()}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-nextgen-white mb-2">
                {card.title}
              </h3>
              <p className="text-nextgen-light-gray text-sm">
                {card.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-nextgen-medium-gray rounded-lg p-6">
        <h3 className="text-xl font-semibold text-nextgen-white mb-4">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          {hasAccess(['admin']) && (
            <>
              <Button size="sm" className="bg-red-500 hover:bg-red-600">
                🚨 System Alert
              </Button>
              <Button size="sm" variant="outline">
                📊 Generate Report
              </Button>
            </>
          )}
          {hasAccess(['admin', 'manager']) && (
            <>
              <Button size="sm" variant="outline">
                ✅ Approve Requests
              </Button>
              <Button size="sm" variant="outline">
                📅 Schedule Meeting
              </Button>
            </>
          )}
          {hasAccess(['admin', 'manager', 'employee']) && (
            <>
              <Button size="sm" variant="outline">
                ⏰ Clock In/Out
              </Button>
              <Button size="sm" variant="outline">
                📝 Create Task
              </Button>
            </>
          )}
          {hasAccess(['intern']) && (
            <>
              <Button size="sm" variant="outline">
                🎓 Start Learning
              </Button>
              <Button size="sm" variant="outline">
                👨‍🏫 Contact Mentor
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
