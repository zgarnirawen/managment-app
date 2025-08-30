'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { ArrowLeft, Users, Loader2, CheckCheck } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  } | null;
  project?: {
    id: string;
    name: string;
  } | null;
  sprintId?: string | null;
}

interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface TaskAssignmentProps {
  sprint: Sprint;
  onBack: () => void;
}

export default function TaskAssignment({ sprint, onBack }: TaskAssignmentProps) {
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch all tasks
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      return response.json();
    },
  });

  // Assign tasks mutation
  const assignMutation = useMutation({
    mutationFn: async ({ taskIds, sprintId }: { taskIds: string[], sprintId: string | null }) => {
      const response = await fetch('/api/sprints/assign-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskIds, sprintId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to assign tasks');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setAssignError(null);
      setAssignSuccess(data.message);
      setSelectedTasks(new Set());
      
      // Invalidate and refetch data
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      
      // Clear success message after delay
      setTimeout(() => setAssignSuccess(null), 3000);
    },
    onError: (error: Error) => {
      setAssignError(error.message);
      setAssignSuccess(null);
    }
  });

  const handleTaskSelection = (taskId: string, checked: boolean) => {
    const newSelected = new Set(selectedTasks);
    if (checked) {
      newSelected.add(taskId);
    } else {
      newSelected.delete(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allTaskIds = tasks.map((task: Task) => task.id);
      setSelectedTasks(new Set(allTaskIds));
    } else {
      setSelectedTasks(new Set());
    }
  };

  const handleAssignToSprint = () => {
    if (selectedTasks.size === 0) {
      setAssignError('Please select at least one task to assign');
      return;
    }

    assignMutation.mutate({
      taskIds: Array.from(selectedTasks),
      sprintId: sprint.id,
    });
  };

  const handleUnassignFromSprint = () => {
    if (selectedTasks.size === 0) {
      setAssignError('Please select at least one task to unassign');
      return;
    }

    assignMutation.mutate({
      taskIds: Array.from(selectedTasks),
      sprintId: null,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'BLOCKED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const sprintTasks = tasks.filter((task: Task) => task.sprintId === sprint.id);
  const unassignedTasks = tasks.filter((task: Task) => !task.sprintId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading tasks...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load tasks. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sprints
              </Button>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Assign Tasks to Sprint: {sprint.name}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Select tasks to assign or unassign from this sprint
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error/Success Messages */}
      {assignError && (
        <Alert variant="destructive">
          <AlertDescription>{assignError}</AlertDescription>
        </Alert>
      )}

      {assignSuccess && (
        <Alert>
          <AlertDescription>{assignSuccess}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleAssignToSprint}
          disabled={selectedTasks.size === 0 || assignMutation.isPending}
        >
          {assignMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <CheckCheck className="h-4 w-4 mr-2" />
          )}
          Assign to Sprint ({selectedTasks.size})
        </Button>
        <Button
          variant="outline"
          onClick={handleUnassignFromSprint}
          disabled={selectedTasks.size === 0 || assignMutation.isPending}
        >
          Unassign from Sprint ({selectedTasks.size})
        </Button>
      </div>

      {/* Current Sprint Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks in {sprint.name} ({sprintTasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {sprintTasks.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No tasks assigned to this sprint yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={sprintTasks.length > 0 && sprintTasks.every((task: Task) => selectedTasks.has(task.id))}
                        onCheckedChange={(checked) => {
                          const sprintTaskIds = sprintTasks.map((task: Task) => task.id);
                          const newSelected = new Set(selectedTasks);
                          
                          if (checked) {
                            sprintTaskIds.forEach(id => newSelected.add(id));
                          } else {
                            sprintTaskIds.forEach(id => newSelected.delete(id));
                          }
                          
                          setSelectedTasks(newSelected);
                        }}
                      />
                    </TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Project</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sprintTasks.map((task: Task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedTasks.has(task.id)}
                          onCheckedChange={(checked) => handleTaskSelection(task.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{task.assignedTo?.name || 'Unassigned'}</TableCell>
                      <TableCell>{task.project?.name || 'No Project'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unassigned Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Unassigned Tasks ({unassignedTasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {unassignedTasks.length === 0 ? (
            <p className="text-center py-4 text-gray-500">All tasks are assigned to sprints.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={unassignedTasks.length > 0 && unassignedTasks.every((task: Task) => selectedTasks.has(task.id))}
                        onCheckedChange={(checked) => {
                          const unassignedTaskIds = unassignedTasks.map((task: Task) => task.id);
                          const newSelected = new Set(selectedTasks);
                          
                          if (checked) {
                            unassignedTaskIds.forEach(id => newSelected.add(id));
                          } else {
                            unassignedTaskIds.forEach(id => newSelected.delete(id));
                          }
                          
                          setSelectedTasks(newSelected);
                        }}
                      />
                    </TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Project</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unassignedTasks.map((task: Task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedTasks.has(task.id)}
                          onCheckedChange={(checked) => handleTaskSelection(task.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{task.assignedTo?.name || 'Unassigned'}</TableCell>
                      <TableCell>{task.project?.name || 'No Project'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
