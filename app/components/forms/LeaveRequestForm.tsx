'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { AlertCircle, CheckCircle, Loader2, Calendar } from 'lucide-react';
import { createLeaveRequestSchema, type CreateLeaveRequestInput } from '../../lib/validations';

interface LeaveRequestFormProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  onCancel?: () => void;
  employeeId?: string;
}

export default function LeaveRequestForm({ isOpen = true, onClose, onSuccess, onCancel, employeeId }: LeaveRequestFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Form setup with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm<CreateLeaveRequestInput>({
    resolver: zodResolver(createLeaveRequestSchema),
    defaultValues: {
      startDate: undefined,
      endDate: undefined,
      reason: ''
    }
  });

  // Mutation for creating leave request
  const leaveRequestMutation = useMutation({
    mutationFn: async (data: CreateLeaveRequestInput) => {
      const requestData = {
        ...data,
        employeeId: employeeId // Add employeeId from props if available
      };

      const response = await fetch('/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit leave request');
      }

      return response.json();
    },
    onSuccess: () => {
      setSubmitError(null);
      setSubmitSuccess('Leave request submitted successfully! Your manager will review it shortly.');
      
      // Invalidate and refetch leave requests data
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['employee-leave-requests'] });
      
      // Reset form and close modal after a short delay
      setTimeout(() => {
        setSubmitSuccess(null);
        reset();
        onClose?.();
        onSuccess?.();
      }, 2000);
    },
    onError: (error: Error) => {
      setSubmitSuccess(null);
      setSubmitError(error.message);
    }
  });

  const onSubmit = (data: CreateLeaveRequestInput) => {
    setSubmitError(null);
    setSubmitSuccess(null);
    
    leaveRequestMutation.mutate(data);
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

  // Helper function to calculate days between dates
  const calculateDays = () => {
    const startDate = watch('startDate');
    const endDate = watch('endDate');
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
      return diffDays;
    }
    return 0;
  };

  const totalDays = calculateDays();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Time Off</DialogTitle>
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

          {/* Start Date Field */}
          <div className="space-y-2">
            <Label htmlFor="startDate">
              Start Date <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="startDate"
                type="date"
                {...register('startDate', {
                  valueAsDate: true
                })}
                className={errors.startDate ? 'border-red-500 focus:border-red-500' : ''}
                min={new Date().toISOString().split('T')[0]} // Prevent past dates
              />
              <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.startDate && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.startDate.message}
              </p>
            )}
          </div>

          {/* End Date Field */}
          <div className="space-y-2">
            <Label htmlFor="endDate">
              End Date <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="endDate"
                type="date"
                {...register('endDate', {
                  valueAsDate: true
                })}
                className={errors.endDate ? 'border-red-500 focus:border-red-500' : ''}
                min={watch('startDate') ? new Date(watch('startDate')).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
              />
              <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.endDate && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.endDate.message}
              </p>
            )}
            {totalDays > 0 && (
              <p className="text-sm text-blue-600">
                Duration: {totalDays} day{totalDays > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Reason Field */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              {...register('reason')}
              placeholder="Please provide a reason for your leave request..."
              className={errors.reason ? 'border-red-500 focus:border-red-500' : ''}
              rows={4}
            />
            {errors.reason && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.reason.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              {watch('reason')?.length || 0}/500 characters
            </p>
          </div>

          {/* Leave Request Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Leave Request Guidelines:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Submit requests at least 2 weeks in advance when possible</li>
              <li>• Emergency requests will be reviewed as soon as possible</li>
              <li>• You will receive an email notification once your request is reviewed</li>
              <li>• Contact your manager directly for urgent situations</li>
            </ul>
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
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
