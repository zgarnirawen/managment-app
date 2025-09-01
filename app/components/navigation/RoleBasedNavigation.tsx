'use client';

import { useUserRole } from '../../hooks/useUserRole';
import Link from 'next/link';

export default function RoleBasedNavigation() {
  const { role, loading } = useUserRole();

  if (loading) {
    return (
      <nav className="bg-white shadow-lg border-r min-h-screen w-64 fixed left-0 top-0 z-50">
        <div className="flex justify-center items-center h-16">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </nav>
    );
  }

  const getNavigationItems = () => {
    switch (role?.toUpperCase()) {
      case 'INTERN':
        return [
          { href: '/intern-portal', label: 'Intern Portal' },
          { href: '/dashboard/tasks', label: 'Tasks' },
          { href: '/dashboard/chat', label: 'Chat' }
        ];
      case 'EMPLOYEE':
        return [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/dashboard/tasks', label: 'Tasks' },
          { href: '/dashboard/projects', label: 'Projects' },
          { href: '/dashboard/chat', label: 'Chat' }
        ];
      case 'MANAGER':
        return [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/manager', label: 'Manager Portal' },
          { href: '/dashboard/employees', label: 'Employees' },
          { href: '/dashboard/projects', label: 'Projects' }
        ];
      case 'ADMIN':
        return [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/dashboard/admin', label: 'Admin Portal' },
          { href: '/dashboard/employees', label: 'Employees' }
        ];
      case 'SUPER_ADMIN':
        return [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/dashboard/super-admin', label: 'Super Admin' },
          { href: '/setup', label: 'System Setup' }
        ];
      default:
        return [
          { href: '/dashboard', label: 'Dashboard' }
        ];
    }
  };

  return (
    <nav className="bg-white shadow-lg border-r min-h-screen w-64 fixed left-0 top-0 z-50">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Navigation ({role || 'Guest'})</h2>
        <ul className="space-y-2">
          {getNavigationItems().map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block px-4 py-2 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
