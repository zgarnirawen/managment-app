'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  Send, 
  Users, 
  MessageCircle, 
  Plus, 
  Hash, 
  User,
  Settings,
  Search,
  Smile,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  receiverId?: string;
  receiverName?: string;
  channelId?: string;
  createdAt: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  isRead?: boolean;
}

interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'GENERAL' | 'TEAM' | 'DEPARTMENT' | 'PROJECT' | 'INTERN';
  memberCount?: number;
  isPrivate: boolean;
  unreadCount?: number;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  status?: 'online' | 'offline' | 'away';
  lastSeen?: string;
}

interface ChatSystemProps {
  currentEmployeeId: string;
  currentEmployeeName: string;
  currentEmployeeEmail: string;
}

export default function ChatSystem({ 
  currentEmployeeId, 
  currentEmployeeName, 
  currentEmployeeEmail 
}: ChatSystemProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentView, setCurrentView] = useState<'channels' | 'direct'>('channels');
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [activeDirectUserId, setActiveDirectUserId] = useState<string | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showMembersList, setShowMembersList] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize Socket.IO connection
    const socketIO = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001', {
      path: '/api/socketio',
      addTrailingSlash: false,
    });

    socketIO.on('connect', () => {

      setIsConnected(true);
      socketIO.emit('join', currentEmployeeId);
      socketIO.emit('user_online', currentEmployeeId);
    });

    socketIO.on('disconnect', () => {

      setIsConnected(false);
    });

    // Message events
    socketIO.on('channel_message', (message: Message) => {
      if (currentView === 'channels' && message.channelId === activeChannelId) {
        setMessages(prev => [...prev, message]);
      }
    });

    socketIO.on('direct_message', (message: Message) => {
      if (currentView === 'direct' && 
          (message.senderId === activeDirectUserId || message.receiverId === activeDirectUserId)) {
        setMessages(prev => [...prev, message]);
      }
    });

    socketIO.on('message_error', (error: { error: string }) => {
      console.error('Message error:', error);
    });

    // Typing indicators
    socketIO.on('user_typing', (data: { employeeId: string; employeeName: string; channelId?: string; receiverId?: string }) => {
      if ((currentView === 'channels' && data.channelId === activeChannelId) ||
          (currentView === 'direct' && data.receiverId === currentEmployeeId)) {
        setTypingUsers(prev => new Set([...prev, data.employeeName]));
      }
    });

    socketIO.on('user_stop_typing', (data: { employeeId: string; channelId?: string; receiverId?: string }) => {
      if ((currentView === 'channels' && data.channelId === activeChannelId) ||
          (currentView === 'direct' && data.receiverId === currentEmployeeId)) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          const employee = employees.find(e => e.id === data.employeeId);
          if (employee) {
            newSet.delete(employee.name);
          }
          return newSet;
        });
      }
    });

    // Status updates
    socketIO.on('user_status_change', (data: { employeeId: string; status: string; timestamp: string }) => {
      setEmployees(prev => prev.map(emp => 
        emp.id === data.employeeId 
          ? { ...emp, status: data.status as any, lastSeen: data.timestamp }
          : emp
      ));
    });

    setSocket(socketIO);

    return () => {
      socketIO.disconnect();
    };
  }, [currentEmployeeId]);

  useEffect(() => {
    // Fetch initial data
    fetchChannels();
    fetchEmployees();
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Load messages when switching channels/conversations
    if (currentView === 'channels' && activeChannelId) {
      fetchChannelMessages(activeChannelId);
      if (socket) {
        socket.emit('join_channel', activeChannelId);
      }
    } else if (currentView === 'direct' && activeDirectUserId) {
      fetchDirectMessages(activeDirectUserId);
    }
  }, [activeChannelId, activeDirectUserId, currentView, socket]);

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/chat/channels');
      if (response.ok) {
        const data = await response.json();
        setChannels(data);
        if (data.length > 0 && !activeChannelId) {
          setActiveChannelId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.filter((emp: Employee) => emp.id !== currentEmployeeId));
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchChannelMessages = async (channelId: string) => {
    try {
      const response = await fetch(`/api/chat/channels/${channelId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching channel messages:', error);
    }
  };

  const fetchDirectMessages = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/chat/direct/${currentEmployeeId}/${employeeId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching direct messages:', error);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    if (currentView === 'channels' && activeChannelId) {
      socket.emit('send_channel_message', {
        channelId: activeChannelId,
        content: newMessage,
        senderId: currentEmployeeId,
        senderName: currentEmployeeName,
        messageType: 'TEXT'
      });
    } else if (currentView === 'direct' && activeDirectUserId) {
      socket.emit('send_direct_message', {
        content: newMessage,
        senderId: currentEmployeeId,
        receiverId: activeDirectUserId,
        senderName: currentEmployeeName,
        messageType: 'TEXT'
      });
    }

    setNewMessage('');
    stopTyping();
  };

  const handleTyping = () => {
    if (!socket) return;

    if (!isTyping) {
      setIsTyping(true);
      if (currentView === 'channels' && activeChannelId) {
        socket.emit('typing_start', {
          channelId: activeChannelId,
          employeeId: currentEmployeeId,
          employeeName: currentEmployeeName
        });
      } else if (currentView === 'direct' && activeDirectUserId) {
        socket.emit('typing_start', {
          receiverId: activeDirectUserId,
          employeeId: currentEmployeeId,
          employeeName: currentEmployeeName
        });
      }
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  const stopTyping = () => {
    if (isTyping && socket) {
      setIsTyping(false);
      if (currentView === 'channels' && activeChannelId) {
        socket.emit('typing_stop', {
          channelId: activeChannelId,
          employeeId: currentEmployeeId
        });
      } else if (currentView === 'direct' && activeDirectUserId) {
        socket.emit('typing_stop', {
          receiverId: activeDirectUserId,
          employeeId: currentEmployeeId
        });
      }
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCurrentChatName = () => {
    if (currentView === 'channels' && activeChannelId) {
      const channel = channels.find(c => c.id === activeChannelId);
      return channel ? `# ${channel.name}` : '';
    } else if (currentView === 'direct' && activeDirectUserId) {
      const employee = employees.find(e => e.id === activeDirectUserId);
      return employee ? employee.name : '';
    }
    return '';
  };

  if (!isConnected) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <Alert>
            <AlertDescription>
              Connexion au serveur de chat en cours...
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Chat</h2>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          <Button
            variant={currentView === 'channels' ? 'default' : 'ghost'}
            className="flex-1 rounded-none"
            onClick={() => setCurrentView('channels')}
          >
            <Hash className="h-4 w-4 mr-2" />
            Canaux
          </Button>
          <Button
            variant={currentView === 'direct' ? 'default' : 'ghost'}
            className="flex-1 rounded-none"
            onClick={() => setCurrentView('direct')}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Messages
          </Button>
        </div>

        {/* Channels/Direct Messages List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {currentView === 'channels' ? (
              <>
                <div className="flex items-center justify-between mb-2 px-2">
                  <span className="text-sm font-medium text-gray-600">Canaux</span>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {filteredChannels.map((channel) => (
                  <Button
                    key={channel.id}
                    variant={activeChannelId === channel.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start mb-1 h-auto p-2"
                    onClick={() => setActiveChannelId(channel.id)}
                  >
                    <div className="flex items-center">
                      <Hash className="h-4 w-4 mr-2 text-gray-500" />
                      <div className="text-left">
                        <div className="font-medium">{channel.name}</div>
                        {channel.memberCount && (
                          <div className="text-xs text-gray-500">
                            {channel.memberCount} membres
                          </div>
                        )}
                      </div>
                      {channel.unreadCount && channel.unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-auto">
                          {channel.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </Button>
                ))}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2 px-2">
                  <span className="text-sm font-medium text-gray-600">Messages directs</span>
                </div>
                {filteredEmployees.map((employee) => (
                  <Button
                    key={employee.id}
                    variant={activeDirectUserId === employee.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start mb-1 h-auto p-2"
                    onClick={() => setActiveDirectUserId(employee.id)}
                  >
                    <div className="flex items-center">
                      <div className="relative">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(employee.status)}`} />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-xs text-gray-500">
                          {employee.status === 'online' ? 'En ligne' : 
                           employee.status === 'away' ? 'Absent' : 'Hors ligne'}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </>
            )}
          </div>
        </ScrollArea>

        {/* User Status */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="relative">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {currentEmployeeName.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div className="ml-3">
              <div className="font-medium text-sm">{currentEmployeeName}</div>
              <div className="text-xs text-gray-500">En ligne</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {getCurrentChatName()}
              </h3>
              {currentView === 'channels' && activeChannelId && (
                <Button variant="ghost" size="sm" className="ml-2">
                  <Users className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {currentView === 'direct' && (
                <>
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === currentEmployeeId ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === currentEmployeeId
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {message.senderId !== currentEmployeeId && (
                    <div className="text-xs font-medium mb-1 text-gray-600">
                      {message.senderName}
                    </div>
                  )}
                  <div className="text-sm">{message.content}</div>
                  <div className={`text-xs mt-1 ${
                    message.senderId === currentEmployeeId ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {typingUsers.size > 0 && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm">
                  {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'tape' : 'tapent'}...
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Paperclip className="h-4 w-4" />
            </Button>
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Tapez votre message..."
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
