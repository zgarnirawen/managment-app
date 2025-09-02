'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { DatePickerWithRange } from '../ui/date-range-picker'
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  User,
  Target,
  Flag,
  Building,
  Clock,
  RefreshCw
} from 'lucide-react'
import { DateRange } from 'react-day-picker'

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void
  initialFilters?: Partial<SearchFilters>
  showFilters?: {
    employee?: boolean
    sprint?: boolean
    priority?: boolean
    status?: boolean
    department?: boolean
    dateRange?: boolean
    search?: boolean
  }
  placeholder?: string
  className?: string
}

export interface SearchFilters {
  search: string
  employee: string
  sprint: string
  priority: string
  status: string
  department: string
  dateRange: DateRange | undefined
  tags: string[]
}

interface FilterOption {
  value: string
  label: string
  count?: number
}

export const SearchFiltersComponent: React.FC<SearchFiltersProps> = ({
  onFiltersChange,
  initialFilters = {},
  showFilters = {
    employee: true,
    sprint: true,
    priority: true,
    status: true,
    department: true,
    dateRange: true,
    search: true
  },
  placeholder = "Search tasks, projects, or employees...",
  className = ""
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    employee: 'all',
    sprint: 'all',
    priority: 'all',
    status: 'all',
    department: 'all',
    dateRange: undefined,
    tags: [],
    ...initialFilters
  })

  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Mock data - replace with actual API calls
  const [filterOptions, setFilterOptions] = useState({
    employees: [] as FilterOption[],
    sprints: [] as FilterOption[],
    departments: [] as FilterOption[],
    tags: [] as FilterOption[]
  })

  useEffect(() => {
    loadFilterOptions()
  }, [])

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const loadFilterOptions = async () => {
    setLoading(true)
    try {
      // Mock API calls - replace with actual endpoints
      const mockEmployees: FilterOption[] = [
        { value: 'john-doe', label: 'John Doe', count: 15 },
        { value: 'jane-smith', label: 'Jane Smith', count: 12 },
        { value: 'mike-johnson', label: 'Mike Johnson', count: 8 },
        { value: 'sarah-wilson', label: 'Sarah Wilson', count: 10 },
        { value: 'david-brown', label: 'David Brown', count: 6 }
      ]

      const mockSprints: FilterOption[] = [
        { value: 'sprint-24-1', label: 'Sprint 24.1 - Q1 Features', count: 25 },
        { value: 'sprint-24-2', label: 'Sprint 24.2 - Bug Fixes', count: 18 },
        { value: 'sprint-24-3', label: 'Sprint 24.3 - Performance', count: 22 },
        { value: 'sprint-24-4', label: 'Sprint 24.4 - UI Updates', count: 14 }
      ]

      const mockDepartments: FilterOption[] = [
        { value: 'engineering', label: 'Engineering', count: 45 },
        { value: 'design', label: 'Design', count: 12 },
        { value: 'devops', label: 'DevOps', count: 8 },
        { value: 'marketing', label: 'Marketing', count: 6 },
        { value: 'sales', label: 'Sales', count: 4 }
      ]

      const mockTags: FilterOption[] = [
        { value: 'frontend', label: 'Frontend', count: 28 },
        { value: 'backend', label: 'Backend', count: 23 },
        { value: 'database', label: 'Database', count: 15 },
        { value: 'api', label: 'API', count: 18 },
        { value: 'security', label: 'Security', count: 9 },
        { value: 'performance', label: 'Performance', count: 12 },
        { value: 'testing', label: 'Testing', count: 16 }
      ]

      setFilterOptions({
        employees: mockEmployees,
        sprints: mockSprints,
        departments: mockDepartments,
        tags: mockTags
      })
    } catch (error) {
      console.error('Failed to load filter options:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      updateFilter('tags', [...filters.tags, tag])
    }
  }

  const removeTag = (tag: string) => {
    updateFilter('tags', filters.tags.filter(t => t !== tag))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      employee: 'all',
      sprint: 'all',
      priority: 'all',
      status: 'all',
      department: 'all',
      dateRange: undefined,
      tags: []
    })
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.employee !== 'all') count++
    if (filters.sprint !== 'all') count++
    if (filters.priority !== 'all') count++
    if (filters.status !== 'all') count++
    if (filters.department !== 'all') count++
    if (filters.dateRange) count++
    if (filters.tags.length > 0) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Search & Filters
          </CardTitle>
          <div className="flex items-center space-x-2">
            {activeFilterCount > 0 && (
              <Badge variant="secondary">
                {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {isExpanded ? 'Hide' : 'Show'} Filters
            </Button>
            {activeFilterCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Input */}
        {showFilters.search && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={placeholder}
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Employee Filter */}
              {showFilters.employee && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Employee
                  </label>
                  <Select value={filters.employee} onValueChange={(value) => updateFilter('employee', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      {filterOptions.employees.map((employee) => (
                        <SelectItem key={employee.value} value={employee.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{employee.label}</span>
                            {employee.count && (
                              <Badge variant="outline" className="ml-2">
                                {employee.count}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Sprint Filter */}
              {showFilters.sprint && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    Sprint
                  </label>
                  <Select value={filters.sprint} onValueChange={(value) => updateFilter('sprint', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sprints</SelectItem>
                      {filterOptions.sprints.map((sprint) => (
                        <SelectItem key={sprint.value} value={sprint.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{sprint.label}</span>
                            {sprint.count && (
                              <Badge variant="outline" className="ml-2">
                                {sprint.count}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Priority Filter */}
              {showFilters.priority && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Flag className="h-4 w-4 mr-2" />
                    Priority
                  </label>
                  <Select value={filters.priority} onValueChange={(value) => updateFilter('priority', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="low">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                          Low
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                          Medium
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                          High
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Status Filter */}
              {showFilters.status && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Status
                  </label>
                  <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="review">In Review</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Department Filter */}
              {showFilters.department && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    Department
                  </label>
                  <Select value={filters.department} onValueChange={(value) => updateFilter('department', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {filterOptions.departments.map((department) => (
                        <SelectItem key={department.value} value={department.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{department.label}</span>
                            {department.count && (
                              <Badge variant="outline" className="ml-2">
                                {department.count}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Date Range Filter */}
              {showFilters.dateRange && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Date Range
                  </label>
                  <DatePickerWithRange
                    date={filters.dateRange}
                    onDateChange={(date) => updateFilter('dateRange', date)}
                  />
                </div>
              )}
            </div>

            {/* Tags Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.tags.map((tag) => (
                  <Button
                    key={tag.value}
                    variant={filters.tags.includes(tag.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => 
                      filters.tags.includes(tag.value) 
                        ? removeTag(tag.value) 
                        : addTag(tag.value)
                    }
                  >
                    {tag.label}
                    {tag.count && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {tag.count}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
              
              {filters.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <span className="text-sm text-gray-600">Selected tags:</span>
                  {filters.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="default"
                      className="cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {filterOptions.tags.find(t => t.value === tag)?.label || tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadFilterOptions}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Options
              </Button>
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {activeFilterCount > 0 && (
          <div className="border-t pt-4">
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="outline">
                  Search: "{filters.search}"
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => updateFilter('search', '')}
                  />
                </Badge>
              )}
              {filters.employee !== 'all' && (
                <Badge variant="outline">
                  Employee: {filterOptions.employees.find(e => e.value === filters.employee)?.label || filters.employee}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => updateFilter('employee', 'all')}
                  />
                </Badge>
              )}
              {filters.sprint !== 'all' && (
                <Badge variant="outline">
                  Sprint: {filterOptions.sprints.find(s => s.value === filters.sprint)?.label || filters.sprint}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => updateFilter('sprint', 'all')}
                  />
                </Badge>
              )}
              {filters.priority !== 'all' && (
                <Badge variant="outline">
                  Priority: {filters.priority}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => updateFilter('priority', 'all')}
                  />
                </Badge>
              )}
              {filters.status !== 'all' && (
                <Badge variant="outline">
                  Status: {filters.status}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => updateFilter('status', 'all')}
                  />
                </Badge>
              )}
              {filters.department !== 'all' && (
                <Badge variant="outline">
                  Department: {filterOptions.departments.find(d => d.value === filters.department)?.label || filters.department}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => updateFilter('department', 'all')}
                  />
                </Badge>
              )}
              {filters.dateRange && (
                <Badge variant="outline">
                  Date Range
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => updateFilter('dateRange', undefined)}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
