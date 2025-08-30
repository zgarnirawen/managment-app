import { Server } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let io: Server;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const socket = res.socket as any;
  
  if (!socket.server.io) {
    console.log('Starting Socket.IO server...');
    
    io = new Server(socket.server, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:3000", "http://localhost:3001"],
        methods: ["GET", "POST"]
      }
    });

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Join employee to their personal room
      socket.on('join', (employeeId: string) => {
        socket.join(`employee_${employeeId}`);
        console.log(`Employee ${employeeId} joined their room`);
      });

      // Join chat channel
      socket.on('join_channel', (channelId: string) => {
        socket.join(`channel_${channelId}`);
        console.log(`Socket ${socket.id} joined channel ${channelId}`);
      });

      // Leave chat channel
      socket.on('leave_channel', (channelId: string) => {
        socket.leave(`channel_${channelId}`);
        console.log(`Socket ${socket.id} left channel ${channelId}`);
      });

      // Send channel message
      socket.on('send_channel_message', async (data: {
        channelId: string;
        content: string;
        senderId: string;
        senderName: string;
        messageType?: string;
      }) => {
        try {
          // Save message to database
          const message = await prisma.chatChannelMessage.create({
            data: {
              content: data.content,
              channelId: data.channelId,
              senderId: data.senderId,
              messageType: (data.messageType as any) || 'TEXT'
            },
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          });

          // Broadcast to all users in the channel
          io.to(`channel_${data.channelId}`).emit('channel_message', {
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            senderName: message.sender.name,
            channelId: message.channelId,
            createdAt: message.createdAt,
            messageType: message.messageType
          });

        } catch (error) {
          console.error('Error saving channel message:', error);
          socket.emit('message_error', { error: 'Failed to send message' });
        }
      });

      // Send direct message
      socket.on('send_direct_message', async (data: {
        content: string;
        senderId: string;
        receiverId: string;
        senderName: string;
        messageType?: string;
      }) => {
        try {
          // Save message to database
          const message = await prisma.directMessage.create({
            data: {
              content: data.content,
              senderId: data.senderId,
              receiverId: data.receiverId,
              messageType: (data.messageType as any) || 'TEXT'
            },
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              receiver: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          });

          // Send to both sender and receiver
          const messageData = {
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            receiverId: message.receiverId,
            senderName: message.sender.name,
            receiverName: message.receiver.name,
            createdAt: message.createdAt,
            messageType: message.messageType,
            isRead: false
          };

          io.to(`employee_${data.senderId}`).emit('direct_message', messageData);
          io.to(`employee_${data.receiverId}`).emit('direct_message', messageData);

        } catch (error) {
          console.error('Error saving direct message:', error);
          socket.emit('message_error', { error: 'Failed to send message' });
        }
      });

      // Mark message as read
      socket.on('mark_message_read', async (data: {
        messageId: string;
        employeeId: string;
      }) => {
        try {
          await prisma.directMessage.update({
            where: { id: data.messageId },
            data: { 
              isRead: true,
              readAt: new Date()
            }
          });

          // Notify sender that message was read
          const message = await prisma.directMessage.findUnique({
            where: { id: data.messageId },
            include: { sender: true, receiver: true }
          });

          if (message) {
            io.to(`employee_${message.senderId}`).emit('message_read', {
              messageId: data.messageId,
              readBy: data.employeeId,
              readAt: new Date()
            });
          }

        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      });

      // Real-time typing indicators
      socket.on('typing_start', (data: { channelId?: string; receiverId?: string; employeeId: string; employeeName: string }) => {
        if (data.channelId) {
          socket.to(`channel_${data.channelId}`).emit('user_typing', {
            employeeId: data.employeeId,
            employeeName: data.employeeName,
            channelId: data.channelId
          });
        } else if (data.receiverId) {
          socket.to(`employee_${data.receiverId}`).emit('user_typing', {
            employeeId: data.employeeId,
            employeeName: data.employeeName,
            receiverId: data.receiverId
          });
        }
      });

      socket.on('typing_stop', (data: { channelId?: string; receiverId?: string; employeeId: string }) => {
        if (data.channelId) {
          socket.to(`channel_${data.channelId}`).emit('user_stop_typing', {
            employeeId: data.employeeId,
            channelId: data.channelId
          });
        } else if (data.receiverId) {
          socket.to(`employee_${data.receiverId}`).emit('user_stop_typing', {
            employeeId: data.employeeId,
            receiverId: data.receiverId
          });
        }
      });

      // Online status
      socket.on('user_online', (employeeId: string) => {
        socket.broadcast.emit('user_status_change', {
          employeeId,
          status: 'online',
          timestamp: new Date()
        });
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Could emit user offline status here if we track user sessions
      });
    });

    socket.server.io = io;
  }

  res.end();
}
