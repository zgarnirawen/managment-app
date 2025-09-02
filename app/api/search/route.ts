import { NextRequest, NextResponse } from 'next/server'

// Mock data for search functionality
const mockData = {
  tasks: [
    {
      id: 'task-1',
      title: 'Implement user authentication',
      description: 'Set up JWT-based authentication system',
      status: 'in-progress',
      priority: 'high',
      assignee: 'john-doe',
      assigneeName: 'John Doe',
      department: 'engineering',
      sprint: 'sprint-24-1',
      sprintName: 'Sprint 24.1 - Q1 Features',
      tags: ['frontend', 'security'],
      createdAt: '2024-01-15T09:00:00Z',
      dueDate: '2024-01-25T17:00:00Z'
    },
    {
      id: 'task-2',
      title: 'Design dashboard mockups',
      description: 'Create wireframes and mockups for admin dashboard',
      status: 'completed',
      priority: 'medium',
      assignee: 'jane-smith',
      assigneeName: 'Jane Smith',
      department: 'design',
      sprint: 'sprint-24-1',
      sprintName: 'Sprint 24.1 - Q1 Features',
      tags: ['frontend', 'design'],
      createdAt: '2024-01-10T10:00:00Z',
      dueDate: '2024-01-20T17:00:00Z'
    },
    {
      id: 'task-3',
      title: 'Setup CI/CD pipeline',
      description: 'Configure automated deployment pipeline',
      status: 'pending',
      priority: 'high',
      assignee: 'mike-johnson',
      assigneeName: 'Mike Johnson',
      department: 'devops',
      sprint: 'sprint-24-2',
      sprintName: 'Sprint 24.2 - Bug Fixes',
      tags: ['backend', 'devops'],
      createdAt: '2024-01-12T11:00:00Z',
      dueDate: '2024-01-30T17:00:00Z'
    },
    {
      id: 'task-4',
      title: 'Database optimization',
      description: 'Optimize queries and add proper indexing',
      status: 'in-progress',
      priority: 'medium',
      assignee: 'sarah-wilson',
      assigneeName: 'Sarah Wilson',
      department: 'engineering',
      sprint: 'sprint-24-2',
      sprintName: 'Sprint 24.2 - Bug Fixes',
      tags: ['database', 'performance'],
      createdAt: '2024-01-14T08:00:00Z',
      dueDate: '2024-01-28T17:00:00Z'
    },
    {
      id: 'task-5',
      title: 'Marketing campaign analysis',
      description: 'Analyze Q4 marketing campaign performance',
      status: 'completed',
      priority: 'low',
      assignee: 'david-brown',
      assigneeName: 'David Brown',
      department: 'marketing',
      sprint: 'sprint-24-3',
      sprintName: 'Sprint 24.3 - Performance',
      tags: ['analysis', 'marketing'],
      createdAt: '2024-01-08T14:00:00Z',
      dueDate: '2024-01-18T17:00:00Z'
    }
  ],
  employees: [
    {
      id: 'john-doe',
      name: 'John Doe',
      email: 'john.doe@company.com',
      department: 'engineering',
      role: 'Senior Developer',
      tasksAssigned: 15,
      tasksCompleted: 12
    },
    {
      id: 'jane-smith',
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      department: 'design',
      role: 'UI/UX Designer',
      tasksAssigned: 12,
      tasksCompleted: 10
    },
    {
      id: 'mike-johnson',
      name: 'Mike Johnson',
      email: 'mike.johnson@company.com',
      department: 'devops',
      role: 'DevOps Engineer',
      tasksAssigned: 8,
      tasksCompleted: 6
    },
    {
      id: 'sarah-wilson',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@company.com',
      department: 'engineering',
      role: 'Backend Developer',
      tasksAssigned: 10,
      tasksCompleted: 8
    },
    {
      id: 'david-brown',
      name: 'David Brown',
      email: 'david.brown@company.com',
      department: 'marketing',
      role: 'Marketing Analyst',
      tasksAssigned: 6,
      tasksCompleted: 5
    }
  ],
  projects: [
    {
      id: 'project-1',
      name: 'Employee Management System',
      description: 'Complete employee management and time tracking platform',
      status: 'in-progress',
      department: 'engineering',
      manager: 'john-doe',
      managerName: 'John Doe',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-03-31T23:59:59Z',
      progress: 65
    },
    {
      id: 'project-2',
      name: 'UI/UX Redesign',
      description: 'Complete redesign of the user interface',
      status: 'completed',
      department: 'design',
      manager: 'jane-smith',
      managerName: 'Jane Smith',
      startDate: '2023-12-01T00:00:00Z',
      endDate: '2024-01-15T23:59:59Z',
      progress: 100
    }
  ]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get search parameters
    const search = searchParams.get('search') || ''
    const employee = searchParams.get('employee') || 'all'
    const sprint = searchParams.get('sprint') || 'all'
    const priority = searchParams.get('priority') || 'all'
    const status = searchParams.get('status') || 'all'
    const department = searchParams.get('department') || 'all'
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const tags = searchParams.getAll('tags')
    const type = searchParams.get('type') || 'tasks' // tasks, employees, projects

    let results: any[] = []

    // Select data source based on type
    switch (type) {
      case 'employees':
        results = mockData.employees
        break
      case 'projects':
        results = mockData.projects
        break
      case 'tasks':
      default:
        results = mockData.tasks
        break
    }

    // Apply filters
    let filteredResults = results

    // Text search
    if (search) {
      const searchLower = search.toLowerCase()
      filteredResults = filteredResults.filter(item => {
        const searchableFields = ['title', 'name', 'description', 'assigneeName', 'managerName', 'email', 'role']
        return searchableFields.some(field => 
          item[field]?.toLowerCase().includes(searchLower)
        )
      })
    }

    // Employee filter
    if (employee !== 'all') {
      filteredResults = filteredResults.filter(item => 
        item.assignee === employee || item.manager === employee || item.id === employee
      )
    }

    // Sprint filter
    if (sprint !== 'all') {
      filteredResults = filteredResults.filter(item => item.sprint === sprint)
    }

    // Priority filter
    if (priority !== 'all') {
      filteredResults = filteredResults.filter(item => item.priority === priority)
    }

    // Status filter
    if (status !== 'all') {
      filteredResults = filteredResults.filter(item => item.status === status)
    }

    // Department filter
    if (department !== 'all') {
      filteredResults = filteredResults.filter(item => item.department === department)
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filteredResults = filteredResults.filter(item => {
        const itemDate = new Date(item.createdAt || item.startDate)
        const fromDate = dateFrom ? new Date(dateFrom) : null
        const toDate = dateTo ? new Date(dateTo) : null

        if (fromDate && itemDate < fromDate) return false
        if (toDate && itemDate > toDate) return false
        return true
      })
    }

    // Tags filter
    if (tags.length > 0) {
      filteredResults = filteredResults.filter(item => 
        item.tags && tags.some((tag: string) => item.tags.includes(tag))
      )
    }

    // Add search metadata
    const searchMeta = {
      total: filteredResults.length,
      query: search,
      filters: {
        employee: employee !== 'all' ? employee : null,
        sprint: sprint !== 'all' ? sprint : null,
        priority: priority !== 'all' ? priority : null,
        status: status !== 'all' ? status : null,
        department: department !== 'all' ? department : null,
        dateRange: (dateFrom || dateTo) ? { from: dateFrom, to: dateTo } : null,
        tags: tags.length > 0 ? tags : null
      }
    }

    // Sort results by relevance (priority, then date)
    filteredResults.sort((a, b) => {
      // Priority sorting
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }

      // Date sorting (most recent first)
      const aDate = new Date(a.createdAt || a.startDate)
      const bDate = new Date(b.createdAt || b.startDate)
      return bDate.getTime() - aDate.getTime()
    })

    return NextResponse.json({
      success: true,
      data: filteredResults,
      meta: searchMeta
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to perform search',
        data: [],
        meta: { total: 0 }
      },
      { status: 500 }
    )
  }
}

// POST endpoint for advanced search
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      query, 
      filters = {},
      sortBy = 'relevance',
      sortOrder = 'desc',
      page = 1,
      limit = 50
    } = body

    // Use GET logic with POST body parameters
    const searchParams = new URLSearchParams()
    
    if (query) searchParams.set('search', query)
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else {
          searchParams.set(key, value as string)
        }
      }
    })

    // Create a mock request for reuse
    const mockRequest = new NextRequest(`${request.url}?${searchParams}`)
    const getResponse = await GET(mockRequest)
    const getResult = await getResponse.json()

    if (!getResult.success) {
      return NextResponse.json(getResult)
    }

    let results = getResult.data

    // Apply sorting
    if (sortBy !== 'relevance') {
      results.sort((a: any, b: any) => {
        const aValue = a[sortBy]
        const bValue = b[sortBy]
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    }

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedResults = results.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedResults,
      meta: {
        ...getResult.meta,
        page,
        limit,
        totalPages: Math.ceil(results.length / limit),
        hasNext: endIndex < results.length,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Advanced search API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to perform advanced search',
        data: [],
        meta: { total: 0 }
      },
      { status: 500 }
    )
  }
}
