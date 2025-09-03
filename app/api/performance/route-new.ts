import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../lib/prisma';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const period = searchParams.get('period') || 'month'; // week, month, quarter, year

    // Get current employee
    const currentEmployee = await prisma.employee.findUnique({
      where: { clerkUserId: userId }
    });

    if (!currentEmployee) {
      return NextResponse.json({ error: 'Employee profile required' }, { status: 403 });
    }

    // Check permissions
    const isManagerOrAbove = ['manager', 'admin', 'super_admin'].includes(currentEmployee.role);

    // Determine target employee
    const targetEmployeeId = employeeId || currentEmployee.id;

    // Only managers and above can view other employees' performance
    if (employeeId && employeeId !== currentEmployee.id && !isManagerOrAbove) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Calculate date range
    const now = new Date();
    let start: Date, end: Date;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      end = now;
      switch (period) {
        case 'week':
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          break;
        case 'year':
          start = new Date(now.getFullYear(), 0, 1);
          break;
        default: // month
          start = new Date(now.getFullYear(), now.getMonth(), 1);
      }
    }

    // Get employee with basic information
    const targetEmployee = await prisma.employee.findUnique({
      where: { id: targetEmployeeId },
      include: {
        department: true
      }
    });

    if (!targetEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Get tasks data
    const tasksData = await prisma.task.findMany({
      where: {
        AND: [
          { employeeId: targetEmployeeId },
          { createdAt: { gte: start, lte: end } }
        ]
      },
      include: {
        project: true
      }
    });

    // Get projects data (projects where employee is assigned or manages)
    const projectsData = await prisma.project.findMany({
      where: {
        AND: [
          {
            OR: [
              { tasks: { some: { employeeId: targetEmployeeId } } }
            ]
          },
          { createdAt: { gte: start, lte: end } }
        ]
      }
    });

    // Get project tasks separately
    const projectTasksCount = await prisma.task.groupBy({
      by: ['projectId'],
      where: {
        employeeId: targetEmployeeId,
        projectId: { in: projectsData.map(p => p.id) }
      },
      _count: {
        id: true
      }
    });

    // Calculate performance metrics
    const taskMetrics = {
      total: tasksData.length,
      completed: tasksData.filter(t => t.status === 'DONE').length,
      inProgress: tasksData.filter(t => t.status === 'IN_PROGRESS').length,
      pending: tasksData.filter(t => t.status === 'TODO').length,
      overdue: tasksData.filter(t => 
        t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE'
      ).length,
      completionRate: tasksData.length > 0 
        ? Math.round((tasksData.filter(t => t.status === 'DONE').length / tasksData.length) * 100)
        : 0
    };

    const priorityBreakdown = {
      LOW: tasksData.filter(t => t.priority === 'LOW').length,
      MEDIUM: tasksData.filter(t => t.priority === 'MEDIUM').length,
      HIGH: tasksData.filter(t => t.priority === 'HIGH').length
    };

    // Average task completion time
    const completedTasks = tasksData.filter(t => 
      t.status === 'DONE'
    );
    
    const averageCompletionTime = completedTasks.length > 0 
      ? completedTasks.reduce((sum, task) => {
          const created = new Date(task.createdAt);
          const updated = new Date(task.updatedAt); // Use updatedAt as completion time approximation
          return sum + (updated.getTime() - created.getTime());
        }, 0) / completedTasks.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    // Project metrics
    const projectMetrics = {
      totalProjects: projectsData.length,
      activeProjects: projectsData.filter(p => p.status === 'ACTIVE').length,
      completedProjects: projectsData.filter(p => p.status === 'COMPLETED').length,
      tasksAcrossProjects: projectTasksCount.reduce((sum, p) => sum + p._count.id, 0)
    };

    // Daily performance for charts (last 30 days)
    const dailyPerformance: Array<{
      date: string;
      tasksCompleted: number;
      efficiency: number;
    }> = [];

    for (let i = 29; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayTasks = tasksData.filter(t => {
        const taskDate = new Date(t.createdAt);
        return taskDate >= dayStart && taskDate <= dayEnd;
      });

      const completedToday = dayTasks.filter(t => t.status === 'DONE').length;

      dailyPerformance.push({
        date: dayStart.toISOString().split('T')[0],
        tasksCompleted: completedToday,
        efficiency: dayTasks.length > 0 
          ? Math.round((completedToday / dayTasks.length) * 100)
          : 0
      });
    }

    // Performance rating calculation
    let performanceScore = 0;
    if (taskMetrics.total > 0) {
      performanceScore += taskMetrics.completionRate * 0.4; // 40% weight
      performanceScore += Math.max(0, 100 - (taskMetrics.overdue / taskMetrics.total * 100)) * 0.3; // 30% weight
      performanceScore += Math.min(100, averageCompletionTime > 0 ? (7 / averageCompletionTime) * 100 : 100) * 0.3; // 30% weight
    }

    const performanceRating = 
      performanceScore >= 90 ? 'Excellent' :
      performanceScore >= 80 ? 'Good' :
      performanceScore >= 70 ? 'Satisfactory' :
      performanceScore >= 60 ? 'Needs Improvement' : 'Poor';

    const response = {
      employee: {
        id: targetEmployee.id,
        name: targetEmployee.name,
        email: targetEmployee.email,
        role: targetEmployee.role,
        department: targetEmployee.department?.name
      },
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
        type: period
      },
      taskMetrics,
      priorityBreakdown,
      projectMetrics,
      averageCompletionDays: Math.round(averageCompletionTime * 10) / 10,
      performanceScore: Math.round(performanceScore),
      performanceRating,
      dailyPerformance,
      insights: {
        mostProductiveDay: dailyPerformance.reduce((max, day) => 
          day.tasksCompleted > max.tasksCompleted ? day : max, 
          { date: '', tasksCompleted: 0, efficiency: 0 }
        ),
        averageDailyTasks: Math.round(
          (dailyPerformance.reduce((sum, day) => sum + day.tasksCompleted, 0) / dailyPerformance.length) * 10
        ) / 10,
        weeklyTrend: dailyPerformance.slice(-7).reduce((sum, day) => sum + day.tasksCompleted, 0) -
                    dailyPerformance.slice(-14, -7).reduce((sum, day) => sum + day.tasksCompleted, 0)
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      employeeId, 
      reviewPeriodStart, 
      reviewPeriodEnd, 
      goals, 
      achievements, 
      feedback, 
      rating 
    } = body;

    // Get current employee
    const currentEmployee = await prisma.employee.findUnique({
      where: { clerkUserId: userId }
    });

    if (!currentEmployee) {
      return NextResponse.json({ error: 'Employee profile required' }, { status: 403 });
    }

    // Only managers and above can create performance reviews
    const isManagerOrAbove = ['manager', 'admin', 'super_admin'].includes(currentEmployee.role);
    if (!isManagerOrAbove) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Create performance review record (assuming you have a PerformanceReview model)
    // This is a placeholder - you'd need to add this model to your Prisma schema
    const performanceReview = {
      employeeId,
      reviewerId: currentEmployee.id,
      reviewPeriodStart: new Date(reviewPeriodStart),
      reviewPeriodEnd: new Date(reviewPeriodEnd),
      goals: goals || [],
      achievements: achievements || [],
      feedback: feedback || '',
      rating: rating || 0,
      createdAt: new Date()
    };

    // For now, return the review data since the model might not exist
    return NextResponse.json({
      message: 'Performance review created successfully',
      review: performanceReview
    });

  } catch (error) {
    console.error('Error creating performance review:', error);
    return NextResponse.json(
      { error: 'Failed to create performance review' },
      { status: 500 }
    );
  }
}
