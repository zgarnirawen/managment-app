'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Calendar,
  CheckCircle,
  Clock,
  Users,
  FileText,
  MessageSquare,
  Download,
  ExternalLink,
  AlertCircle,
  BookOpen,
  Target,
  User
} from 'lucide-react';
import { toast } from 'sonner';

// Types
interface InternProfile {
  id: string;
  employee: {
    id: string;
    name: string;
    email: string;
    department?: {
      id: string;
      name: string;
    };
  };
  mentor?: {
    id: string;
    name: string;
    email: string;
  };
  startDate: string;
  endDate?: string;
  university?: string;
  major?: string;
  yearOfStudy?: number;
  skills: string[];
  goals?: string;
}

interface InternTask {
  id: string;
  title: string;
  description?: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  deadline?: string;
  category?: string;
  tags: string[];
  feedback?: string;
  completedAt?: string;
  createdAt: string;
  assigner: {
    id: string;
    name: string;
    email: string;
  };
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  expiresAt?: string;
  createdAt: string;
  department?: {
    id: string;
    name: string;
  };
}

interface Resource {
  id: string;
  title: string;
  description?: string;
  type: 'PDF' | 'DOC' | 'LINK' | 'VIDEO' | 'IMAGE' | 'SPREADSHEET' | 'PRESENTATION' | 'ARCHIVE' | 'OTHER';
  url: string;
  thumbnailUrl?: string;
  tags: string[];
  downloadCount: number;
  createdAt: string;
  uploader: {
    id: string;
    name: string;
  };
}

// Mock data for demo purposes (replace with actual API calls)
const mockInternProfile: InternProfile = {
  id: '1',
  employee: {
    id: 'emp1',
    name: 'Alex Johnson',
    email: 'alex.johnson@company.com',
    department: {
      id: 'dept1',
      name: 'Engineering'
    }
  },
  mentor: {
    id: 'mentor1',
    name: 'Sarah Smith',
    email: 'sarah.smith@company.com'
  },
  startDate: '2025-08-01',
  endDate: '2025-11-30',
  university: 'Tech University',
  major: 'Computer Science',
  yearOfStudy: 3,
  skills: ['JavaScript', 'React', 'Node.js', 'Python'],
  goals: 'Learn full-stack development and gain experience in agile development practices.'
};

const mockTasks: InternTask[] = [
  {
    id: '1',
    title: 'Complete React Tutorial',
    description: 'Complete the official React tutorial and build a small project',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    deadline: '2025-09-01',
    category: 'Learning',
    tags: ['React', 'Frontend'],
    createdAt: '2025-08-20',
    assigner: {
      id: 'mentor1',
      name: 'Sarah Smith',
      email: 'sarah.smith@company.com'
    }
  },
  {
    id: '2',
    title: 'Set up Development Environment',
    description: 'Install and configure all necessary development tools',
    status: 'COMPLETED',
    priority: 'URGENT',
    deadline: '2025-08-25',
    category: 'Setup',
    tags: ['Environment', 'Tools'],
    completedAt: '2025-08-24',
    createdAt: '2025-08-20',
    assigner: {
      id: 'mentor1',
      name: 'Sarah Smith',
      email: 'sarah.smith@company.com'
    }
  },
  {
    id: '3',
    title: 'Review Code Guidelines',
    description: 'Read through company coding standards and best practices',
    status: 'ASSIGNED',
    priority: 'MEDIUM',
    deadline: '2025-08-30',
    category: 'Documentation',
    tags: ['Guidelines', 'Best Practices'],
    createdAt: '2025-08-27',
    assigner: {
      id: 'mentor1',
      name: 'Sarah Smith',
      email: 'sarah.smith@company.com'
    }
  }
];

const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Welcome New Interns!',
    content: 'We are excited to welcome our new intern cohort. Please join us for the orientation session tomorrow at 10 AM.',
    priority: 'HIGH',
    createdAt: '2025-08-26',
    expiresAt: '2025-08-30'
  },
  {
    id: '2',
    title: 'Lunch & Learn Session',
    content: 'Join us for a Lunch & Learn session on Modern Web Development practices this Friday at 12 PM.',
    priority: 'MEDIUM',
    createdAt: '2025-08-25',
    expiresAt: '2025-08-29'
  }
];

const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Company Handbook',
    description: 'Complete guide to company policies and procedures',
    type: 'PDF',
    url: '/resources/handbook.pdf',
    tags: ['Onboarding', 'Policies'],
    downloadCount: 45,
    createdAt: '2025-08-01',
    uploader: {
      id: 'hr1',
      name: 'HR Team'
    }
  },
  {
    id: '2',
    title: 'React Best Practices',
    description: 'Comprehensive guide to React development',
    type: 'LINK',
    url: 'https://react.dev/learn',
    tags: ['React', 'Frontend', 'Tutorial'],
    downloadCount: 23,
    createdAt: '2025-08-15',
    uploader: {
      id: 'mentor1',
      name: 'Sarah Smith'
    }
  },
  {
    id: '3',
    title: 'API Documentation',
    description: 'Complete API reference for our internal systems',
    type: 'DOC',
    url: '/resources/api-docs.docx',
    tags: ['API', 'Documentation', 'Backend'],
    downloadCount: 12,
    createdAt: '2025-08-20',
    uploader: {
      id: 'dev1',
      name: 'Dev Team'
    }
  }
];

export default function InternDashboard() {
  const queryClient = useQueryClient();

  // Queries - fetch real data from APIs
  const internProfile = mockInternProfile;
  const tasks = mockTasks;
  const announcements = mockAnnouncements;
  const resources = mockResources;

  // Task status update mutation
  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const response = await fetch(`/api/intern-tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intern-tasks'] });
      toast.success('Task status updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update task status');
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'destructive';
      case 'HIGH': return 'default';
      case 'MEDIUM': return 'secondary';
      case 'LOW': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'ASSIGNED': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="h-4 w-4" />;
      case 'LINK': return <ExternalLink className="h-4 w-4" />;
      case 'VIDEO': return <Calendar className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Intern Portal</h1>
          <p className="text-muted-foreground">
            Welcome back, {internProfile.employee.name}!
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            {internProfile.employee.department?.name}
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {internProfile.university} - {internProfile.major}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {tasks.filter(t => t.status === 'COMPLETED').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tasks.filter(t => t.status === 'IN_PROGRESS').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resources</p>
                <p className="text-2xl font-bold">{resources.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="mentor">Mentor Info</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">My Tasks</h3>
            <div className="flex gap-2">
              <Badge variant="outline">
                {tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length} Active
              </Badge>
            </div>
          </div>
          
          <div className="grid gap-4">
            {tasks.map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{task.title}</h4>
                        <Badge variant={getPriorityColor(task.priority) as any} className="text-xs">
                          {task.priority}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Assigned by: {task.assigner.name}</span>
                        {task.deadline && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Due: {new Date(task.deadline).toLocaleDateString()}
                          </span>
                        )}
                        {task.category && (
                          <Badge variant="outline" className="text-xs">
                            {task.category}
                          </Badge>
                        )}
                      </div>
                      {task.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {task.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {task.status === 'ASSIGNED' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateTaskStatus.mutate({ taskId: task.id, status: 'IN_PROGRESS' })}
                          disabled={updateTaskStatus.isPending}
                        >
                          Start Task
                        </Button>
                      )}
                      {task.status === 'IN_PROGRESS' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateTaskStatus.mutate({ taskId: task.id, status: 'UNDER_REVIEW' })}
                          disabled={updateTaskStatus.isPending}
                        >
                          Submit for Review
                        </Button>
                      )}
                      {task.status === 'COMPLETED' && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Complete</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {task.feedback && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">Feedback:</p>
                      <p className="text-sm text-blue-700">{task.feedback}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Announcements</h3>
          <div className="grid gap-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{announcement.title}</h4>
                    <Badge variant={getPriorityColor(announcement.priority) as any}>
                      {announcement.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{announcement.content}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                    {announcement.expiresAt && (
                      <span className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <h3 className="text-lg font-semibold">Learning Resources</h3>
          <div className="grid gap-4">
            {resources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(resource.type)}
                        <h4 className="font-semibold">{resource.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {resource.type}
                        </Badge>
                      </div>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>By: {resource.uploader.name}</span>
                        <span className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          {resource.downloadCount} downloads
                        </span>
                      </div>
                      {resource.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {resource.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                        {resource.type === 'LINK' ? 'Visit' : 'Download'}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Mentor Info Tab */}
        <TabsContent value="mentor" className="space-y-4">
          <h3 className="text-lg font-semibold">Mentor Information</h3>
          {internProfile.mentor ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{internProfile.mentor.name}</h4>
                    <p className="text-sm text-muted-foreground">{internProfile.mentor.email}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Contact Information</p>
                    <p className="text-sm text-muted-foreground">
                      Email: {internProfile.mentor.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Internship Period</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(internProfile.startDate).toLocaleDateString()} - {
                        internProfile.endDate ? new Date(internProfile.endDate).toLocaleDateString() : 'Ongoing'
                      }
                    </p>
                  </div>
                  {internProfile.goals && (
                    <div>
                      <p className="text-sm font-medium">Learning Goals</p>
                      <p className="text-sm text-muted-foreground">{internProfile.goals}</p>
                    </div>
                  )}
                  {internProfile.skills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {internProfile.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button size="sm" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No mentor assigned yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <h3 className="text-lg font-semibold">Intern Chat</h3>
          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Chat functionality will be available soon!
              </p>
              <p className="text-sm text-muted-foreground">
                Connect with other interns, ask questions, and share experiences.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
