'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Calendar, 
  User, 
  MessageSquare, 
  Paperclip, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Tag,
  FolderOpen
} from 'lucide-react';
import { format } from 'date-fns';
import CommentsSection from './CommentsSection';
import FileUpload from './FileUpload';

interface TaskDetailsModalProps {
  taskId?: string;
  projectId?: string;
  isOpen: boolean;
  onClose: () => void;
}

// Mock employees data - in real app, this would come from your employee management
const MOCK_EMPLOYEES = [
  { id: 'emp1', name: 'John Doe', email: 'john@company.com' },
  { id: 'emp2', name: 'Jane Smith', email: 'jane@company.com' },
  { id: 'emp3', name: 'Mike Johnson', email: 'mike@company.com' },
  { id: 'user_31rxl2mNODsaNM9z2wWgdIVvJdT', name: 'Current User', email: 'currentuser@company.com' }
];

export default function TaskDetailsModal({ 
  taskId, 
  projectId, 
  isOpen, 
  onClose 
}: TaskDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('details');

  // Fetch task details
  const { data: taskData, isLoading: taskLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}`);
      if (!response.ok) throw new Error('Failed to fetch task');
      return response.json();
    },
    enabled: !!taskId && isOpen
  });

  // Fetch project details
  const { data: projectData, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      return response.json();
    },
    enabled: !!projectId && isOpen
  });

  const data = taskData || projectData;
  const isLoading = taskLoading || projectLoading;
  const isTask = !!taskId;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
      case 'PLANNED':
        return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS':
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800';
      case 'DONE':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'BLOCKED':
      case 'ON_HOLD':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DONE':
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'IN_PROGRESS':
      case 'ACTIVE':
        return <Clock className="w-4 h-4" />;
      case 'BLOCKED':
      case 'ON_HOLD':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isTask ? <Tag className="w-5 h-5" /> : <FolderOpen className="w-5 h-5" />}
            {isLoading ? 'Loading...' : data?.title || data?.name}
          </DialogTitle>
          <DialogDescription>
            {isTask ? 'Task Details' : 'Project Details'} - Manage comments and attachments
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details" className="flex items-center gap-2">
                {isTask ? <Tag className="w-4 h-4" /> : <FolderOpen className="w-4 h-4" />}
                Details
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Comments
              </TabsTrigger>
              <TabsTrigger value="attachments" className="flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Attachments
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 mt-4">
              <TabsContent value="details" className="space-y-4 m-0">
                <ScrollArea className="max-h-96">
                  <div className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(data?.status)}
                          <Badge className={getStatusColor(data?.status)}>
                            {data?.status}
                          </Badge>
                        </div>
                      </div>
                      
                      {isTask && data?.priority && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Priority</label>
                          <div className="mt-1">
                            <Badge className={getPriorityColor(data.priority)}>
                              {data.priority}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {data?.description && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Description</label>
                        <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                          {data.description}
                        </p>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      {(data?.dueDate || data?.deadline) && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            {isTask ? 'Due Date' : 'Deadline'}
                          </label>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              {format(new Date(data.dueDate || data.deadline), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      )}

                      {data?.createdAt && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Created</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              {format(new Date(data.createdAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Assigned To */}
                    {data?.assignedTo && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Assigned To</label>
                        <div className="flex items-center gap-2 mt-1">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{data.assignedTo.name}</span>
                        </div>
                      </div>
                    )}

                    {/* Project (for tasks) */}
                    {isTask && data?.project && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Project</label>
                        <div className="flex items-center gap-2 mt-1">
                          <FolderOpen className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{data.project.name}</span>
                        </div>
                      </div>
                    )}

                    {/* Subtasks (for tasks) */}
                    {isTask && data?.subtasks && data.subtasks.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Subtasks ({data.subtasks.length})
                        </label>
                        <div className="mt-2 space-y-2">
                          {data.subtasks.map((subtask: any) => (
                            <div key={subtask.id} className="flex items-center gap-2 p-2 border rounded">
                              <CheckCircle className={`w-4 h-4 ${
                                subtask.status === 'DONE' ? 'text-green-500' : 'text-gray-400'
                              }`} />
                              <span className={`text-sm ${
                                subtask.status === 'DONE' ? 'line-through text-gray-500' : ''
                              }`}>
                                {subtask.title}
                              </span>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getStatusColor(subtask.status)}`}
                              >
                                {subtask.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="comments" className="m-0 h-full">
                <CommentsSection
                  taskId={taskId}
                  projectId={projectId}
                  currentUserId="user_31rxl2mNODsaNM9z2wWgdIVvJdT"
                  employees={MOCK_EMPLOYEES}
                />
              </TabsContent>

              <TabsContent value="attachments" className="m-0 h-full">
                <FileUpload
                  taskId={taskId}
                  projectId={projectId}
                  existingAttachments={data?.attachments || []}
                  onUploadComplete={(fileUrl) => {
                    // Refresh the data to show new attachment
                    // In a real app, you might want to update the cache directly
                  }}
                />
              </TabsContent>
            </div>
          </Tabs>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
