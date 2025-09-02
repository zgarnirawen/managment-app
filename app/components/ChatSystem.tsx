'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, MessageCircle, Users, Search, MoreVertical, Phone, Video, Paperclip, Smile } from 'lucide-react'

interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderRole: string
  content: string
  timestamp: Date
  isRead: boolean
  type: 'text' | 'file' | 'system'
}

interface ChatChannel {
  id: string
  name: string
  type: 'direct' | 'group' | 'team'
  participants: string[]
  lastMessage?: ChatMessage
  unreadCount: number
  isOnline?: boolean
}

const mockChannels: ChatChannel[] = [
  {
    id: '1',
    name: 'Team Alpha',
    type: 'team',
    participants: ['user1', 'user2', 'user3'],
    lastMessage: {
      id: 'm1',
      senderId: 'user2',
      senderName: 'John Smith',
      senderRole: 'Manager',
      content: 'Great work on the project!',
      timestamp: new Date(),
      isRead: false,
      type: 'text'
    },
    unreadCount: 2
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    type: 'direct',
    participants: ['user1', 'user4'],
    lastMessage: {
      id: 'm2',
      senderId: 'user4',
      senderName: 'Sarah Wilson',
      senderRole: 'Employee',
      content: 'Can we schedule a meeting?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isRead: true,
      type: 'text'
    },
    unreadCount: 0,
    isOnline: true
  },
  {
    id: '3',
    name: 'General',
    type: 'group',
    participants: ['user1', 'user2', 'user3', 'user4', 'user5'],
    lastMessage: {
      id: 'm3',
      senderId: 'user3',
      senderName: 'Mike Brown',
      senderRole: 'Admin',
      content: 'Company announcement: New policies effective Monday',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isRead: true,
      type: 'text'
    },
    unreadCount: 0
  }
]

const mockMessages: { [key: string]: ChatMessage[] } = {
  '1': [
    {
      id: 'm1',
      senderId: 'user2',
      senderName: 'John Smith',
      senderRole: 'Manager',
      content: 'How is everyone doing on their current tasks?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      isRead: true,
      type: 'text'
    },
    {
      id: 'm2',
      senderId: 'user3',
      senderName: 'Emma Davis',
      senderRole: 'Employee',
      content: 'Almost done with the UI components. Should be ready by EOD.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isRead: true,
      type: 'text'
    },
    {
      id: 'm3',
      senderId: 'user2',
      senderName: 'John Smith',
      senderRole: 'Manager',
      content: 'Great work on the project!',
      timestamp: new Date(),
      isRead: false,
      type: 'text'
    }
  ],
  '2': [
    {
      id: 'm4',
      senderId: 'user4',
      senderName: 'Sarah Wilson',
      senderRole: 'Employee',
      content: 'Hi! Hope you are doing well.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      isRead: true,
      type: 'text'
    },
    {
      id: 'm5',
      senderId: 'user1',
      senderName: 'You',
      senderRole: 'Manager',
      content: 'Hello Sarah! Yes, all good here. How can I help?',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      isRead: true,
      type: 'text'
    },
    {
      id: 'm6',
      senderId: 'user4',
      senderName: 'Sarah Wilson',
      senderRole: 'Employee',
      content: 'Can we schedule a meeting to discuss the quarterly review?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isRead: true,
      type: 'text'
    }
  ]
}

export default function ChatSystem() {
  const [channels] = useState<ChatChannel[]>(mockChannels)
  const [activeChannel, setActiveChannel] = useState<string>('1')
  const [messages, setMessages] = useState<{ [key: string]: ChatMessage[] }>(mockMessages)
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, activeChannel])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: ChatMessage = {
      id: `m${Date.now()}`,
      senderId: 'user1',
      senderName: 'You',
      senderRole: 'Manager',
      content: newMessage,
      timestamp: new Date(),
      isRead: true,
      type: 'text'
    }

    setMessages(prev => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] || []), message]
    }))

    setNewMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeChannelData = channels.find(c => c.id === activeChannel)
  const activeMessages = messages[activeChannel] || []

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super_admin':
        return 'text-red-600'
      case 'admin':
        return 'text-purple-600'
      case 'manager':
        return 'text-blue-600'
      case 'employee':
        return 'text-green-600'
      case 'intern':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="flex h-96 bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 border-r bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-white">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Messages</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChannels.map((channel) => (
            <div
              key={channel.id}
              onClick={() => setActiveChannel(channel.id)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-100 transition-colors ${
                activeChannel === channel.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      channel.type === 'direct' ? 'bg-green-500' : 
                      channel.type === 'team' ? 'bg-blue-500' : 'bg-purple-500'
                    } text-white font-medium text-sm`}>
                      {channel.type === 'direct' ? (
                        channel.name.charAt(0).toUpperCase()
                      ) : channel.type === 'team' ? (
                        <Users className="w-5 h-5" />
                      ) : (
                        <MessageCircle className="w-5 h-5" />
                      )}
                    </div>
                    {channel.isOnline && channel.type === 'direct' && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 truncate">{channel.name}</h4>
                      {channel.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatTime(channel.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    {channel.lastMessage && (
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {channel.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
                {channel.unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                    {channel.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChannelData ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activeChannelData.type === 'direct' ? 'bg-green-500' : 
                  activeChannelData.type === 'team' ? 'bg-blue-500' : 'bg-purple-500'
                } text-white font-medium`}>
                  {activeChannelData.type === 'direct' ? (
                    activeChannelData.name.charAt(0).toUpperCase()
                  ) : activeChannelData.type === 'team' ? (
                    <Users className="w-5 h-5" />
                  ) : (
                    <MessageCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{activeChannelData.name}</h3>
                  <p className="text-sm text-gray-500">
                    {activeChannelData.type === 'direct' ? 'Direct Message' : 
                     activeChannelData.type === 'team' ? 'Team Chat' : 'Group Chat'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === 'user1' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderId === 'user1'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {message.senderId !== 'user1' && (
                      <div className="text-xs font-medium mb-1">
                        <span className={getRoleColor(message.senderRole)}>
                          {message.senderName}
                        </span>
                        <span className="text-gray-500 ml-1">({message.senderRole})</span>
                      </div>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <div className={`text-xs mt-1 ${
                      message.senderId === 'user1' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <button className="p-1 text-gray-500 hover:text-gray-700">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-500 hover:text-gray-700">
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
              <p className="text-gray-600">Choose a conversation from the sidebar to start messaging.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
