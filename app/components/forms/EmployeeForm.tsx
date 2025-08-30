'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { createEmployeeSchema, updateEmployeeSchema, type CreateEmployeeInput, type UpdateEmployeeInput } from '../../lib/validations';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  department?: {
    id: string;
    name: string;
  };
  role: string;
  status: string;
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
}

interface EmployeeFormProps {
  employee?: Employee;
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EmployeeForm({ employee, isOpen = true, onClose, onSuccess, onCancel }: EmployeeFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const isEditing = !!employee;

  // Fetch roles and departments
  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await fetch('/api/roles');
      if (!response.ok) throw new Error('Failed to fetch roles');
      return response.json();
    }
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await fetch('/api/departments');
      if (!response.ok) throw new Error('Failed to fetch departments');
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
  } = useForm<CreateEmployeeInput | UpdateEmployeeInput>({
    resolver: zodResolver(isEditing ? updateEmployeeSchema : createEmployeeSchema),
    defaultValues: employee ? {
      name: employee.name,
      email: employee.email,
      role: employee.role || '',
      departmentId: employee.department?.id || ''
    } : {
      name: '',
      email: '',
      role: '',
      departmentId: ''
    }
  });

  // Mutation for creating/updating employee
  const employeeMutation = useMutation({
    mutationFn: async (data: CreateEmployeeInput | UpdateEmployeeInput) => {
      const url = isEditing ? `/api/employees/${employee.id}` : '/api/employees';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} employee`);
      }

      return response.json();
    },
    onSuccess: () => {
      setSubmitError(null);
      setSubmitSuccess(`Employee ${isEditing ? 'updated' : 'created'} successfully!`);
      
      // Invalidate and refetch employees data
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      
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

  const onSubmit = (data: CreateEmployeeInput | UpdateEmployeeInput) => {
    setSubmitError(null);
    setSubmitSuccess(null);
    
    // Convert empty strings to undefined for optional fields
    const cleanData = {
      ...data,
      departmentId: data.departmentId === '' ? undefined : data.departmentId
    };
    
    employeeMutation.mutate(cleanData);
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Employee' : 'Add New Employee'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Success Alert */}
          {submitSuccess && (
            <Alert variant="success">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
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

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-nextgen-error">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter employee name"
              className={errors.name ? 'border-nextgen-error focus:border-nextgen-error' : ''}
            />
            {errors.name && (
              <p className="text-sm text-nextgen-error flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-nextgen-error">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="Enter email address"
              className={errors.email ? 'border-nextgen-error focus:border-nextgen-error' : ''}
            />
            {errors.email && (
              <p className="text-sm text-nextgen-error flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Role Field */}
          <div className="space-y-2">
            <Label htmlFor="role">
              Role <span className="text-nextgen-error">*</span>
            </Label>
            <Select
              value={watch('role')}
              onValueChange={(value) => setValue('role', value)}
            >
              <SelectTrigger className={errors.role ? 'border-nextgen-error focus:border-nextgen-error' : ''}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Employee">Employee</SelectItem>
                <SelectItem value="Intern">Intern</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-nextgen-error flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.role.message}
              </p>
            )}
          </div>

          {/* Department Field */}
          <div className="space-y-2">
            <Label htmlFor="departmentId">Department</Label>
            <Select
              value={watch('departmentId')}
              onValueChange={(value) => setValue('departmentId', value)}
            >
              <SelectTrigger className={errors.departmentId ? 'border-nextgen-error focus:border-nextgen-error' : ''}>
                <SelectValue placeholder="Select a department (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Department</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.departmentId && (
              <p className="text-sm text-nextgen-error flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.departmentId.message}
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
                isEditing ? 'Update Employee' : 'Create Employee'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
