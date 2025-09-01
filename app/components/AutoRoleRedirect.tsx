'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useUserRole } from '@/app/hooks/useUserRole'

export default function AutoRoleRedirect() {
  const { user, isLoaded } = useUser()
  const { role, loading } = useUserRole()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !loading && user && role) {
      // Redirect based on role
      switch (role) {
        case 'SUPER_ADMIN':
        case 'ADMIN':
          router.push('/dashboard/admin')
          break
        case 'MANAGER':
          router.push('/dashboard/manager')
          break
        case 'EMPLOYEE':
          router.push('/dashboard/employee')
          break
        case 'INTERN':
          router.push('/intern-portal')
          break
        default:
          router.push('/dashboard')
          break
      }
    }
  }, [isLoaded, loading, user, role, router])

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return null
}