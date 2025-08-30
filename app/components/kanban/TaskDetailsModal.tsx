'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Checkbox } from '../ui/checkbox';
import { 
  Plus, 
  Calendar, 
  User, 
  CheckSquare, 
  Edit, 
  Trash2, 
  Save,
  X
} from 'lucide-react';
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

interface TaskDetailsModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const createSubTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

type CreateSubTaskForm = z.infer<typeof createSubTaskSchema>;

export default function TaskDetailsModal({
  task,
  isOpen,
  onClose,
  onUpdate,
}: TaskDetailsModalProps) {
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSubTaskForm>({
    resolver: zodResolver(createSubTaskSchema),
  });

  // Create subtask mutation
  const createSubtaskMutation = useMutation({
    mutationFn: async (data: CreateSubTaskForm) => {
      const response = await fetch('/api/subtasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, taskId: task.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subtask');
      }

      return response.json();
    },
    onSuccess: () => {
      reset();
      setIsAddingSubtask(false);
      onUpdate();
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Update subtask status mutation
  const updateSubtaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch('/api/subtasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subtask');
      }

      return response.json();
    },
    onSuccess: () => {
      onUpdate();
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Delete subtask mutation
  const deleteSubtaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/subtasks?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete subtask');
      }

      return response.json();
    },
    onSuccess: () => {
      onUpdate();
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleSubtaskStatusChange = (subtask: SubTask, checked: boolean) => {
    const newStatus = checked ? 'DONE' : 'TODO';
    updateSubtaskMutation.mutate({ id: subtask.id, status: newStatus });
  };

  const handleCreateSubtask = (data: CreateSubTaskForm) => {
    createSubtaskMutation.mutate(data);
  };

  const handleDeleteSubtask = (id: string) => {
    if (confirm('Are you sure you want to delete this subtask?')) {
      deleteSubtaskMutation.mutate(id);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'TODO': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const completedSubtasks = task.subtasks.filter(st => st.status === 'DONE').length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-6">
            <span className="flex-1 pr-4">{task.title}</span>
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Info */}
          <div className="space-y-4">
            {task.description && (
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Badge className={`mt-1 ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </Badge>
              </div>

              {task.deadline && (
                <div>
                  <Label className="text-sm font-medium">Deadline</Label>
                  <div className="flex items-center gap-1 mt-1 text-sm">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(task.deadline), 'PPP')}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {task.assignedTo && (
                <div>
                  <Label className="text-sm font-medium">Assigned To</Label>
                  <div className="flex items-center gap-1 mt-1 text-sm">
                    <User className="h-4 w-4" />
                    {task.assignedTo.name}
                  </div>
                </div>
              )}

              {task.project && (
                <div>
                  <Label className="text-sm font-medium">Project</Label>
                  <Badge variant="outline" className="mt-1">
                    {task.project.name}
                  </Badge>
                </div>
              )}
            </div>

            {task.sprint && (
              <div>
                <Label className="text-sm font-medium">Sprint</Label>
                <Badge variant="outline" className="mt-1">
                  {task.sprint.name}
                </Badge>
              </div>
            )}
          </div>

          {/* Subtasks Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                <Label className="text-sm font-medium">
                  Subtasks ({completedSubtasks}/{task.subtasks.length})
                </Label>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAddingSubtask(true)}
                disabled={isAddingSubtask}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Subtask
              </Button>
            </div>

            {/* Progress bar */}
            {task.subtasks.length > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${(completedSubtasks / task.subtasks.length) * 100}%`,
                  }}
                />
              </div>
            )}

            {/* Add subtask form */}
            {isAddingSubtask && (
              <form onSubmit={handleSubmit(handleCreateSubtask)} className="space-y-3 p-3 border rounded-lg bg-gray-50">
                <div>
                  <Input
                    placeholder="Subtask title"
                    {...register('title')}
                    className="text-sm"
                  />
                  {errors.title && (
                    <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>
                  )}
                </div>
                <div>
                  <Textarea
                    placeholder="Subtask description (optional)"
                    {...register('description')}
                    className="text-sm"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={createSubtaskMutation.isPending}
                  >
                    {createSubtaskMutation.isPending ? (
                      'Creating...'
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsAddingSubtask(false);
                      reset();
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* Subtasks list */}
            <div className="space-y-2">
              {task.subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <Checkbox
                    checked={subtask.status === 'DONE'}
                    onCheckedChange={(checked) =>
                      handleSubtaskStatusChange(subtask, checked as boolean)
                    }
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${subtask.status === 'DONE' ? 'line-through text-gray-500' : ''}`}>
                      {subtask.title}
                    </p>
                    {subtask.description && (
                      <p className="text-xs text-gray-600 mt-1">
                        {subtask.description}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteSubtask(subtask.id)}
                    className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            {task.subtasks.length === 0 && !isAddingSubtask && (
              <p className="text-sm text-gray-500 text-center py-4">
                No subtasks yet. Click "Add Subtask" to create one.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
