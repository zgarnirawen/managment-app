'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PaperAirplaneIcon,
  FaceSmileIcon,
  PaperClipIcon,
} from '@heroicons/react/24/outline';
import { 
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  UserGroupIcon as UserGroupIconSolid 
} from '@heroicons/react/24/solid';
import CreateChannelModal from './CreateChannelModal';
import StartDirectMessageModal from './StartDirectMessageModal';

interface ChatUser {
  id: string;
  name: string;
  email: string;
  department?: { id: string; name: string };
  role: { id: string; name: string };
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
  };
  hasConversation: boolean;
}

interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  type: 'GENERAL' | 'TEAM' | 'DEPARTMENT' | 'PROJECT' | 'INTERN' | 'ANNOUNCEMENT';
  isPrivate: boolean;
  createdBy: string;
  departmentId?: string;
  members: Array<{
    id: string;
    role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
    employee: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  department?: {
    id: string;
    name: string;
  };
  _count: {
    messages: number;
    members: number;
  };
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  content: string;
  messageType: 'TEXT' | 'FILE' | 'IMAGE';
  attachments: string[];
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
  };
  reactions: Array<{
    id: string;
    emoji: string;
    employee: {
      id: string;
      name: string;
    };
  }>;
  replyTo?: {
    id: string;
    content: string;
    sender: {
      id: string;
      name: string;
    };
  };
  replies?: ChatMessage[];
  _count?: {
    replies: number;
    reactions: number;
  };
}

interface DirectMessage {
  id: string;
  content: string;
  messageType: 'TEXT' | 'FILE' | 'IMAGE';
  attachments: string[];
  createdAt: string;
  senderId: string;
  receiverId: string;
  sender: {
    id: string;
    name: string;
    email: string;
  };
  receiver: {
    id: string;
    name: string;
    email: string;
  };
  reactions: Array<{
    id: string;
    emoji: string;
    employee: {
      id: string;
      name: string;
    };
  }>;
}

type ChatType = 'channels' | 'direct';
type ActiveChat = {
  type: ChatType;
  id: string;
  name: string;
};

export default function ChatInterface() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<ChatType>('channels');
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [messages, setMessages] = useState<(ChatMessage | DirectMessage)[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [showStartDirectMessageModal, setShowStartDirectMessageModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch initial data
  useEffect(() => {
    Promise.all([
      fetchChannels(),
      fetchUsers(),
    ]).finally(() => setLoading(false));
  }, []);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      fetchMessages();
    }
  }, [activeChat]);

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/chat/channels');
      if (response.ok) {
        const data = await response.json();
        setChannels(data.channels || []);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/chat/users?search=${searchQuery}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchMessages = async () => {
    if (!activeChat) return;
    
    try {
      let url = '/api/chat/messages?';
      if (activeChat.type === 'channels') {
        url += `channelId=${activeChat.id}`;
      } else {
        url += `receiverId=${activeChat.id}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat || sendingMessage) return;

    setSendingMessage(true);
    try {
      const payload: any = {
        content: newMessage.trim(),
        type: 'TEXT',
      };

      if (activeChat.type === 'channels') {
        payload.channelId = activeChat.id;
      } else {
        payload.receiverId = activeChat.id;
      }

      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages(); // Refresh messages
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectChat = (type: ChatType, id: string, name: string) => {
    setActiveChat({ type, id, name });
  };

  const handleChannelCreated = () => {
    fetchChannels(); // Refresh the channels list
  };

  const handleUserSelected = (userId: string, userName: string) => {
    selectChat('direct', userId, userName);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-nextgen-dark-blue">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nextgen-teal"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-nextgen-dark-blue">
      {/* Sidebar */}
      <div className="w-80 bg-nextgen-light-blue border-r border-nextgen-teal/20 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-nextgen-teal/20">
          <h1 className="text-xl font-semibold text-nextgen-white mb-4">Chat</h1>
          
          {/* Tab Switcher */}
          <div className="flex space-x-1 bg-nextgen-dark-blue/50 rounded-nextgen p-1">
            <button
              onClick={() => setActiveTab('channels')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'channels'
                  ? 'bg-nextgen-teal text-nextgen-dark-gray shadow-nextgen'
                  : 'text-nextgen-light-gray hover:text-nextgen-white hover:bg-nextgen-dark-blue/70'
              }`}
            >
              {activeTab === 'channels' ? (
                <UserGroupIconSolid className="h-4 w-4" />
              ) : (
                <UserGroupIcon className="h-4 w-4" />
              )}
              <span>Channels</span>
            </button>
            <button
              onClick={() => setActiveTab('direct')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'direct'
                  ? 'bg-nextgen-teal text-nextgen-dark-gray shadow-nextgen'
                  : 'text-nextgen-light-gray hover:text-nextgen-white hover:bg-nextgen-dark-blue/70'
              }`}
            >
              {activeTab === 'direct' ? (
                <ChatBubbleLeftRightIconSolid className="h-4 w-4" />
              ) : (
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
              )}
              <span>Direct</span>
            </button>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-nextgen-light-gray" />
            <input
              type="text"
              placeholder={activeTab === 'channels' ? 'Search channels...' : 'Search people...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-nextgen-dark-blue border border-nextgen-teal/30 rounded-nextgen focus:ring-2 focus:ring-nextgen-teal focus:border-nextgen-teal text-sm text-nextgen-white placeholder-nextgen-light-gray"
            />
          </div>

          {/* Create Channel Button */}
          {activeTab === 'channels' && (
            <div className="mt-4">
              <button
                onClick={() => setShowCreateChannelModal(true)}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-nextgen-teal hover:bg-nextgen-teal/80 text-white rounded-nextgen transition-all duration-200"
              >
                <PlusIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Create Channel</span>
              </button>
            </div>
          )}

          {/* Start Direct Message Button */}
          {activeTab === 'direct' && (
            <div className="mt-4">
              <button
                onClick={() => setShowStartDirectMessageModal(true)}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-nextgen-teal hover:bg-nextgen-teal/80 text-white rounded-nextgen transition-all duration-200"
              >
                <PlusIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Start Direct Message</span>
              </button>
            </div>
          )}
        </div>

        {/* Channel/User List */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'channels' ? (
            <div className="p-2">
              {filteredChannels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => selectChat('channels', channel.id, channel.name)}
                  className={`w-full p-3 rounded-nextgen text-left transition-all duration-200 ${
                    activeChat?.id === channel.id && activeChat?.type === 'channels'
                      ? 'bg-nextgen-teal/10 border border-nextgen-teal/30 shadow-nextgen'
                      : 'hover:bg-nextgen-dark-blue/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className={`w-2 h-2 rounded-full ${
                        channel.type === 'GENERAL' ? 'bg-nextgen-success' :
                        channel.type === 'TEAM' ? 'bg-nextgen-teal' :
                        channel.type === 'ANNOUNCEMENT' ? 'bg-nextgen-error' :
                        'bg-nextgen-light-gray'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-nextgen-white truncate">
                          #{channel.name}
                        </p>
                        <p className="text-xs text-nextgen-light-gray truncate">
                          {channel._count.members} members
                        </p>
                      </div>
                    </div>
                    {channel.isPrivate && (
                      <div className="w-2 h-2 bg-nextgen-warning rounded-full" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-2">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => selectChat('direct', user.id, user.name)}
                  className={`w-full p-3 rounded-nextgen text-left transition-all duration-200 ${
                    activeChat?.id === user.id && activeChat?.type === 'direct'
                      ? 'bg-nextgen-teal/10 border border-nextgen-teal/30 shadow-nextgen'
                      : 'hover:bg-nextgen-dark-blue/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-nextgen-teal to-nextgen-light-blue rounded-full flex items-center justify-center text-nextgen-dark-gray text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-nextgen-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-nextgen-light-gray truncate">
                        {user.department?.name} • {user.role.name}
                      </p>
                      {user.lastMessage && (
                        <p className="text-xs text-nextgen-light-gray/70 truncate mt-1">
                          {user.lastMessage.content}
                        </p>
                      )}
                    </div>
                    {user.lastMessage && (
                      <div className="text-xs text-nextgen-light-gray">
                        {formatTime(user.lastMessage.createdAt)}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-nextgen-teal/20 bg-nextgen-light-blue">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-nextgen-teal to-nextgen-light-blue rounded-full flex items-center justify-center text-nextgen-dark-gray text-sm font-medium">
                    {activeChat.type === 'channels' ? '#' : activeChat.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-nextgen-white">
                      {activeChat.type === 'channels' ? `#${activeChat.name}` : activeChat.name}
                    </h2>
                    <p className="text-sm text-nextgen-light-gray">
                      {activeChat.type === 'channels' ? 'Channel' : 'Direct message'}
                    </p>
                  </div>
                </div>
                <button className="p-2 text-nextgen-light-gray hover:text-nextgen-white rounded-nextgen hover:bg-nextgen-dark-blue/50 transition-colors">
                  <EllipsisVerticalIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-nextgen-dark-blue">
              {messages.map((message) => {
                const isOwnMessage = message.sender.id === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                      {!isOwnMessage && (
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-6 h-6 bg-gradient-to-br from-nextgen-teal to-nextgen-light-blue rounded-full flex items-center justify-center text-nextgen-dark-gray text-xs font-medium">
                            {message.sender.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-nextgen-white">
                            {message.sender.name}
                          </span>
                          <span className="text-xs text-nextgen-light-gray">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                      )}
                      <div
                        className={`rounded-nextgen px-4 py-2 shadow-nextgen ${
                          isOwnMessage
                            ? 'bg-nextgen-teal text-nextgen-dark-gray'
                            : 'bg-nextgen-light-blue text-nextgen-white border border-nextgen-teal/20'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      {isOwnMessage && (
                        <div className="text-xs text-nextgen-light-gray mt-1 text-right">
                          {formatTime(message.createdAt)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-nextgen-teal/20 bg-nextgen-light-blue">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Message ${activeChat.type === 'channels' ? `#${activeChat.name}` : activeChat.name}`}
                      rows={1}
                      className="w-full px-4 py-3 bg-nextgen-dark-blue border border-nextgen-teal/30 rounded-nextgen focus:ring-2 focus:ring-nextgen-teal focus:border-nextgen-teal resize-none text-sm text-nextgen-white placeholder-nextgen-light-gray shadow-nextgen"
                      style={{ minHeight: '44px' }}
                    />
                    <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                      <button className="p-1 text-nextgen-light-gray hover:text-nextgen-white rounded transition-colors">
                        <PaperClipIcon className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-nextgen-light-gray hover:text-nextgen-white rounded transition-colors">
                        <FaceSmileIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="p-3 bg-nextgen-teal text-nextgen-dark-gray rounded-nextgen hover:bg-nextgen-teal-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-nextgen transform hover:scale-105"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-nextgen-dark-blue">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-nextgen-light-gray mx-auto mb-4" />
              <h3 className="text-lg font-medium text-nextgen-white mb-2">
                Select a conversation
              </h3>
              <p className="text-nextgen-light-gray">
                Choose a channel or start a direct message to begin chatting.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Create Channel Modal */}
      <CreateChannelModal
        isOpen={showCreateChannelModal}
        onClose={() => setShowCreateChannelModal(false)}
        onChannelCreated={handleChannelCreated}
      />

      {/* Start Direct Message Modal */}
      <StartDirectMessageModal
        isOpen={showStartDirectMessageModal}
        onClose={() => setShowStartDirectMessageModal(false)}
        onUserSelected={handleUserSelected}
      />
    </div>
  );
}
