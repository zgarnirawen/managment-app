'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import TaskFilters from './TaskFilters';
import TaskStats from './TaskStats';
import TaskToolbar from './TaskToolbar';
import EnhancedKanbanColumn from './EnhancedKanbanColumn';
import TaskCard from '../kanban/TaskCard';
import { Alert, AlertDescription } from '../ui/alert';

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

interface TaskFilters {
  search?: string;
  status?: string[];
  priority?: string[];
  assignedTo?: string[];
  projectId?: string;
  sprintId?: string;
  deadline?: {
    from?: string;
    to?: string;
    overdue?: boolean;
    dueToday?: boolean;
    dueThisWeek?: boolean;
  };
  sortBy?: 'priority' | 'deadline' | 'created' | 'updated' | 'title';
  sortOrder?: 'asc' | 'desc';
}

interface EnhancedKanbanBoardProps {
  initialFilters?: Partial<TaskFilters>;
}

const COLUMN_CONFIG = [
  { 
    id: 'TODO', 
    title: 'To Do', 
    color: 'bg-gray-50 border-gray-300',
    maxTasks: 20 // Optional limit
  },
  { 
    id: 'IN_PROGRESS', 
    title: 'In Progress', 
    color: 'bg-blue-50 border-blue-300',
    maxTasks: 10 // WIP limit
  },
  { 
    id: 'DONE', 
    title: 'Done', 
    color: 'bg-green-50 border-green-300' 
  },
];

export default function EnhancedKanbanBoard({ initialFilters = {} }: EnhancedKanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [filters, setFilters] = useState<TaskFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  // Fetch tasks with filters
  const { data: allTasks = [], isLoading, error, refetch } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      let url = '/api/tasks';
      const params = new URLSearchParams();
      
      // Apply filters to API call
      if (filters.sprintId) params.append('sprintId', filters.sprintId);
      if (filters.assignedTo?.length) {
        filters.assignedTo.forEach(id => params.append('employeeId', id));
      }
      if (filters.priority?.length) {
        filters.priority.forEach(p => params.append('priority', p));
      }
      if (filters.projectId) params.append('projectId', filters.projectId);
      
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

  // Fetch supporting data
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await fetch('/api/employees');
      return response.ok ? response.json() : [];
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      return response.ok ? response.json() : [];
    },
  });

  const { data: sprints = [] } = useQuery({
    queryKey: ['sprints'],
    queryFn: async () => {
      const response = await fetch('/api/sprints');
      return response.ok ? response.json() : [];
    },
  });

  // Client-side filtering and sorting
  const filteredTasks = allTasks.filter(task => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      if (
        !task.title.toLowerCase().includes(searchTerm) &&
        !task.description?.toLowerCase().includes(searchTerm)
      ) {
        return false;
      }
    }

    // Status filter
    if (filters.status?.length && !filters.status.includes(task.status)) {
      return false;
    }

    // Priority filter
    if (filters.priority?.length && !filters.priority.includes(task.priority)) {
      return false;
    }

    // Deadline filters
    if (filters.deadline) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

      if (filters.deadline.overdue && task.deadline) {
        const deadline = new Date(task.deadline);
        if (!(deadline < today && task.status !== 'DONE')) return false;
      }

      if (filters.deadline.dueToday && task.deadline) {
        const deadline = new Date(task.deadline);
        if (deadline.toDateString() !== today.toDateString()) return false;
      }

      if (filters.deadline.dueThisWeek && task.deadline) {
        const deadline = new Date(task.deadline);
        if (!(deadline >= today && deadline <= endOfWeek)) return false;
      }
    }

    return true;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const sortBy = filters.sortBy || 'priority';
    const order = filters.sortOrder || 'desc';
    
    let aVal: any, bVal: any;
    
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        aVal = priorityOrder[a.priority];
        bVal = priorityOrder[b.priority];
        break;
      case 'deadline':
        aVal = a.deadline ? new Date(a.deadline).getTime() : 0;
        bVal = b.deadline ? new Date(b.deadline).getTime() : 0;
        break;
      case 'created':
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
        break;
      case 'updated':
        aVal = new Date(a.updatedAt).getTime();
        bVal = new Date(b.updatedAt).getTime();
        break;
      case 'title':
        aVal = a.title.toLowerCase();
        bVal = b.title.toLowerCase();
        break;
      default:
        return 0;
    }
    
    if (order === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Group tasks by status
  const tasksByStatus = COLUMN_CONFIG.reduce((acc, column) => {
    acc[column.id] = sortedTasks.filter(task => task.status === column.id);
    return acc;
  }, {} as Record<string, Task[]>);

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
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

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const task = sortedTasks.find((t: Task) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;
    const task = sortedTasks.find(t => t.id === taskId);

    if (task && task.status !== newStatus) {
      updateTaskMutation.mutate({ taskId, status: newStatus });
    }
  };

  // Utility functions for TaskCard
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'border-red-500 bg-red-50';
      case 'MEDIUM': return 'border-yellow-500 bg-yellow-50';
      case 'LOW': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const getCompletedSubtasks = (subtasks: SubTask[]) => {
    return subtasks.filter(st => st.status === 'DONE').length;
  };

  const handleBulkAction = (action: string) => {
    // Implement bulk operations
  };

  if (error) {
    return (
      <Alert className="m-4">
        <AlertDescription>
          Failed to load tasks. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Toolbar */}
      <TaskToolbar
        totalTasks={allTasks.length}
        filteredTasks={filteredTasks.length}
        onAddTask={() => {}}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onToggleStats={() => setShowStats(!showStats)}
        onRefresh={() => refetch()}
        onBulkAction={handleBulkAction}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedTasks={selectedTasks}
        showFilters={showFilters}
        showStats={showStats}
        isLoading={isLoading}
      />

      {/* Filters */}
      {showFilters && (
        <TaskFilters
          onFiltersChange={setFilters}
          employees={employees}
          projects={projects}
          sprints={sprints}
        />
      )}

      {/* Statistics */}
      {showStats && (
        <TaskStats tasks={sortedTasks} />
      )}

      {/* Kanban Board */}
      {viewMode === 'kanban' && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {COLUMN_CONFIG.map((column) => (
              <EnhancedKanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                tasks={tasksByStatus[column.id] || []}
                color={column.color}
                maxTasks={column.maxTasks}
                onAddTask={() => {}}
                onTaskClick={(task) => {}}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <TaskCard
                task={activeTask}
                onClick={() => {}}
                getPriorityColor={getPriorityColor}
                getCompletedSubtasks={getCompletedSubtasks}
                isDragging={true}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* List View Placeholder */}
      {viewMode === 'list' && (
        <div className="text-center py-12 text-gray-500">
          List view coming soon...
        </div>
      )}

      {/* Calendar View Placeholder */}
      {viewMode === 'calendar' && (
        <div className="text-center py-12 text-gray-500">
          Calendar view coming soon...
        </div>
      )}
    </div>
  );
}
