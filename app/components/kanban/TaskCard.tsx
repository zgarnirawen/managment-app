'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar, User, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';

interface Task {
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
  subtasks: SubTask[];
  _count: {
    subtasks: number;
  };
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

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  getPriorityColor: (priority: string) => string;
  getCompletedSubtasks: (subtasks: SubTask[]) => number;
  isDragging?: boolean;
}

export default function TaskCard({ 
  task, 
  onClick, 
  getPriorityColor, 
  getCompletedSubtasks,
  isDragging = false 
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: sortableIsDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: sortableIsDragging ? 0.5 : 1,
  };

  const completedSubtasks = getCompletedSubtasks(task.subtasks);
  const totalSubtasks = task.subtasks.length;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-pointer hover:shadow-md transition-shadow ${
        isDragging ? 'rotate-3 shadow-lg' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header with priority and title */}
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-sm line-clamp-2 flex-1 pr-2">
            {task.title}
          </h3>
          <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </Badge>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-gray-600 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Project and Sprint */}
        {(task.project || task.sprint) && (
          <div className="flex flex-wrap gap-1">
            {task.project && (
              <Badge variant="outline" className="text-xs">
                {task.project.name}
              </Badge>
            )}
            {task.sprint && (
              <Badge variant="outline" className="text-xs">
                Sprint: {task.sprint.name}
              </Badge>
            )}
          </div>
        )}

        {/* Deadline */}
        {task.deadline && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(task.deadline), 'MMM dd')}</span>
          </div>
        )}

        {/* Assigned user */}
        {task.assignedTo && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <User className="h-3 w-3" />
            <span className="truncate">{task.assignedTo.name}</span>
          </div>
        )}

        {/* Subtasks progress */}
        {totalSubtasks > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <CheckSquare className="h-3 w-3" />
            <span>
              {completedSubtasks}/{totalSubtasks} subtasks
            </span>
            <div className="flex-1 bg-gray-200 rounded-full h-1.5 ml-2">
              <div
                className="bg-green-500 h-1.5 rounded-full transition-all"
                style={{
                  width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
