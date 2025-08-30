'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { AlertCircle, CheckCircle, Loader2, Calendar } from 'lucide-react';
import { createTaskSchema, updateTaskSchema, type CreateTaskInput, type UpdateTaskInput } from '../../lib/validations';

interface Task {
  id: string;
  title: string;
  description?: string;
  employeeId?: string;
  projectId?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: Date;
}

interface Employee {
  id: string;
  name: string;
  email: string;
}

interface Project {
  id: string;
  name: string;
}

interface TaskFormProps {
  task?: Task;
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'BLOCKED', label: 'Blocked' }
];

const priorityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' }
];

export default function TaskForm({ task, isOpen = true, onClose, onSuccess, onCancel }: TaskFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const isEditing = !!task;

  // Fetch employees and projects
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await fetch('/api/employees');
      if (!response.ok) throw new Error('Failed to fetch employees');
      return response.json();
    }
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    }
  });

  // Form setup with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<CreateTaskInput | UpdateTaskInput>({
    resolver: zodResolver(isEditing ? updateTaskSchema : createTaskSchema),
    defaultValues: task ? {
      title: task.title,
      description: task.description || '',
      employeeId: task.employeeId || '',
      projectId: task.projectId || '',
      status: task.status === 'PENDING' ? 'TODO' : 
              task.status === 'COMPLETED' ? 'DONE' : 
              task.status === 'BLOCKED' ? 'TODO' : 
              task.status as any,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : ''
    } : {
      title: '',
      description: '',
      employeeId: '',
      projectId: '',
      status: 'TODO' as const,
      priority: 'MEDIUM' as const
    }
  });

  // Mutation for creating/updating task
  const taskMutation = useMutation({
    mutationFn: async (data: CreateTaskInput | UpdateTaskInput) => {
      const url = isEditing ? `/api/tasks/${task.id}` : '/api/tasks';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} task`);
      }

      return response.json();
    },
    onSuccess: () => {
      setSubmitError(null);
      setSubmitSuccess(`Task ${isEditing ? 'updated' : 'created'} successfully!`);
      
      // Invalidate and refetch tasks data
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      // Reset form and close modal after a short delay
      setTimeout(() => {
        setSubmitSuccess(null);
        reset();
        onClose?.();
        onSuccess?.();
      }, 1500);
    },
    onError: (error: Error) => {
      setSubmitSuccess(null);
      setSubmitError(error.message);
    }
  });

  const onSubmit = (data: CreateTaskInput | UpdateTaskInput) => {
    setSubmitError(null);
    setSubmitSuccess(null);
    
    // Convert empty strings to undefined for optional fields
    const cleanData = {
      ...data,
      description: data.description === '' ? undefined : data.description,
      employeeId: data.employeeId === '' ? undefined : data.employeeId,
      projectId: data.projectId === '' ? undefined : data.projectId,
      dueDate: data.dueDate || undefined
    };
    
    taskMutation.mutate(cleanData);
  };

  const handleClose = () => {
    setSubmitError(null);
    setSubmitSuccess(null);
    reset();
    if (onCancel) {
      onCancel();
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Success Alert */}
          {submitSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {submitSuccess}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {submitError}
              </AlertDescription>
            </Alert>
          )}

          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter task title"
              className={errors.title ? 'border-red-500 focus:border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter task description (optional)"
              className={errors.description ? 'border-red-500 focus:border-red-500' : ''}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Employee Assignment */}
          <div className="space-y-2">
            <Label htmlFor="employeeId">
              Assign to Employee <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch('employeeId')}
              onValueChange={(value) => setValue('employeeId', value)}
            >
              <SelectTrigger className={errors.employeeId ? 'border-red-500 focus:border-red-500' : ''}>
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name} ({employee.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employeeId && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.employeeId.message}
              </p>
            )}
          </div>

          {/* Project Assignment */}
          <div className="space-y-2">
            <Label htmlFor="projectId">Project</Label>
            <Select
              value={watch('projectId')}
              onValueChange={(value) => setValue('projectId', value)}
            >
              <SelectTrigger className={errors.projectId ? 'border-red-500 focus:border-red-500' : ''}>
                <SelectValue placeholder="Select a project (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Project</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.projectId && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.projectId.message}
              </p>
            )}
          </div>

          {/* Status and Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status Field */}
            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as any)}
              >
                <SelectTrigger className={errors.status ? 'border-red-500 focus:border-red-500' : ''}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.status.message}
                </p>
              )}
            </div>

            {/* Priority Field */}
            <div className="space-y-2">
              <Label htmlFor="priority">
                Priority <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watch('priority')}
                onValueChange={(value) => setValue('priority', value as any)}
              >
                <SelectTrigger className={errors.priority ? 'border-red-500 focus:border-red-500' : ''}>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.priority.message}
                </p>
              )}
            </div>
          </div>

          {/* Due Date Field */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">
              Due Date
            </Label>
            <div className="relative">
              <Input
                id="dueDate"
                type="datetime-local"
                {...register('dueDate', {
                  valueAsDate: true
                })}
                className={errors.dueDate ? 'border-red-500 focus:border-red-500' : ''}
              />
              <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.dueDate && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.dueDate.message}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Task' : 'Create Task'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
