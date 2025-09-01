'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'

interface Intern {
  id: string
  name: string
  email: string
  department: string
  status: string
  hireDate: string
}

export default function InternManagement() {
  const [interns, setInterns] = useState<Intern[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInterns()
  }, [])

  const fetchInterns = async () => {
    try {
      const response = await fetch('/api/employees?role=INTERN')
      if (response.ok) {
        const data = await response.json()
        setInterns(data.employees || [])
      }
    } catch (error) {
      console.error('Failed to fetch interns:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Intern Management</h1>
        <p className="text-gray-600">Manage intern applications and promotions</p>
      </div>

      {interns.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No interns found in the system.</p>
            <p className="text-sm text-gray-400 mt-2">
              Interns will appear here when they register for the first time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {interns.map((intern) => (
            <Card key={intern.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{intern.name}</h3>
                    <p className="text-sm text-gray-600">{intern.email}</p>
                    <p className="text-sm text-gray-500">{intern.department}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      {intern.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      Hired: {new Date(intern.hireDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}