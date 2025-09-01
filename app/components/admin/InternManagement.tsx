'use client'

import { useState, useEffect } from 'react'

interface Intern {
  id: string
  name: string
  email: string
  department: string
  hireDate: string
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED'
}

export default function InternManagement() {
  const [interns, setInterns] = useState<Intern[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInterns()
  }, [])

  const fetchInterns = async () => {
    try {
      const response = await fetch('/api/interns')
      if (response.ok) {
        const data = await response.json()
        setInterns(data.interns || [])
      }
    } catch (error) {
      console.error('Failed to fetch interns:', error)
    } finally {
      setLoading(false)
    }
  }

  const promoteIntern = async (internId: string) => {
    try {
      const response = await fetch(`/api/interns/${internId}/promote`, {
        method: 'POST'
      })
      if (response.ok) {
        fetchInterns() // Refresh the list
      }
    } catch (error) {
      console.error('Failed to promote intern:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Intern Management</h2>
      
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {interns.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No interns found</p>
            </div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {interns.map((intern) => (
                    <tr key={intern.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {intern.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {intern.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {intern.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          intern.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          intern.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {intern.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {intern.status === 'ACTIVE' && (
                          <button
                            onClick={() => promoteIntern(intern.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Promote to Employee
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}