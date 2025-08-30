'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Plus, Calendar, User, CheckSquare, Clock, Flag, TrendingUp, Timer } from 'lucide-react';
import { TaskCard, TaskDetailsModal } from './index';
import { format } from 'date-fns';

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
  sprint?: {
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

interface KanbanBoardProps {
  filters?: {
    sprintId?: string;
    employeeId?: string;
    priority?: string;
  };
}

const COLUMN_CONFIG = [
  { id: 'TODO', title: 'To Do', color: 'bg-gray-100 border-gray-300' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-100 border-blue-300' },
  { id: 'DONE', title: 'Done', color: 'bg-green-100 border-green-300' },
];

export default function KanbanBoard({ filters }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  // Fetch tasks
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      let url = '/api/tasks';
      const params = new URLSearchParams();
      
      if (filters?.sprintId) params.append('sprintId', filters.sprintId);
      if (filters?.employeeId) params.append('employeeId', filters.employeeId);
      if (filters?.priority) params.append('priority', filters.priority);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      
      // Transform Date objects to strings for consistency
      return data.map((task: any) => ({
        ...task,
        createdAt: typeof task.createdAt === 'object' ? task.createdAt.toISOString() : task.createdAt,
        updatedAt: typeof task.updatedAt === 'object' ? task.updatedAt.toISOString() : task.updatedAt,
      }));
    },
  });

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t: Task) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const taskId = active.id as string;
    const newStatus = over.id as string;
    
    // Find the current task
    const task = tasks.find((t: Task) => t.id === taskId);
    
    if (task && task.status !== newStatus) {
      // Optimistic update
      queryClient.setQueryData(['tasks', filters], (oldTasks: Task[] = []) =>
        oldTasks.map((t) =>
          t.id === taskId ? { ...t, status: newStatus as Task['status'] } : t
        )
      );
      
      // Update in database
      updateTaskMutation.mutate({ taskId, status: newStatus });
    }
    
    setActiveTask(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCompletedSubtasks = (subtasks: SubTask[]) => {
    return subtasks.filter(st => st.status === 'DONE').length;
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleModalClose = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load tasks. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  // Group tasks by status
  const tasksByStatus = COLUMN_CONFIG.reduce((acc, column) => {
    acc[column.id] = tasks.filter((task: Task) => task.status === column.id);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="space-y-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMN_CONFIG.map((column) => (
            <Card key={column.id} className={`${column.color} min-h-96`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span>{column.title}</span>
                  <Badge variant="secondary">
                    {tasksByStatus[column.id]?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SortableContext
                  items={tasksByStatus[column.id]?.map(task => task.id) || []}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {tasksByStatus[column.id]?.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onClick={() => handleTaskClick(task)}
                        getPriorityColor={getPriorityColor}
                        getCompletedSubtasks={getCompletedSubtasks}
                      />
                    ))}
                  </div>
                </SortableContext>
              </CardContent>
            </Card>
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <TaskCard
              task={activeTask}
              onClick={() => {}}
              getPriorityColor={getPriorityColor}
              getCompletedSubtasks={getCompletedSubtasks}
              isDragging
            />
          )}
        </DragOverlay>
      </DndContext>

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          isOpen={isTaskModalOpen}
          onClose={handleModalClose}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
          }}
        />
      )}
    </div>
  );
}
