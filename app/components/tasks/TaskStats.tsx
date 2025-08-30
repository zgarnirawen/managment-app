'use client';

import { useMemo } from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

interface Task {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  deadline?: string;
  assignedTo?: {
    id: string;
    name: string;
  };
  project?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface TaskStatsProps {
  tasks: Task[];
  className?: string;
}

export default function TaskStats({ tasks, className = '' }: TaskStatsProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

    // Basic counts
    const totalTasks = tasks.length;
    const todoTasks = tasks.filter(t => t.status === 'TODO').length;
    const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const doneTasks = tasks.filter(t => t.status === 'DONE').length;

    // Priority breakdown
    const highPriorityTasks = tasks.filter(t => t.priority === 'HIGH').length;
    const mediumPriorityTasks = tasks.filter(t => t.priority === 'MEDIUM').length;
    const lowPriorityTasks = tasks.filter(t => t.priority === 'LOW').length;

    // Deadline analysis
    const tasksWithDeadlines = tasks.filter(t => t.deadline);
    const overdueTasks = tasksWithDeadlines.filter(t => {
      const deadline = new Date(t.deadline!);
      return deadline < today && t.status !== 'DONE';
    });
    const dueTodayTasks = tasksWithDeadlines.filter(t => {
      const deadline = new Date(t.deadline!);
      return deadline.toDateString() === today.toDateString() && t.status !== 'DONE';
    });
    const dueThisWeekTasks = tasksWithDeadlines.filter(t => {
      const deadline = new Date(t.deadline!);
      return deadline >= today && deadline <= endOfWeek && t.status !== 'DONE';
    });

    // Progress calculations
    const completionRate = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;
    const activeTasksProgress = totalTasks > 0 ? ((inProgressTasks + doneTasks) / totalTasks) * 100 : 0;

    // Assignment analysis
    const assignedTasks = tasks.filter(t => t.assignedTo).length;
    const unassignedTasks = totalTasks - assignedTasks;

    // Project breakdown
    const projectCounts = tasks.reduce((acc, task) => {
      const projectName = task.project?.name || 'No Project';
      acc[projectName] = (acc[projectName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      highPriorityTasks,
      mediumPriorityTasks,
      lowPriorityTasks,
      overdueTasks: overdueTasks.length,
      dueTodayTasks: dueTodayTasks.length,
      dueThisWeekTasks: dueThisWeekTasks.length,
      completionRate,
      activeTasksProgress,
      assignedTasks,
      unassignedTasks,
      projectCounts
    };
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-gray-500">No tasks to analyze</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold">{stats.totalTasks}</p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.doneTasks}</p>
                <p className="text-xs text-gray-500">{stats.completionRate.toFixed(1)}%</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgressTasks}</p>
              </div>
              <ClockIcon className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdueTasks}</p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Priority Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-5 h-5" />
              Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Completion Rate</span>
                <span>{stats.completionRate.toFixed(1)}%</span>
              </div>
              <Progress value={stats.completionRate} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Active Tasks (In Progress + Done)</span>
                <span>{stats.activeTasksProgress.toFixed(1)}%</span>
              </div>
              <Progress value={stats.activeTasksProgress} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-500">{stats.todoTasks}</p>
                <p className="text-xs text-gray-500">To Do</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-blue-600">{stats.inProgressTasks}</p>
                <p className="text-xs text-gray-500">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-green-600">{stats.doneTasks}</p>
                <p className="text-xs text-gray-500">Done</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Priority & Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Priority & Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-red-50 rounded">
                <p className="text-lg font-semibold text-red-600">{stats.highPriorityTasks}</p>
                <p className="text-xs text-red-600">High Priority</p>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded">
                <p className="text-lg font-semibold text-yellow-600">{stats.mediumPriorityTasks}</p>
                <p className="text-xs text-yellow-600">Medium Priority</p>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <p className="text-lg font-semibold text-green-600">{stats.lowPriorityTasks}</p>
                <p className="text-xs text-green-600">Low Priority</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Due Today</span>
                <Badge variant={stats.dueTodayTasks > 0 ? "destructive" : "secondary"}>
                  {stats.dueTodayTasks}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Due This Week</span>
                <Badge variant={stats.dueThisWeekTasks > 0 ? "outline" : "secondary"}>
                  {stats.dueThisWeekTasks}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Overdue</span>
                <Badge variant={stats.overdueTasks > 0 ? "destructive" : "secondary"}>
                  {stats.overdueTasks}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignment and Project Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Assignment Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserGroupIcon className="w-5 h-5" />
              Assignment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded">
                <p className="text-xl font-semibold text-blue-600">{stats.assignedTasks}</p>
                <p className="text-sm text-blue-600">Assigned</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-xl font-semibold text-gray-600">{stats.unassignedTasks}</p>
                <p className="text-sm text-gray-600">Unassigned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Project Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {Object.entries(stats.projectCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([project, count]) => (
                  <div key={project} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 truncate">{project}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
