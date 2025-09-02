import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@clerk/nextjs/server'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const type = url.searchParams.get('type') || 'overview'
    const period = url.searchParams.get('period') || '30'
    const departmentId = url.searchParams.get('departmentId')

    // Get user role
    const user = await prisma.employee.findUnique({
      where: { clerkUserId: userId },
      select: { role: true, id: true, departmentId: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - parseInt(period))

    let analyticsData: any = {}

    switch (type) {
      case 'overview':
        analyticsData = await getOverviewAnalytics(startDate, endDate, user.role, departmentId)
        break
      case 'sprints':
        analyticsData = await getSprintAnalytics(startDate, endDate, user.role, departmentId)
        break
      case 'tasks':
        analyticsData = await getTaskAnalytics(startDate, endDate, user.role, departmentId)
        break
      case 'employees':
        analyticsData = await getEmployeeAnalytics(startDate, endDate, user.role, departmentId)
        break
      default:
        analyticsData = await getOverviewAnalytics(startDate, endDate, user.role, departmentId)
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getOverviewAnalytics(startDate: Date, endDate: Date, userRole: string, departmentId?: string | null) {
  try {
    // Get sprints data
    const sprints = await prisma.sprint.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      },
      include: {
        tasks: {
          include: {
            assignedTo: true
          }
        }
      }
    })

    // Sprint velocity calculation
    const sprintVelocity = sprints.map(sprint => {
      const tasks = sprint.tasks || []
      const completedTasks = tasks.filter(task => task.status === 'DONE')
      const totalTasks = tasks.length
      const velocity = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0
      
      return {
        id: sprint.id,
        name: sprint.name,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        velocity: Math.round(velocity),
        tasksCompleted: completedTasks.length,
        totalTasks: totalTasks
      }
    })

    // Get tasks data
    const tasks = await prisma.task.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        ...(departmentId && { 
          assignedTo: { 
            departmentId: departmentId 
          }
        })
      },
      include: {
        assignedTo: true,
        sprint: true
      }
    })

    // Task analytics
    const taskAnalytics = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'DONE').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      pending: tasks.filter(t => t.status === 'TODO').length,
      blocked: tasks.filter(t => t.status === 'BLOCKED').length
    }

    const completionRate = taskAnalytics.total > 0 ? (taskAnalytics.completed / taskAnalytics.total) * 100 : 0

    // Priority breakdown
    const priorityBreakdown = {
      HIGH: tasks.filter(t => t.priority === 'HIGH').length,
      MEDIUM: tasks.filter(t => t.priority === 'MEDIUM').length,
      LOW: tasks.filter(t => t.priority === 'LOW').length
    }

    // Get employees data
    const employees = await prisma.employee.findMany({
      where: {
        role: { in: ['Employee', 'Manager', 'Intern'] },
        ...(departmentId && { departmentId: departmentId })
      },
      include: {
        tasks: {
          where: {
            createdAt: { gte: startDate, lte: endDate }
          }
        }
      }
    })

    // Employee productivity
    const employeeProductivity = employees.map(emp => {
      const empTasks = emp.tasks || []
      const completedTasks = empTasks.filter(t => t.status === 'DONE')
      const productivity = empTasks.length > 0 ? 
        (completedTasks.length / empTasks.length) * 100 : 0
      
      return {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        tasksAssigned: empTasks.length,
        tasksCompleted: completedTasks.length,
        productivity: Math.round(productivity)
      }
    })

    // Calculate averages
    const averageVelocity = sprintVelocity.length > 0 ? 
      Math.round(sprintVelocity.reduce((sum, s) => sum + s.velocity, 0) / sprintVelocity.length) : 0

    const averageProductivity = employeeProductivity.length > 0 ?
      Math.round(employeeProductivity.reduce((sum, e) => sum + e.productivity, 0) / employeeProductivity.length) : 0

    return {
      sprints: sprintVelocity,
      tasks: taskAnalytics,
      completionRate: Math.round(completionRate),
      priorityBreakdown,
      employees: employeeProductivity,
      averageVelocity,
      averageCompletionRate: Math.round(completionRate),
      averageProductivity,
      totalSprints: sprints.length,
      period: { startDate, endDate }
    }
  } catch (error) {
    console.error('Overview analytics error:', error)
    return {
      sprints: [],
      tasks: { total: 0, completed: 0, inProgress: 0, pending: 0, blocked: 0 },
      completionRate: 0,
      priorityBreakdown: { HIGH: 0, MEDIUM: 0, LOW: 0 },
      employees: [],
      averageVelocity: 0,
      averageCompletionRate: 0,
      averageProductivity: 0,
      totalSprints: 0,
      period: { startDate, endDate }
    }
  }
}

async function getSprintAnalytics(startDate: Date, endDate: Date, userRole: string, departmentId?: string | null) {
  try {
    const sprints = await prisma.sprint.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      },
      include: {
        tasks: {
          include: {
            assignedTo: true
          }
        }
      }
    })

    const sprintDetails = sprints.map(sprint => {
      const tasks = sprint.tasks || []
      const completedTasks = tasks.filter(t => t.status === 'DONE')
      const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS')
      const todoTasks = tasks.filter(t => t.status === 'TODO')
      const blockedTasks = tasks.filter(t => t.status === 'BLOCKED')
      
      const velocity = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0

      return {
        id: sprint.id,
        name: sprint.name,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        tasks: {
          total: tasks.length,
          completed: completedTasks.length,
          inProgress: inProgressTasks.length,
          todo: todoTasks.length,
          blocked: blockedTasks.length
        },
        velocity: Math.round(velocity),
        completionRate: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0
      }
    })

    return {
      sprints: sprintDetails,
      summary: {
        totalSprints: sprints.length,
        averageVelocity: sprintDetails.length > 0 ? 
          Math.round(sprintDetails.reduce((sum, s) => sum + s.velocity, 0) / sprintDetails.length) : 0
      }
    }
  } catch (error) {
    console.error('Sprint analytics error:', error)
    return {
      sprints: [],
      summary: { totalSprints: 0, averageVelocity: 0 }
    }
  }
}

async function getTaskAnalytics(startDate: Date, endDate: Date, userRole: string, departmentId?: string | null) {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        ...(departmentId && { 
          assignedTo: { 
            departmentId: departmentId 
          }
        })
      },
      include: {
        assignedTo: true,
        sprint: true
      }
    })

    const tasksByStatus = {
      TODO: tasks.filter(t => t.status === 'TODO'),
      IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
      DONE: tasks.filter(t => t.status === 'DONE'),
      BLOCKED: tasks.filter(t => t.status === 'BLOCKED')
    }

    const tasksByPriority = {
      HIGH: tasks.filter(t => t.priority === 'HIGH'),
      MEDIUM: tasks.filter(t => t.priority === 'MEDIUM'),
      LOW: tasks.filter(t => t.priority === 'LOW')
    }

    const overdueTasks = tasks.filter(t => 
      t.dueDate && t.dueDate < new Date() && t.status !== 'DONE'
    )

    // Task completion trend (daily for last 30 days)
    const dailyCompletion: Array<{ date: string; completed: number }> = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))
      
      const completed = tasks.filter(t => 
        t.status === 'DONE' && 
        t.updatedAt >= dayStart && 
        t.updatedAt <= dayEnd
      ).length

      dailyCompletion.push({
        date: dayStart.toISOString().split('T')[0],
        completed
      })
    }

    return {
      summary: {
        total: tasks.length,
        completed: tasksByStatus.DONE.length,
        inProgress: tasksByStatus.IN_PROGRESS.length,
        todo: tasksByStatus.TODO.length,
        blocked: tasksByStatus.BLOCKED.length,
        overdue: overdueTasks.length,
        completionRate: tasks.length > 0 ? Math.round((tasksByStatus.DONE.length / tasks.length) * 100) : 0
      },
      byStatus: tasksByStatus,
      byPriority: tasksByPriority,
      overdue: overdueTasks,
      dailyCompletion
    }
  } catch (error) {
    console.error('Task analytics error:', error)
    return {
      summary: {
        total: 0, completed: 0, inProgress: 0, todo: 0, blocked: 0, overdue: 0, completionRate: 0
      },
      byStatus: { TODO: [], IN_PROGRESS: [], DONE: [], BLOCKED: [] },
      byPriority: { HIGH: [], MEDIUM: [], LOW: [] },
      overdue: [],
      dailyCompletion: []
    }
  }
}

async function getEmployeeAnalytics(startDate: Date, endDate: Date, userRole: string, departmentId?: string | null) {
  try {
    const employees = await prisma.employee.findMany({
      where: {
        role: { in: ['Employee', 'Manager', 'Intern'] },
        ...(departmentId && { departmentId: departmentId })
      },
      include: {
        tasks: {
          where: {
            createdAt: { gte: startDate, lte: endDate }
          }
        },
        timeEntries: {
          where: {
            createdAt: { gte: startDate, lte: endDate }
          }
        }
      }
    })

    const employeeMetrics = employees.map(emp => {
      const tasks = emp.tasks || []
      const completedTasks = tasks.filter(t => t.status === 'DONE')
      const timeEntries = emp.timeEntries || []
      
      const totalHours = timeEntries.reduce((sum, entry) => {
        if (entry.endTime && entry.startTime) {
          return sum + (entry.endTime.getTime() - entry.startTime.getTime()) / (1000 * 60 * 60)
        }
        return sum
      }, 0)

      const productivity = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0

      return {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        role: emp.role,
        tasks: {
          assigned: tasks.length,
          completed: completedTasks.length,
          inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
          todo: tasks.filter(t => t.status === 'TODO').length
        },
        timeTracking: {
          totalHours: Math.round(totalHours * 100) / 100,
          averageDaily: timeEntries.length > 0 ? Math.round((totalHours / Math.max(timeEntries.length, 1)) * 100) / 100 : 0,
          entries: timeEntries.length
        },
        productivity: Math.round(productivity),
        completionRate: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0
      }
    })

    return {
      employees: employeeMetrics,
      summary: {
        totalEmployees: employees.length,
        averageProductivity: employeeMetrics.length > 0 ? 
          Math.round(employeeMetrics.reduce((sum, e) => sum + e.productivity, 0) / employeeMetrics.length) : 0,
        totalHours: Math.round(employeeMetrics.reduce((sum, e) => sum + e.timeTracking.totalHours, 0) * 100) / 100,
        averageTasksPerEmployee: employeeMetrics.length > 0 ?
          Math.round(employeeMetrics.reduce((sum, e) => sum + e.tasks.assigned, 0) / employeeMetrics.length) : 0
      }
    }
  } catch (error) {
    console.error('Employee analytics error:', error)
    return {
      employees: [],
      summary: {
        totalEmployees: 0,
        averageProductivity: 0,
        totalHours: 0,
        averageTasksPerEmployee: 0
      }
    }
  }
}
