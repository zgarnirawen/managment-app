'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { useEmployees } from '../../hooks/useEmployees';

const meetingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  location: z.string().optional(),
  type: z.enum(['GENERAL', 'ONE_ON_ONE', 'TEAM', 'ALL_HANDS', 'TRAINING']),
  organizerId: z.string().min(1, 'Organizer is required'),
  attendeeIds: z.array(z.string()).optional(),
});

type MeetingFormData = z.infer<typeof meetingSchema>;

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date | null;
  onMeetingCreated: () => void;
}

export default function CreateMeetingModal({
  isOpen,
  onClose,
  selectedDate,
  onMeetingCreated
}: CreateMeetingModalProps) {
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const { employees, loading: employeesLoading } = useEmployees();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch
  } = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      type: 'GENERAL',
      startDate: selectedDate ? format(selectedDate, "yyyy-MM-dd'T'HH:mm") : '',
      endDate: selectedDate ? format(new Date(selectedDate.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm") : '', // +1 hour
      organizerId: '', // TODO: Get current user ID
    },
  });

  const createMeetingMutation = useMutation({
    mutationFn: async (data: MeetingFormData) => {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
          attendeeIds: selectedAttendees,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create meeting');
      }

      return response.json();
    },
    onSuccess: () => {
      reset();
      setSelectedAttendees([]);
      onMeetingCreated();
    },
  });

  const onSubmit = (data: MeetingFormData) => {
    createMeetingMutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    setSelectedAttendees([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Create New Meeting
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Meeting Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter meeting title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Enter meeting description or agenda"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="startDate">Start Date & Time *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                {...register('startDate')}
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500 mt-1">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="endDate">End Date & Time *</Label>
              <Input
                id="endDate"
                type="datetime-local"
                {...register('endDate')}
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500 mt-1">{errors.endDate.message}</p>
              )}
            </div>

            <div>
              <Label>Meeting Type</Label>
              <Select
                value={watch('type')}
                onValueChange={(value) => setValue('type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="ONE_ON_ONE">One-on-One</SelectItem>
                  <SelectItem value="TEAM">Team Meeting</SelectItem>
                  <SelectItem value="ALL_HANDS">All Hands</SelectItem>
                  <SelectItem value="TRAINING">Training</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="Meeting room, Zoom link, etc."
              />
            </div>

            <div className="col-span-2">
              <Label>Organizer *</Label>
              <Select
                value={watch('organizerId')}
                onValueChange={(value) => setValue('organizerId', value)}
              >
                <SelectTrigger className={errors.organizerId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select organizer" />
                </SelectTrigger>
                <SelectContent>
                  {employeesLoading ? (
                    <SelectItem value="" disabled>Loading employees...</SelectItem>
                  ) : (
                    employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} ({employee.position || 'Employee'})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.organizerId && (
                <p className="text-sm text-red-500 mt-1">{errors.organizerId.message}</p>
              )}
            </div>

            <div className="col-span-2">
              <Label>Attendees</Label>
              <div className="space-y-2">
                <Select
                  onValueChange={(value) => {
                    if (value && !selectedAttendees.includes(value)) {
                      setSelectedAttendees([...selectedAttendees, value]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add attendees" />
                  </SelectTrigger>
                  <SelectContent>
                    {employeesLoading ? (
                      <SelectItem value="" disabled>Loading employees...</SelectItem>
                    ) : (
                      employees
                        .filter(employee => !selectedAttendees.includes(employee.id))
                        .map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name} ({employee.position || 'Employee'})
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
                
                {selectedAttendees.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedAttendees.map((attendeeId) => {
                      const employee = employees.find(emp => emp.id === attendeeId);
                      return (
                        <div
                          key={attendeeId}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                        >
                          <span>{employee?.name || 'Unknown Employee'}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedAttendees(
                              selectedAttendees.filter(id => id !== attendeeId)
                            )}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMeetingMutation.isPending}
            >
              {createMeetingMutation.isPending ? 'Creating...' : 'Create Meeting'}
            </Button>
          </div>

          {createMeetingMutation.error && (
            <p className="text-sm text-red-500">
              {createMeetingMutation.error.message}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
