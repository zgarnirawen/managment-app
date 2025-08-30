import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'productivity';
    const from = new Date(searchParams.get('from') || Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = new Date(searchParams.get('to') || Date.now());
    const department = searchParams.get('department') || 'all';

    // Build department filter
    const departmentFilter = department === 'all' ? {} : { departmentId: department };

    // Get summary data
    const [employees, projects, tasks, timeEntries] = await Promise.all([
      prisma.employee.count({ where: departmentFilter }),
      prisma.project.count(),
      prisma.task.count({
        where: {
          status: 'DONE',
          ...(department !== 'all' && {
            assignedTo: { departmentId: department }
          })
        }
      }),
      prisma.timeEntry.findMany({
        where: {
          ...departmentFilter,
          createdAt: { gte: from, lte: to }
        },
        select: {
          duration: true,
          startTime: true,
          endTime: true,
          type: true
        }
      })
    ]);

    // Calculate total hours from time entries
    const totalSeconds = timeEntries.reduce((sum, entry) => {
      if (entry.duration) {
        return sum + entry.duration;
      } else if (entry.startTime && entry.endTime) {
        const durationInSeconds = Math.floor((entry.endTime.getTime() - entry.startTime.getTime()) / 1000);
        return sum + durationInSeconds;
      }
      return sum;
    }, 0);

    const summary = {
      totalEmployees: employees,
      totalProjects: projects,
      completedTasks: tasks,
      totalHours: Math.floor(totalSeconds / 3600), // Convert seconds to hours
    };

    // Generate productivity data (last 30 days)
    const productivity = await generateProductivityData(from, to, departmentFilter);

    // Get department statistics
    const departmentStats = await getDepartmentStats(from, to);

    // Get project progress
    const projectProgress = await getProjectProgress();

    // Get time distribution
    const timeDistribution = await getTimeDistribution(from, to, departmentFilter);

    return NextResponse.json({
      summary,
      productivity,
      departmentStats,
      projectProgress,
      timeDistribution,
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

async function generateProductivityData(from: Date, to: Date, departmentFilter: any) {
  const days: Array<{
    date: string;
    hoursWorked: number;
    tasksCompleted: number;
    efficiency: number;
  }> = [];
  const current = new Date(from);
  
  while (current <= to) {
    const startOfDay = new Date(current);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(current);
    endOfDay.setHours(23, 59, 59, 999);

    const [timeEntries, tasksData] = await Promise.all([
      prisma.timeEntry.findMany({
        where: {
          ...departmentFilter,
          createdAt: { gte: startOfDay, lte: endOfDay }
        },
        select: {
          duration: true,
          startTime: true,
          endTime: true
        }
      }),
      prisma.task.count({
        where: {
          status: 'DONE',
          updatedAt: { gte: startOfDay, lte: endOfDay },
          ...(Object.keys(departmentFilter).length > 0 && {
            assignedTo: departmentFilter
          })
        }
      })
    ]);

    // Calculate hours for the day
    const daySeconds = timeEntries.reduce((sum, entry) => {
      if (entry.duration) {
        return sum + entry.duration;
      } else if (entry.startTime && entry.endTime) {
        const durationInSeconds = Math.floor((entry.endTime.getTime() - entry.startTime.getTime()) / 1000);
        return sum + durationInSeconds;
      }
      return sum;
    }, 0);

    const hoursWorked = Math.floor(daySeconds / 3600);
    const tasksCompleted = tasksData;
    
    days.push({
      date: current.toISOString().split('T')[0],
      hoursWorked,
      tasksCompleted,
      efficiency: tasksCompleted > 0 ? Math.round((hoursWorked / tasksCompleted) * 10) / 10 : 0,
    });

    current.setDate(current.getDate() + 1);
  }

  return days;
}

async function getDepartmentStats(from: Date, to: Date) {
  const departments = await prisma.department.findMany({
    include: {
      employees: {
        include: {
          timeEntries: {
            where: {
              createdAt: { gte: from, lte: to }
            },
            select: {
              duration: true,
              startTime: true,
              endTime: true
            }
          },
          tasks: {
            where: {
              status: 'DONE',
              updatedAt: { gte: from, lte: to }
            }
          }
        }
      }
    }
  });

  return departments.map(dept => {
    const totalSeconds = dept.employees.reduce(
      (sum, emp) => sum + emp.timeEntries.reduce((empSum, entry) => {
        if (entry.duration) {
          return empSum + entry.duration;
        } else if (entry.startTime && entry.endTime) {
          const durationInSeconds = Math.floor((entry.endTime.getTime() - entry.startTime.getTime()) / 1000);
          return empSum + durationInSeconds;
        }
        return empSum;
      }, 0),
      0
    );
    
    const totalTasks = dept.employees.reduce(
      (sum, emp) => sum + emp.tasks.length,
      0
    );

    return {
      name: dept.name,
      employees: dept.employees.length,
      hoursWorked: Math.floor(totalSeconds / 3600),
      tasksCompleted: totalTasks,
      productivity: totalTasks > 0 ? Math.round((totalSeconds / 3600) / totalTasks * 10) / 10 : 0,
    };
  });
}

async function getProjectProgress() {
  const projects = await prisma.project.findMany({
    include: {
      tasks: true,
      _count: {
        select: {
          tasks: true
        }
      }
    },
    take: 10, // Limit to top 10 projects
    orderBy: {
      createdAt: 'desc'
    }
  });

  return projects.map(project => {
    const completedTasks = project.tasks.filter(task => task.status === 'DONE').length;
    const totalTasks = project.tasks.length;
    const completion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Estimate hours spent (you might want to add actual time tracking to projects)
    const hoursSpent = Math.floor(Math.random() * 100) + 20; // Placeholder

    return {
      name: project.name,
      completion,
      tasksTotal: totalTasks,
      tasksCompleted: completedTasks,
      hoursSpent,
    };
  });
}

async function getTimeDistribution(from: Date, to: Date, departmentFilter: any) {
  const [workEntries, breakEntries] = await Promise.all([
    prisma.timeEntry.findMany({
      where: {
        ...departmentFilter,
        type: { in: ['CLOCK_IN', 'CLOCK_OUT'] },
        createdAt: { gte: from, lte: to }
      },
      select: {
        duration: true,
        startTime: true,
        endTime: true
      }
    }),
    prisma.timeEntry.findMany({
      where: {
        ...departmentFilter,
        type: { in: ['BREAK_START', 'BREAK_END'] },
        createdAt: { gte: from, lte: to }
      },
      select: {
        duration: true,
        startTime: true,
        endTime: true
      }
    })
  ]);

  const calculateHours = (entries: any[]) => {
    const totalSeconds = entries.reduce((sum, entry) => {
      if (entry.duration) {
        return sum + entry.duration;
      } else if (entry.startTime && entry.endTime) {
        const durationInSeconds = Math.floor((entry.endTime.getTime() - entry.startTime.getTime()) / 1000);
        return sum + durationInSeconds;
      }
      return sum;
    }, 0);
    return Math.floor(totalSeconds / 3600);
  };

  const workHours = calculateHours(workEntries);
  const breakHours = calculateHours(breakEntries);

  return [
    { name: 'Work', value: workHours, color: '#0088FE' },
    { name: 'Breaks', value: breakHours, color: '#00C49F' },
  ].filter(item => item.value > 0);
}
