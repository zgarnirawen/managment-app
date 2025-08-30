'use client';

import { useState } from 'react';
import { FaceSmileIcon } from '@heroicons/react/24/outline';

interface Reaction {
  emoji: string;
  employees: Array<{
    employeeId: string;
    employeeName: string;
  }>;
}

interface MessageReactionsProps {
  messageId: string;
  reactions: Record<string, Array<{ employeeId: string; employeeName: string }>>;
  currentUserId: string;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
}

const COMMON_EMOJIS = ['👍', '❤️', '😄', '😮', '😢', '😡', '👏', '🎉'];

export default function MessageReactions({
  messageId,
  reactions,
  currentUserId,
  onAddReaction,
  onRemoveReaction
}: MessageReactionsProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleReactionClick = (emoji: string) => {
    const reactionUsers = reactions[emoji] || [];
    const userHasReacted = reactionUsers.some(user => user.employeeId === currentUserId);
    
    if (userHasReacted) {
      onRemoveReaction(messageId, emoji);
    } else {
      onAddReaction(messageId, emoji);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    handleReactionClick(emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex items-center gap-1 mt-1">
      {/* Existing Reactions */}
      {Object.entries(reactions).map(([emoji, users]) => (
        <button
          key={emoji}
          onClick={() => handleReactionClick(emoji)}
          className={`
            flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors
            ${users.some(user => user.employeeId === currentUserId)
              ? 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200'
              : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
            }
          `}
          title={users.map(user => user.employeeName).join(', ')}
        >
          <span>{emoji}</span>
          <span>{users.length}</span>
        </button>
      ))}

      {/* Add Reaction Button */}
      <div className="relative">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          title="Add reaction"
        >
          <FaceSmileIcon className="w-4 h-4 text-gray-500" />
        </button>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
            <div className="grid grid-cols-4 gap-1">
              {COMMON_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiSelect(emoji)}
                  className="p-2 rounded hover:bg-gray-100 transition-colors text-lg"
                  title={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
