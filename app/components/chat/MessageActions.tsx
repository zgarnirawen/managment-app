'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  CheckIcon, 
  XMarkIcon,
  EllipsisVerticalIcon 
} from '@heroicons/react/24/outline';

interface MessageActionsProps {
  messageId: string;
  content: string;
  senderId: string;
  currentUserId: string;
  createdAt: string;
  isEdited?: boolean;
  editedAt?: string;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
  onReply?: (messageId: string) => void;
  className?: string;
}

export default function MessageActions({
  messageId,
  content,
  senderId,
  currentUserId,
  createdAt,
  isEdited = false,
  editedAt,
  onEdit,
  onDelete,
  onReply,
  className = ""
}: MessageActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [showActions, setShowActions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isOwnMessage = senderId === currentUserId;
  const canEdit = isOwnMessage && onEdit;
  const canDelete = isOwnMessage && onDelete;

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(editContent.length, editContent.length);
    }
  }, [isEditing, editContent.length]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditContent(content);
    setShowActions(false);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== content && onEdit) {
      onEdit(messageId, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(content);
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this message?')) {
      onDelete(messageId);
    }
    setShowActions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isEditing) {
    return (
      <div className={`space-y-2 ${className}`}>
        <textarea
          ref={textareaRef}
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Edit your message..."
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveEdit}
            disabled={!editContent.trim() || editContent === content}
            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <CheckIcon className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={handleCancelEdit}
            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
            Cancel
          </button>
          <span className="text-xs text-gray-500">
            Press Enter to save, Esc to cancel
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Message Content */}
      <div className="group">
        <p className="text-gray-900 whitespace-pre-wrap">{content}</p>
        
        {/* Message Meta Info */}
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          <span>{formatTime(createdAt)}</span>
          {isEdited && editedAt && (
            <>
              <span>•</span>
              <span title={`Edited at ${formatTime(editedAt)}`}>
                edited
              </span>
            </>
          )}
        </div>

        {/* Action Buttons (show on hover) */}
        {(canEdit || canDelete || onReply) && (
          <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                title="Message actions"
              >
                <EllipsisVerticalIcon className="w-4 h-4 text-gray-500" />
              </button>

              {showActions && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                  {onReply && (
                    <button
                      onClick={() => {
                        onReply(messageId);
                        setShowActions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Reply
                    </button>
                  )}
                  
                  {canEdit && (
                    <button
                      onClick={handleStartEdit}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                  
                  {canDelete && (
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
