'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Bell, 
  Award,
  BarChart3,
  Clock,
  MessageSquare,
  Settings,
  LogOut,
  Shield,
  Database,
  Activity,
  BookOpen,
  Target,
  Trophy,
  Star,
  Crown,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  href: string;
  roles: string[];
  badge?: number;
  submenu?: NavigationItem[];
}

export default function RoleBasedNavigation() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(0);

  const userRole = user?.unsafeMetadata?.role as string;

  useEffect(() => {
    // Fetch notifications count
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      // Mock notification count - in real app, fetch from API
      setNotifications(3);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      href: `/${userRole}`,
      roles: ['intern', 'employee', 'manager', 'admin', 'super_admin']
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: Target,
      href: '/tasks',
      roles: ['intern', 'employee', 'manager', 'admin', 'super_admin'],
      submenu: [
        { id: 'my-tasks', label: 'My Tasks', icon: Target, href: '/tasks/my', roles: ['intern', 'employee', 'manager', 'admin', 'super_admin'] },
        { id: 'assign-tasks', label: 'Assign Tasks', icon: Users, href: '/tasks/assign', roles: ['manager', 'admin', 'super_admin'] }
      ]
    },
    {
      id: 'learning',
      label: 'Learning',
      icon: BookOpen,
      href: '/learning',
      roles: ['intern'],
      submenu: [
        { id: 'courses', label: 'Courses', icon: BookOpen, href: '/learning/courses', roles: ['intern'] },
        { id: 'progress', label: 'Progress', icon: Trophy, href: '/learning/progress', roles: ['intern'] }
      ]
    },
    {
      id: 'team',
      label: 'Team Management',
      icon: Users,
      href: '/team',
      roles: ['manager', 'admin', 'super_admin'],
      submenu: [
        { id: 'team-overview', label: 'Team Overview', icon: Users, href: '/team/overview', roles: ['manager', 'admin', 'super_admin'] },
        { id: 'promotions', label: 'Promotions', icon: Award, href: '/team/promotions', roles: ['manager', 'admin', 'super_admin'] }
      ]
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageSquare,
      href: '/chat',
      roles: ['employee', 'manager', 'admin', 'super_admin']
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      href: '/calendar',
      roles: ['employee', 'manager', 'admin', 'super_admin']
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      href: '/reports',
      roles: ['manager', 'admin', 'super_admin']
    },
    {
      id: 'admin',
      label: 'Administration',
      icon: Shield,
      href: '/admin',
      roles: ['admin', 'super_admin'],
      submenu: [
        { id: 'user-management', label: 'User Management', icon: Users, href: '/admin/users', roles: ['admin', 'super_admin'] },
        { id: 'system-config', label: 'System Config', icon: Settings, href: '/admin/config', roles: ['admin', 'super_admin'] },
        { id: 'admin-promotion', label: 'Admin Promotion', icon: Crown, href: '/admin/promote', roles: ['super_admin'] }
      ]
    },
    {
      id: 'super-admin',
      label: 'Super Admin',
      icon: Crown,
      href: '/dashboard/super-admin',
      roles: ['super_admin'],
      submenu: [
        { id: 'admin-management', label: 'Admin Management', icon: Shield, href: '/dashboard/super-admin', roles: ['super_admin'] },
        { id: 'succession', label: 'Succession Planning', icon: Crown, href: '/dashboard/super-admin', roles: ['super_admin'] },
        { id: 'system-override', label: 'System Override', icon: Database, href: '/dashboard/super-admin', roles: ['super_admin'] }
      ]
    }
  ];

  const filteredNavigation = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'intern': return 'bg-green-100 text-green-800 border-green-200';
      case 'employee': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'manager': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'super_admin': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'intern': return '🎓';
      case 'employee': return '👤';
      case 'manager': return '👔';
      case 'admin': return '⚙️';
      case 'super_admin': return '👑';
      default: return '👤';
    }
  };

  const handleLogout = () => {
    router.push('/sign-out');
  };

  if (!isLoaded || !user) {
    return null;
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex bg-white shadow-sm border-b border-gray-200">
        <div className="w-full px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Role Badge */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EM</span>
                </div>
                <span className="font-bold text-gray-900">Employee Manager</span>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(userRole)}`}>
                {getRoleIcon(userRole)} {userRole?.replace('_', ' ').toUpperCase()}
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center space-x-1">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                const hasSubmenu = item.submenu && item.submenu.length > 0;
                const filteredSubmenu = item.submenu?.filter(subItem => 
                  subItem.roles.includes(userRole)
                );

                return (
                  <div key={item.id} className="relative">
                    <button
                      onClick={() => {
                        if (hasSubmenu) {
                          setActiveDropdown(activeDropdown === item.id ? null : item.id);
                        } else {
                          router.push(item.href);
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                      {hasSubmenu && <ChevronDown className="w-3 h-3" />}
                    </button>

                    {/* Dropdown Menu */}
                    {hasSubmenu && activeDropdown === item.id && filteredSubmenu && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        {filteredSubmenu.map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <button
                              key={subItem.id}
                              onClick={() => {
                                router.push(subItem.href);
                                setActiveDropdown(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                            >
                              <SubIcon className="w-4 h-4" />
                              {subItem.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Gamification Score */}
              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Star className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">1,250</span>
              </div>

              {/* Settings */}
              <button 
                onClick={() => router.push('/settings')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Logout */}
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>

              {/* User Avatar */}
              <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </span>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{user.fullName}</div>
                  <div className="text-gray-500">{user.primaryEmailAddress?.emailAddress}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-white shadow-sm border-b border-gray-200">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EM</span>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(userRole)}`}>
                {getRoleIcon(userRole)} {userRole?.replace('_', ' ').toUpperCase()}
              </div>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="border-t border-gray-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      router.push(item.href);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-auto">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
              
              <div className="border-t border-gray-200 pt-2 mt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
