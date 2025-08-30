'use client';

import { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { 
  PlusIcon, 
  EllipsisVerticalIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import TaskCard from '../kanban/TaskCard';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  deadline?: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
  };
  subtasks: SubTask[];
  _count: {
    subtasks: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface SubTask {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  taskId: string;
  createdAt: string;
  updatedAt: string;
}

interface EnhancedKanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
  onAddTask?: () => void;
  onTaskClick?: (task: Task) => void;
  maxTasks?: number;
  showStats?: boolean;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'TODO':
      return <ExclamationTriangleIcon className="w-4 h-4 text-gray-500" />;
    case 'IN_PROGRESS':
      return <ClockIcon className="w-4 h-4 text-blue-500" />;
    case 'DONE':
      return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
    default:
      return null;
  }
};

const getPriorityCount = (tasks: Task[], priority: string) => {
  return tasks.filter(task => task.priority === priority).length;
};

const getOverdueCount = (tasks: Task[]) => {
  const now = new Date();
  return tasks.filter(task => {
    if (!task.deadline || task.status === 'DONE') return false;
    return new Date(task.deadline) < now;
  }).length;
};

export default function EnhancedKanbanColumn({
  id,
  title,
  tasks,
  color,
  onAddTask,
  onTaskClick,
  maxTasks,
  showStats = true
}: EnhancedKanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  const stats = useMemo(() => {
    if (!showStats) return null;

    return {
      total: tasks.length,
      highPriority: getPriorityCount(tasks, 'HIGH'),
      mediumPriority: getPriorityCount(tasks, 'MEDIUM'),
      lowPriority: getPriorityCount(tasks, 'LOW'),
      overdue: getOverdueCount(tasks),
      withDeadlines: tasks.filter(task => task.deadline).length,
      assigned: tasks.filter(task => task.assignedTo).length,
      unassigned: tasks.filter(task => !task.assignedTo).length
    };
  }, [tasks, showStats]);

  const isAtLimit = maxTasks ? tasks.length >= maxTasks : false;

  return (
    <div className="flex flex-col h-full">
      <Card className={`flex-1 ${color} border-t-4`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              {getStatusIcon(id)}
              {title}
              <Badge variant="secondary" className="ml-1">
                {tasks.length}
              </Badge>
              {maxTasks && (
                <Badge 
                  variant={isAtLimit ? "destructive" : "outline"} 
                  className="text-xs"
                >
                  {tasks.length}/{maxTasks}
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center gap-1">
              {onAddTask && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAddTask}
                  disabled={isAtLimit}
                  className="h-8 w-8 p-0"
                  title={isAtLimit ? 'Column is at maximum capacity' : 'Add new task'}
                >
                  <PlusIcon className="w-4 h-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <EllipsisVerticalIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Column Stats */}
          {showStats && stats && tasks.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-200">
              {/* Priority Distribution */}
              {(stats.highPriority > 0 || stats.mediumPriority > 0 || stats.lowPriority > 0) && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600">Priority:</span>
                  {stats.highPriority > 0 && (
                    <Badge variant="destructive" className="text-xs px-1">
                      H: {stats.highPriority}
                    </Badge>
                  )}
                  {stats.mediumPriority > 0 && (
                    <Badge variant="outline" className="text-xs px-1 border-yellow-400 text-yellow-700">
                      M: {stats.mediumPriority}
                    </Badge>
                  )}
                  {stats.lowPriority > 0 && (
                    <Badge variant="secondary" className="text-xs px-1">
                      L: {stats.lowPriority}
                    </Badge>
                  )}
                </div>
              )}

              {/* Quick Info */}
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-3">
                  {stats.overdue > 0 && (
                    <span className="text-red-600 font-medium">
                      {stats.overdue} overdue
                    </span>
                  )}
                  {stats.withDeadlines > 0 && (
                    <span>
                      {stats.withDeadlines} with deadlines
                    </span>
                  )}
                </div>
                
                {(stats.assigned > 0 || stats.unassigned > 0) && (
                  <div className="flex items-center gap-2">
                    {stats.assigned > 0 && (
                      <span className="text-blue-600">{stats.assigned} assigned</span>
                    )}
                    {stats.unassigned > 0 && (
                      <span className="text-gray-500">{stats.unassigned} unassigned</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 pt-0">
          <div
            ref={setNodeRef}
            className={`
              min-h-[500px] space-y-2 pb-4
              ${isAtLimit ? 'opacity-75' : ''}
            `}
          >
            <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick?.(task)}
                  getPriorityColor={(priority: string) => {
                    switch (priority) {
                      case 'HIGH': return 'border-red-500 bg-red-50';
                      case 'MEDIUM': return 'border-yellow-500 bg-yellow-50';
                      case 'LOW': return 'border-green-500 bg-green-50';
                      default: return 'border-gray-300 bg-white';
                    }
                  }}
                  getCompletedSubtasks={(subtasks: SubTask[]) => 
                    subtasks.filter(st => st.status === 'DONE').length
                  }
                />
              ))}
            </SortableContext>

            {/* Empty State */}
            {tasks.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                <div className="text-center">
                  <p className="text-sm font-medium">No tasks in {title.toLowerCase()}</p>
                  {onAddTask && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onAddTask}
                      className="mt-2 text-xs"
                    >
                      <PlusIcon className="w-3 h-3 mr-1" />
                      Add First Task
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Capacity Warning */}
            {isAtLimit && (
              <div className="text-center p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  Column at maximum capacity ({maxTasks} tasks)
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
