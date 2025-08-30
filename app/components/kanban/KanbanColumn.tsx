'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import TaskCard from './TaskCard';

// Import the existing Task interface from TaskCard
interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    deadline?: string;
    createdAt: string;
    updatedAt: string;
    assignedTo?: {
      id: string;
      name: string;
      email: string;
    };
    project?: {
      id: string;
      name: string;
    };
    sprint?: {
      id: string;
      name: string;
    };
    subtasks: Array<{
      id: string;
      title: string;
      description?: string;
      status: 'TODO' | 'IN_PROGRESS' | 'DONE';
      taskId: string;
      createdAt: string;
      updatedAt: string;
    }>;
    _count: {
      subtasks: number;
    };
  };
  employees: Array<{ id: string; name: string; email: string }>;
}

type Task = TaskCardProps['task'];

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
  employees: Array<{ id: string; name: string; email: string }>;
}

export default function KanbanColumn({ id, title, color, tasks, employees }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const getColumnStats = () => {
    const total = tasks.length;
    const highPriority = tasks.filter(task => task.priority === 'HIGH').length;
    const completedSubtasks = tasks.reduce((sum, task) => {
      return sum + (task.subtasks?.filter(st => st.status === 'DONE').length || 0);
    }, 0);
    const totalSubtasks = tasks.reduce((sum, task) => {
      return sum + (task.subtasks?.length || 0);
    }, 0);

    return { total, highPriority, completedSubtasks, totalSubtasks };
  };

  const stats = getColumnStats();

  return (
    <Card className={`${color} ${isOver ? 'ring-2 ring-blue-500 ring-opacity-50' : ''} transition-all duration-200`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {stats.total}
          </Badge>
        </div>
        
        {/* Column Stats */}
        {stats.total > 0 && (
          <div className="flex items-center gap-4 text-xs text-gray-600">
            {stats.highPriority > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                {stats.highPriority} priorité élevée
              </span>
            )}
            {stats.totalSubtasks > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                {stats.completedSubtasks}/{stats.totalSubtasks} sous-tâches
              </span>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent
        ref={setNodeRef}
        className="space-y-3 min-h-[400px] pb-4"
      >
        <SortableContext
          items={tasks.map(task => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => {}}
              getPriorityColor={(priority: string) => {
                switch (priority) {
                  case 'HIGH': return 'text-red-600 bg-red-50';
                  case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
                  case 'LOW': return 'text-green-600 bg-green-50';
                  default: return 'text-gray-600 bg-gray-50';
                }
              }}
              getCompletedSubtasks={(subtasks: any[]) => 
                subtasks.filter(st => st.status === 'DONE').length
              }
            />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            <div className="text-center">
              <div className="mb-2">📋</div>
              <p>Aucune tâche dans cette colonne</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
