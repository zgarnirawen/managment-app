'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import SprintForm from '../forms/SprintForm';
import SprintTable from '../tables/SprintTable';
import TaskAssignment from '../tasks/TaskAssignment';
import { Plus, Calendar, Users, Target } from 'lucide-react';

interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  _count?: {
    tasks: number;
  };
}

export default function SprintManagement() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [assigningSprint, setAssigningSprint] = useState<Sprint | null>(null);

  // Fetch sprints with task counts
  const { data: sprints = [], isLoading, error, refetch } = useQuery({
    queryKey: ['sprints'],
    queryFn: async () => {
      const response = await fetch('/api/sprints');
      if (!response.ok) {
        throw new Error('Failed to fetch sprints');
      }
      return response.json();
    },
  });

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    refetch();
  };

  const handleEditSuccess = () => {
    setEditingSprint(null);
    refetch();
  };

  const handleEdit = (sprint: Sprint) => {
    setEditingSprint(sprint);
  };

  const handleAssignTasks = (sprint: Sprint) => {
    setAssigningSprint(sprint);
  };

  const handleBackFromAssignment = () => {
    setAssigningSprint(null);
    refetch(); // Refresh data when coming back from assignment
  };

  // Calculate sprint statistics
  const totalSprints = sprints.length;
  const activeSprints = sprints.filter((sprint: Sprint) => {
    const now = new Date();
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    return now >= startDate && now <= endDate;
  }).length;
  const totalTasks = sprints.reduce((sum: number, sprint: Sprint) => 
    sum + (sprint._count?.tasks || 0), 0
  );

  // If showing task assignment, render that component
  if (assigningSprint) {
    return (
      <TaskAssignment
        sprint={assigningSprint}
        onBack={handleBackFromAssignment}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sprints</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSprints}</div>
            <p className="text-xs text-muted-foreground">
              All sprints created
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sprints</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSprints}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              Assigned to sprints
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Sprint Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Create and manage sprints for your team
              </p>
            </div>
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Sprint
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Sprint</DialogTitle>
                </DialogHeader>
                <SprintForm onSuccess={handleCreateSuccess} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                Failed to load sprints. Please try again.
              </AlertDescription>
            </Alert>
          )}

          <SprintTable
            sprints={sprints}
            isLoading={isLoading}
            onEdit={handleEdit}
            onAssignTasks={handleAssignTasks}
            onRefresh={refetch}
          />
        </CardContent>
      </Card>

      {/* Edit Sprint Dialog */}
      <Dialog open={!!editingSprint} onOpenChange={(open) => !open && setEditingSprint(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Sprint</DialogTitle>
          </DialogHeader>
          {editingSprint && (
            <SprintForm
              sprint={editingSprint}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
