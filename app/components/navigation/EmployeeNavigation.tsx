'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const employeeNavItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/tasks', label: 'My Tasks' },
  { href: '/timesheets', label: 'Time Tracking' },
  { href: '/projects', label: 'Projects' },
  { href: '/chat', label: 'Team Chat' },
  { href: '/calendar', label: 'Calendar' },
]

export default function EmployeeNavigation() {
  const pathname = usePathname()

  return (
    <nav className="space-y-2">
      {employeeNavItems.map((item) => (
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