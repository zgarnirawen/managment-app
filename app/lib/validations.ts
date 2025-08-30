import { z } from 'zod';

// Employee validation schemas
export const createEmployeeSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  role: z.string()
    .min(1, 'Please select a role'),
  departmentId: z.string()
    .min(1, 'Please select a department')
    .optional()
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

// Task validation schemas
export const createTaskSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  employeeId: z.string()
    .optional(),
  projectId: z.string()
    .optional(),
  sprintId: z.string()
    .optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE'], {
    message: 'Please select a valid status'
  }).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH'], {
    message: 'Please select a valid priority'
  }).default('MEDIUM'),
  dueDate: z.string()
    .datetime()
    .optional(),
  deadline: z.string()
    .datetime()
    .optional()
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

// Sprint validation schemas
export const createSprintSchema = z.object({
  name: z.string()
    .min(3, 'Sprint name must be at least 3 characters')
    .max(100, 'Sprint name must be less than 100 characters')
    .trim(),
  startDate: z.date({
    message: 'Start date is required'
  }),
  endDate: z.date({
    message: 'End date is required'
  })
}).refine(
  (data) => data.endDate > data.startDate,
  {
    message: 'End date must be after start date',
    path: ['endDate']
  }
);

export const updateSprintSchema = createSprintSchema.partial();

export type CreateSprintInput = z.infer<typeof createSprintSchema>;
export type UpdateSprintInput = z.infer<typeof updateSprintSchema>;

// Leave request validation schemas
export const createLeaveRequestSchema = z.object({
  employeeId: z.string()
    .min(1, 'Employee is required'),
  startDate: z.date({
    message: 'Start date is required'
  }),
  endDate: z.date({
    message: 'End date is required'
  }),
  reason: z.string()
    .min(5, 'Reason must be at least 5 characters')
    .max(500, 'Reason must be less than 500 characters')
    .trim()
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate']
});

export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>;

// Time entry validation schemas
export const createTimeEntrySchema = z.object({
  employeeId: z.string()
    .min(1, 'Employee ID is required'),
  type: z.enum(['CLOCK_IN', 'CLOCK_OUT', 'BREAK_START', 'BREAK_END'], {
    message: 'Please select a valid time entry type'
  }),
  timestamp: z.date({
    message: 'Timestamp is required'
  }),
  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
});

export type CreateTimeEntryInput = z.infer<typeof createTimeEntrySchema>;

// Project validation schemas
export const createProjectSchema = z.object({
  name: z.string()
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name must be less than 100 characters')
    .trim(),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  startDate: z.date({
    message: 'Start date is required'
  }),
  endDate: z.date({
    message: 'End date is required'
  }).optional(),
  status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'ON_HOLD'], {
    message: 'Please select a valid status'
  })
}).refine((data) => {
  if (data.endDate && data.startDate) {
    return data.endDate > data.startDate;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endDate']
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

// Common validation utilities
export const apiErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  details: z.unknown().optional()
});

export type ApiError = z.infer<typeof apiErrorSchema>;

// Helper function to parse API errors
export function parseApiError(error: unknown): string {
  if (typeof error === 'string') return error;
  
  try {
    const parsed = apiErrorSchema.parse(error);
    return parsed.message || parsed.error;
  } catch {
    if (error instanceof Error) return error.message;
    return 'An unexpected error occurred';
  }
}
