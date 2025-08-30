'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { AlertCircle, Send, MessageSquare, Edit, Trash2, User } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner';
import { format } from 'date-fns';
import Pusher from 'pusher-js';

interface Employee {
  id: string;
  name: string;
  email: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: Employee;
  mentions: Employee[];
}

interface CommentsSectionProps {
  taskId?: string;
  projectId?: string;
  currentUserId: string;
  employees: Employee[];
}

// Mock current user for demo
const CURRENT_USER_ID = 'user_31rxl2mNODsaNM9z2wWgdIVvJdT';

export default function CommentsSection({ 
  taskId, 
  projectId, 
  currentUserId = CURRENT_USER_ID,
  employees = []
}: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [mentionSuggestions, setMentionSuggestions] = useState<Employee[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  // Set up Pusher for real-time updates
  useEffect(() => {
    if (!taskId && !projectId) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(taskId ? `task-${taskId}` : `project-${projectId}`);
    
    channel.bind('comment-added', (data: { comment: Comment }) => {
      queryClient.setQueryData(
        ['comments', taskId || projectId],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            comments: [data.comment, ...oldData.comments]
          };
        }
      );
      toast.success('New comment added');
    });

    channel.bind('comment-updated', (data: { comment: Comment }) => {
      queryClient.setQueryData(
        ['comments', taskId || projectId],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            comments: oldData.comments.map((comment: Comment) =>
              comment.id === data.comment.id ? data.comment : comment
            )
          };
        }
      );
      toast.success('Comment updated');
    });

    channel.bind('comment-deleted', (data: { commentId: string }) => {
      queryClient.setQueryData(
        ['comments', taskId || projectId],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            comments: oldData.comments.filter((comment: Comment) => comment.id !== data.commentId)
          };
        }
      );
      toast.success('Comment deleted');
    });

    return () => {
      pusher.unsubscribe(taskId ? `task-${taskId}` : `project-${projectId}`);
    };
  }, [taskId, projectId, queryClient]);

  // Fetch comments
  const { data: commentsData, isLoading, error } = useQuery({
    queryKey: ['comments', taskId || projectId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (taskId) params.append('taskId', taskId);
      if (projectId) params.append('projectId', projectId);
      
      const response = await fetch(`/api/comments?${params}`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json();
    },
    enabled: !!(taskId || projectId)
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (data: { content: string; mentions: string[] }) => {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: data.content,
          taskId,
          projectId,
          authorId: currentUserId,
          mentions: data.mentions
        })
      });
      if (!response.ok) throw new Error('Failed to create comment');
      return response.json();
    },
    onSuccess: () => {
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['comments', taskId || projectId] });
      toast.success('Comment added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Update comment mutation
  const updateCommentMutation = useMutation({
    mutationFn: async (data: { id: string; content: string }) => {
      const response = await fetch(`/api/comments/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data.content })
      });
      if (!response.ok) throw new Error('Failed to update comment');
      return response.json();
    },
    onSuccess: () => {
      setEditingCommentId(null);
      setEditContent('');
      queryClient.invalidateQueries({ queryKey: ['comments', taskId || projectId] });
      toast.success('Comment updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete comment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId || projectId] });
      toast.success('Comment deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Handle @mentions
  const handleCommentChange = (value: string) => {
    setNewComment(value);
    
    // Check for @ mentions
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const afterAt = value.substring(lastAtIndex + 1);
      const spaceIndex = afterAt.indexOf(' ');
      const mention = spaceIndex === -1 ? afterAt : afterAt.substring(0, spaceIndex);
      
      if (mention.length > 0) {
        const filtered = employees.filter(emp => 
          emp.name.toLowerCase().includes(mention.toLowerCase())
        );
        setMentionSuggestions(filtered);
        setShowMentions(true);
        setMentionStartIndex(lastAtIndex);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (employee: Employee) => {
    if (mentionStartIndex !== -1) {
      const beforeMention = newComment.substring(0, mentionStartIndex);
      const afterMention = newComment.substring(newComment.indexOf(' ', mentionStartIndex) || newComment.length);
      const newText = `${beforeMention}@${employee.name} ${afterMention}`;
      setNewComment(newText);
      setShowMentions(false);
      textareaRef.current?.focus();
    }
  };

  const extractMentions = (content: string): string[] => {
    const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      const mentionedName = match[1];
      const employee = employees.find(emp => emp.name === mentionedName);
      if (employee) {
        mentions.push(employee.id);
      }
    }
    
    return mentions;
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    
    const mentions = extractMentions(newComment);
    createCommentMutation.mutate({ content: newComment, mentions });
  };

  const handleUpdateComment = (commentId: string) => {
    if (!editContent.trim()) return;
    updateCommentMutation.mutate({ id: commentId, content: editContent });
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  if (!taskId && !projectId) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Either taskId or projectId must be provided to load comments.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load comments. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const comments = commentsData?.comments || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Comment Form */}
        <div className="space-y-2 relative">
          <Textarea
            ref={textareaRef}
            placeholder="Add a comment... Use @name to mention someone"
            value={newComment}
            onChange={(e) => handleCommentChange(e.target.value)}
            className="min-h-[80px]"
          />
          
          {/* Mention Suggestions */}
          {showMentions && mentionSuggestions.length > 0 && (
            <Card className="absolute z-10 mt-1 max-h-40 overflow-auto">
              <CardContent className="p-2">
                {mentionSuggestions.map(employee => (
                  <div
                    key={employee.id}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer rounded"
                    onClick={() => insertMention(employee)}
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {employee.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{employee.name}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Tip: Use @name to mention team members
            </span>
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || createCommentMutation.isPending}
              size="sm"
            >
              <Send className="w-4 h-4 mr-2" />
              {createCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <ScrollArea className="max-h-96">
          <div className="space-y-3">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              comments.map((comment: Comment) => (
                <div key={comment.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-sm">
                          {comment.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{comment.author.name}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(comment.createdAt), 'MMM d, yyyy at h:mm a')}
                          {comment.updatedAt !== comment.createdAt && ' (edited)'}
                        </p>
                      </div>
                    </div>
                    
                    {comment.author.id === currentUserId && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(comment)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Comment Content */}
                  {editingCommentId === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[60px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateComment(comment.id)}
                          disabled={updateCommentMutation.isPending}
                        >
                          {updateCommentMutation.isPending ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEditing}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                      
                      {/* Show mentions */}
                      {comment.mentions.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {comment.mentions.map(mention => (
                            <Badge key={mention.id} variant="secondary" className="text-xs">
                              <User className="w-3 h-3 mr-1" />
                              {mention.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
