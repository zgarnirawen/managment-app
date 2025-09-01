'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const internNavItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/intern-tasks', label: 'My Tasks' },
  { href: '/training', label: 'Training' },
  { href: '/chat', label: 'Team Chat' },
  { href: '/resources', label: 'Resources' },
]

export default function InternNavigation() {
  const pathname = usePathname()

  return (
    <nav className="space-y-2">
      {internNavItems.map((item) => (
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