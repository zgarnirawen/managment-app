'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const superAdminNavItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/employees', label: 'All Employees' },
  { href: '/dashboard/admin/intern-management', label: 'Intern Management' },
  { href: '/departments', label: 'Departments' },
  { href: '/roles', label: 'Role Management' },
  { href: '/system', label: 'System Settings' },
  { href: '/reports', label: 'Reports' },
  { href: '/audit', label: 'Audit Logs' },
]

export default function SuperAdminNavigation() {
  const pathname = usePathname()

  return (
    <nav className="space-y-2">
      {superAdminNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            pathname === item.href
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}