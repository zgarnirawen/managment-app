// Shared Components Index - Export all shared features for cross-dashboard use

// Notifications
export { NotificationDropdown } from '../notifications/NotificationDropdown'
export { NotificationProvider, useNotifications } from '../../contexts/NotificationContext'

// Analytics & Reports
export { ReportsAnalytics } from '../analytics/ReportsAnalytics'

// Search & Filters
export { SearchFiltersComponent } from '../search/SearchFilters'
export type { SearchFilters } from '../search/SearchFilters'

// Shared Types
export interface SharedFeatureProps {
  department?: string
  employee?: string
  className?: string
}

// Analytics Hook
import { useState, useEffect } from 'react'

export interface AnalyticsHookProps {
  type?: string
  dateRange?: string
  department?: string
  employee?: string
}

export const useAnalytics = ({ type = 'dashboard', dateRange = '30d', department, employee }: AnalyticsHookProps = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const params = new URLSearchParams({
          type,
          dateRange,
          ...(department && { department }),
          ...(employee && { employee })
        })

        const response = await fetch(`/api/analytics?${params}`)
        const result = await response.json()
        
        if (result.success) {
          setData(result.data)
        } else {
          setError(result.error || 'Failed to fetch analytics')
        }
      } catch (err) {
        setError('Failed to fetch analytics')
        console.error('Analytics fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [type, dateRange, department, employee])

  return { data, loading, error }
}

// Search & Filters Hook
export interface SearchHookProps {
  initialFilters?: Partial<any>
  onSearch?: (results: any[]) => void
  endpoint?: string
}

export const useSearch = ({ initialFilters = {}, onSearch, endpoint = '/api/search' }: SearchHookProps = {}) => {
  const [filters, setFilters] = useState(initialFilters)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async (searchFilters: any) => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v))
          } else if (typeof value === 'object' && key === 'dateRange') {
            const dateRange = value as { from?: Date; to?: Date }
            if (dateRange.from) params.append('dateFrom', dateRange.from.toISOString())
            if (dateRange.to) params.append('dateTo', dateRange.to.toISOString())
          } else {
            params.append(key, value.toString())
          }
        }
      })

      const response = await fetch(`${endpoint}?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setResults(result.data)
        onSearch?.(result.data)
      } else {
        setError(result.error || 'Search failed')
      }
    } catch (err) {
      setError('Search failed')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
    search(newFilters)
  }

  return {
    filters,
    results,
    loading,
    error,
    search,
    handleFiltersChange
  }
}

// Utility functions for shared features
export const formatNotificationMessage = (type: string, data: any) => {
  switch (type) {
    case 'task_assigned':
      return `New task assigned: ${data.taskTitle}`
    case 'sprint_completed':
      return `Sprint "${data.sprintName}" has been completed`
    case 'deadline_reminder':
      return `Deadline reminder: ${data.taskTitle} is due ${data.dueDate}`
    case 'meeting_scheduled':
      return `Meeting scheduled: ${data.meetingTitle} at ${data.time}`
    default:
      return data.message || 'New notification'
  }
}

export const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'task_assigned':
      return 'Target'
    case 'sprint_completed':
      return 'CheckCircle'
    case 'deadline_reminder':
      return 'Clock'
    case 'meeting_scheduled':
      return 'Calendar'
    case 'system_update':
      return 'Settings'
    default:
      return 'Bell'
  }
}

export const exportToCSV = (data: any[], filename: string) => {
  if (!data.length) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      }).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

// Component Props Types
export interface NotificationProps extends SharedFeatureProps {
  showBadge?: boolean
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export interface AnalyticsProps extends SharedFeatureProps {
  reportType?: 'dashboard' | 'sprint-velocity' | 'task-completion' | 'employee-productivity' | 'department-overview'
  dateRange?: string
  showExport?: boolean
}

export interface SearchProps extends SharedFeatureProps {
  placeholder?: string
  showFilters?: {
    employee?: boolean
    sprint?: boolean
    priority?: boolean
    status?: boolean
    department?: boolean
    dateRange?: boolean
    search?: boolean
  }
  onResultsChange?: (results: any[]) => void
}
