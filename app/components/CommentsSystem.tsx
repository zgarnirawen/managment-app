'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  MessageCircle, 
  Send, 
  Reply, 
  Edit, 
  Trash2, 
  AtSign,
  MoreHorizontal,
  Heart,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentId?: string;
  author: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      imageUrl?: string;
    };
  };
  mentions: Array<{
    id: string;
    mentionedEmployee: {
      id: string;
      user: {
        firstName: string;
        lastName: string;
        imageUrl?: string;
      };
    };
  }>;
  replies: Comment[];
}

interface Employee {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    imageUrl?: string;
  };
}

interface CommentsSystemProps {
  entityType: 'TASK' | 'PROJECT';
  entityId: string;
  teamMembers?: Employee[];
}

export default function CommentsSystem({ 
  entityType, 
  entityId, 
  teamMembers = [] 
}: CommentsSystemProps) {
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchComments();
    }
  }, [user, entityType, entityId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mentionsRef.current && !mentionsRef.current.contains(event.target as Node)) {
        setShowMentions(false);
      }
    };

    if (showMentions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMentions]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/comments?entityType=${entityType}&entityId=${entityId}`);
      const data = await response.json();

      if (response.ok) {
        setComments(data.comments || []);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch comments');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async (content: string, parentId?: string, mentions: string[] = []) => {
    if (!content.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          entityType,
          entityId,
          parentId,
          mentions
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Add new comment to the list
        if (parentId) {
          // It's a reply - update the parent comment's replies
          setComments(prev => prev.map(comment => 
            comment.id === parentId 
              ? { ...comment, replies: [...comment.replies, data] }
              : comment
          ));
        } else {
          // It's a top-level comment
          setComments(prev => [data, ...prev]);
        }
        
        setSuccess('Comment posted successfully');
        setTimeout(() => setSuccess(null), 3000);
        
        // Reset form
        setNewComment('');
        setReplyingTo(null);
        setSelectedMentions([]);
      } else {
        setError(data.error || 'Failed to post comment');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const updateComment = async (commentId: string, content: string) => {
    if (!content.trim()) return;

    try {
      const response = await fetch('/api/comments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId,
          content: content.trim()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update comment in the list
        setComments(prev => prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, content: data.comment.content, updatedAt: data.comment.updatedAt }
            : {
                ...comment,
                replies: comment.replies.map(reply =>
                  reply.id === commentId
                    ? { ...reply, content: data.comment.content, updatedAt: data.comment.updatedAt }
                    : reply
                )
              }
        ));
        
        setEditingComment(null);
        setEditContent('');
        setSuccess('Comment updated successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to update comment');
      }
    } catch (error) {
      setError('Network error occurred');
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/api/comments?id=${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove comment from the list
        setComments(prev => prev.filter(comment => {
          if (comment.id === commentId) return false;
          comment.replies = comment.replies.filter(reply => reply.id !== commentId);
          return true;
        }));
        
        setSuccess('Comment deleted successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete comment');
      }
    } catch (error) {
      setError('Network error occurred');
    }
  };

  const handleMentionSelect = (employeeId: string) => {
    if (!selectedMentions.includes(employeeId)) {
      setSelectedMentions([...selectedMentions, employeeId]);
    }
    setShowMentions(false);
    setMentionSearch('');
    textareaRef.current?.focus();
  };

  const removeMention = (employeeId: string) => {
    setSelectedMentions(selectedMentions.filter(id => id !== employeeId));
  };

  const filteredTeamMembers = teamMembers.filter(member =>
    `${member.user.firstName} ${member.user.lastName}`
      .toLowerCase()
      .includes(mentionSearch.toLowerCase())
  );

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const canEditComment = (comment: Comment) => {
    const timeDiff = Date.now() - new Date(comment.createdAt).getTime();
    const isWithinEditWindow = timeDiff <= 24 * 60 * 60 * 1000; // 24 hours
    const isAuthor = user?.publicMetadata?.employeeId === comment.author.id;
    
    return isAuthor && isWithinEditWindow;
  };

  const canDeleteComment = (comment: Comment) => {
    const isAuthor = user?.publicMetadata?.employeeId === comment.author.id;
    const isManagerOrAbove = ['manager', 'admin', 'super_admin'].includes(user?.publicMetadata?.role as string);
    
    return isAuthor || isManagerOrAbove;
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-12' : ''} mb-4`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {comment.author.user.imageUrl ? (
            <img
              src={comment.author.user.imageUrl}
              alt={`${comment.author.user.firstName} ${comment.author.user.lastName}`}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-700">
                {comment.author.user.firstName.charAt(0)}{comment.author.user.lastName.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {comment.author.user.firstName} {comment.author.user.lastName}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(comment.createdAt)}
                  {comment.updatedAt !== comment.createdAt && ' (edited)'}
                </span>
              </div>

              {/* Comment Actions */}
              <div className="flex items-center gap-1">
                {!isReply && (
                  <button
                    onClick={() => setReplyingTo(comment.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    title="Reply"
                  >
                    <Reply className="w-4 h-4" />
                  </button>
                )}
                
                {canEditComment(comment) && (
                  <button
                    onClick={() => {
                      setEditingComment(comment.id);
                      setEditContent(comment.content);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                
                {canDeleteComment(comment) && (
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Comment Text */}
            {editingComment === comment.id ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => updateComment(comment.id, editContent)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingComment(null);
                      setEditContent('');
                    }}
                    className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {comment.content}
              </p>
            )}

            {/* Mentions */}
            {comment.mentions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {comment.mentions.map((mention) => (
                  <span
                    key={mention.id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    <AtSign className="w-3 h-3" />
                    {mention.mentionedEmployee.user.firstName} {mention.mentionedEmployee.user.lastName}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-3 ml-4">
              <div className="space-y-2">
                <textarea
                  ref={textareaRef}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />

                {/* Mentions Section */}
                {selectedMentions.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedMentions.map((mentionId) => {
                      const member = teamMembers.find(m => m.id === mentionId);
                      return member ? (
                        <span
                          key={mentionId}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          <AtSign className="w-3 h-3" />
                          {member.user.firstName} {member.user.lastName}
                          <button
                            onClick={() => removeMention(mentionId)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="relative" ref={mentionsRef}>
                    <button
                      onClick={() => setShowMentions(!showMentions)}
                      className="flex items-center gap-1 px-2 py-1 text-gray-500 hover:text-gray-700 text-sm"
                    >
                      <AtSign className="w-4 h-4" />
                      Mention
                    </button>

                    {showMentions && (
                      <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <div className="p-2">
                          <input
                            type="text"
                            placeholder="Search team members..."
                            value={mentionSearch}
                            onChange={(e) => setMentionSearch(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="max-h-40 overflow-y-auto">
                          {filteredTeamMembers.map((member) => (
                            <button
                              key={member.id}
                              onClick={() => handleMentionSelect(member.id)}
                              className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 text-left"
                            >
                              {member.user.imageUrl ? (
                                <img
                                  src={member.user.imageUrl}
                                  alt={`${member.user.firstName} ${member.user.lastName}`}
                                  className="w-6 h-6 rounded-full"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-xs text-gray-700">
                                    {member.user.firstName.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <span className="text-sm">
                                {member.user.firstName} {member.user.lastName}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setNewComment('');
                        setSelectedMentions([]);
                      }}
                      className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => submitComment(newComment, comment.id, selectedMentions)}
                      disabled={!newComment.trim() || submitting}
                      className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies.length > 0 && (
            <div className="mt-4 space-y-3">
              {comment.replies.map((reply) => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-auto"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">{success}</span>
          <button 
            onClick={() => setSuccess(null)}
            className="ml-auto"
          >
            ×
          </button>
        </div>
      )}

      {/* New Comment Form */}
      {!replyingTo && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">Comments</h3>
            <span className="text-sm text-gray-500">({comments.length})</span>
          </div>

          <div className="space-y-2">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />

            {/* Mentions Section */}
            {selectedMentions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedMentions.map((mentionId) => {
                  const member = teamMembers.find(m => m.id === mentionId);
                  return member ? (
                    <span
                      key={mentionId}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      <AtSign className="w-3 h-3" />
                      {member.user.firstName} {member.user.lastName}
                      <button
                        onClick={() => removeMention(mentionId)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="relative" ref={mentionsRef}>
                <button
                  onClick={() => setShowMentions(!showMentions)}
                  className="flex items-center gap-1 px-2 py-1 text-gray-500 hover:text-gray-700 text-sm"
                >
                  <AtSign className="w-4 h-4" />
                  Mention
                </button>

                {showMentions && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <div className="p-2">
                      <input
                        type="text"
                        placeholder="Search team members..."
                        value={mentionSearch}
                        onChange={(e) => setMentionSearch(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {filteredTeamMembers.map((member) => (
                        <button
                          key={member.id}
                          onClick={() => handleMentionSelect(member.id)}
                          className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 text-left"
                        >
                          {member.user.imageUrl ? (
                            <img
                              src={member.user.imageUrl}
                              alt={`${member.user.firstName} ${member.user.lastName}`}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-xs text-gray-700">
                                {member.user.firstName.charAt(0)}
                              </span>
                            </div>
                          )}
                          <span className="text-sm">
                            {member.user.firstName} {member.user.lastName}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => submitComment(newComment, undefined, selectedMentions)}
                disabled={!newComment.trim() || submitting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => renderComment(comment))
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
}
