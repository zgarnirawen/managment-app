'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { Edit, Trash2, Calendar, Users, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  task_count?: number;
  _count?: {
    tasks: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface SprintTableProps {
  sprints?: Sprint[];
  isLoading?: boolean;
  onEdit?: (sprint: Sprint) => void;
  onAssignTasks?: (sprint: Sprint) => void;
  onRefresh?: () => void;
}

export default function SprintTable({ 
  sprints: propSprints, 
  isLoading: propIsLoading = false,
  onEdit,
  onAssignTasks,
  onRefresh
}: SprintTableProps) {
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch sprints only if not provided via props
  const { data: fetchedSprints = [], isLoading: fetchIsLoading, error } = useQuery({
    queryKey: ['sprints'],
    queryFn: async () => {
      const response = await fetch('/api/sprints');
      if (!response.ok) {
        throw new Error('Failed to fetch sprints');
      }
      return response.json();
    },
    enabled: !propSprints, // Only fetch if sprints not provided via props
  });

  // Use props or fetched data
  const sprints = propSprints || fetchedSprints;
  const isLoading = propIsLoading || fetchIsLoading;

  // Delete sprint mutation
  const deleteMutation = useMutation({
    mutationFn: async (sprintId: string) => {
      const response = await fetch(`/api/sprints?id=${sprintId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete sprint');
      }

      return response.json();
    },
    onSuccess: () => {
      setDeleteError(null);
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
    },
    onError: (error: Error) => {
      setDeleteError(error.message);
    }
  });

  const handleDeleteSprint = (sprintId: string) => {
    if (confirm('Are you sure you want to delete this sprint? All assigned tasks will be unassigned.')) {
      deleteMutation.mutate(sprintId);
    }
  };

  const getSprintStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    if (now < start) {
      return { status: 'upcoming', color: 'bg-blue-100 text-blue-800' };
    } else if (now >= start && now <= end) {
      return { status: 'active', color: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'completed', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading sprints...</span>
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
              Failed to load sprints. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Sprint Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {deleteError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{deleteError}</AlertDescription>
          </Alert>
        )}

        {sprints.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No sprints created yet.</p>
            <p className="text-sm">Create your first sprint to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sprint Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sprints.map((sprint: Sprint) => {
                  const { status, color } = getSprintStatus(sprint.startDate, sprint.endDate);
                  
                  return (
                    <TableRow key={sprint.id}>
                      <TableCell className="font-medium">
                        {sprint.name}
                      </TableCell>
                      <TableCell>
                        <Badge className={color}>
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(sprint.startDate)}
                      </TableCell>
                      <TableCell>
                        {formatDate(sprint.endDate)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAssignTasks?.(sprint)}
                          className="flex items-center gap-1"
                        >
                          <Users className="h-4 w-4" />
                          {sprint._count?.tasks || sprint.task_count || 0} tasks
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit?.(sprint)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSprint(sprint.id)}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending && deleteMutation.variables === sprint.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
