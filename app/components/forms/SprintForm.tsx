'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { createSprintSchema, updateSprintSchema, CreateSprintInput, UpdateSprintInput } from '../../lib/validations';

interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SprintFormProps {
  sprint?: Sprint;
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function SprintForm({ sprint, onClose, onSuccess, onCancel }: SprintFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const isEditing = !!sprint;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<any>({
    resolver: zodResolver(isEditing ? updateSprintSchema : createSprintSchema),
    defaultValues: sprint ? {
      name: sprint.name,
      startDate: sprint.startDate.split('T')[0], // Format for date input
      endDate: sprint.endDate.split('T')[0],
    } : {
      name: '',
      startDate: '',
      endDate: '',
    }
  });

  // Mutation for creating/updating sprint
  const sprintMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = isEditing ? `/api/sprints?id=${sprint.id}` : '/api/sprints';
      const method = isEditing ? 'PUT' : 'POST';
      
      const payload = {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} sprint`);
      }

      return response.json();
    },
    onSuccess: () => {
      setSubmitError(null);
      setSubmitSuccess(`Sprint ${isEditing ? 'updated' : 'created'} successfully!`);
      
      // Invalidate and refetch sprints data
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      
      // Reset form and close modal after a short delay
      setTimeout(() => {
        setSubmitSuccess(null);
        reset();
        onSuccess?.();
        onClose?.();
      }, 1500);
    },
    onError: (error: Error) => {
      setSubmitError(error.message);
      setSubmitSuccess(null);
    }
  });

  const onSubmit = (data: any) => {
    setSubmitError(null);
    setSubmitSuccess(null);
    sprintMutation.mutate(data);
  };

  const handleCancel = () => {
    reset();
    setSubmitError(null);
    setSubmitSuccess(null);
    onCancel?.();
    onClose?.();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Sprint' : 'Create New Sprint'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Sprint Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Sprint Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter sprint name..."
              className={cn(errors.name && "border-red-500")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message?.toString()}</p>
            )}
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              {...register('startDate')}
              className={cn(errors.startDate && "border-red-500")}
            />
            {errors.startDate && (
              <p className="text-sm text-red-500">{errors.startDate.message?.toString()}</p>
            )}
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              {...register('endDate')}
              className={cn(errors.endDate && "border-red-500")}
            />
            {errors.endDate && (
              <p className="text-sm text-red-500">{errors.endDate.message?.toString()}</p>
            )}
          </div>

          {/* Error/Success Messages */}
          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {submitSuccess && (
            <Alert>
              <AlertDescription>{submitSuccess}</AlertDescription>
            </Alert>
          )}

          {/* Form Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Update Sprint' : 'Create Sprint'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
