'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import SprintForm from '../../components/forms/SprintForm';
import { 
  Plus, 
  Calendar, 
  Play, 
  Pause, 
  CheckCircle,
  Clock,
  Target,
  Users,
  BarChart3
} from 'lucide-react';

interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    assignedTo?: { name: string };
  }>;
}

interface SprintStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  completionPercentage: number;
}

export default function SprintsPage() {
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch sprints
  const { data: sprints = [], isLoading } = useQuery({
    queryKey: ['sprints'],
    queryFn: async () => {
      const response = await fetch('/api/sprints');
      if (!response.ok) throw new Error('Failed to fetch sprints');
      return response.json();
    }
  });

  // Calculate sprint statistics
  const calculateSprintStats = (sprint: Sprint): SprintStats => {
    const totalTasks = sprint.tasks?.length || 0;
    const completedTasks = sprint.tasks?.filter(task => task.status === 'DONE')?.length || 0;
    const inProgressTasks = sprint.tasks?.filter(task => task.status === 'IN_PROGRESS')?.length || 0;
    const todoTasks = sprint.tasks?.filter(task => task.status === 'TODO')?.length || 0;
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };

  // Get sprint status based on dates
  const getSprintStatus = (sprint: Sprint) => {
    const now = new Date();
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);
    
    if (now < start) return 'upcoming';
    if (now > end) return 'completed';
    return 'active';
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Delete sprint mutation
  const deleteMutation = useMutation({
    mutationFn: async (sprintId: string) => {
      const response = await fetch(`/api/sprints?id=${sprintId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete sprint');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      toast({
        title: "Success",
        description: "Sprint deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete sprint",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sprint Management</h1>
          <p className="text-gray-600">Manage and track your development sprints</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
            <SprintForm
              onSuccess={() => {
                setIsCreateDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ['sprints'] });
                toast({
                  title: "Success",
                  description: "Sprint created successfully",
                });
              }}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Sprint Statistics */}
      {sprints.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sprints</p>
                  <p className="text-2xl font-bold">{sprints.length}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Sprints</p>
                  <p className="text-2xl font-bold text-green-600">
                    {sprints.filter(s => getSprintStatus(s) === 'active').length}
                  </p>
                </div>
                <Play className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {sprints.filter(s => getSprintStatus(s) === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold">
                    {sprints.reduce((acc, sprint) => acc + (sprint.tasks?.length || 0), 0)}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sprints Grid */}
      {sprints.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sprints Found</h3>
            <p className="text-gray-600 mb-4">Create your first sprint to start managing your development cycles.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Sprint
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sprints.map((sprint: Sprint) => {
            const stats = calculateSprintStats(sprint);
            const status = getSprintStatus(sprint);
            
            return (
              <Card key={sprint.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg mb-1">{sprint.name}</CardTitle>
                      <Badge 
                        variant={
                          status === 'active' ? 'default' : 
                          status === 'completed' ? 'secondary' : 
                          'outline'
                        }
                        className="text-xs"
                      >
                        {status === 'active' ? 'Active' : 
                         status === 'completed' ? 'Completed' : 
                         'Upcoming'}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-1">
                      <Dialog open={isEditDialogOpen && selectedSprint?.id === sprint.id} 
                              onOpenChange={(open) => {
                                setIsEditDialogOpen(open);
                                if (!open) setSelectedSprint(null);
                              }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedSprint(sprint)}
                          >
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Edit Sprint</DialogTitle>
                          </DialogHeader>
                          {selectedSprint && (
                            <SprintForm
                              sprint={selectedSprint}
                              onSuccess={() => {
                                setIsEditDialogOpen(false);
                                setSelectedSprint(null);
                                queryClient.invalidateQueries({ queryKey: ['sprints'] });
                                toast({
                                  title: "Success",
                                  description: "Sprint updated successfully",
                                });
                              }}
                              onCancel={() => {
                                setIsEditDialogOpen(false);
                                setSelectedSprint(null);
                              }}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteMutation.mutate(sprint.id)}
                        disabled={deleteMutation.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Duration */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}</span>
                  </div>
                  
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-gray-600">{stats.completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${stats.completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Task Statistics */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-lg font-semibold text-green-600">{stats.completedTasks}</p>
                      <p className="text-xs text-gray-600">Done</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-blue-600">{stats.inProgressTasks}</p>
                      <p className="text-xs text-gray-600">In Progress</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-600">{stats.todoTasks}</p>
                      <p className="text-xs text-gray-600">To Do</p>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => window.open(`/dashboard/tasks?sprintId=${sprint.id}`, '_blank')}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      View Tasks
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => window.open(`/dashboard/calendar?sprintId=${sprint.id}`, '_blank')}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Calendar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
