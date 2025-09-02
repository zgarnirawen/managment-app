import { Server as NetServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import { Server as ServerIO } from 'socket.io'

export const config = {
  api: {
    bodyParser: false,
  },
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponse & { socket: { server: NetServer & { io?: ServerIO } } }) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new ServerIO(res.socket.server)
    res.socket.server.io = io

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id)

      // Join user to their specific room (for targeted notifications)
      socket.on('join', (userId: string) => {
        socket.join(`user_${userId}`)
        console.log(`User ${userId} joined their room`)
      })

      // Join user to role-based rooms
      socket.on('join-role', (role: string) => {
        socket.join(`role_${role}`)
        console.log(`User joined role room: ${role}`)
      })

      // Join user to department rooms
      socket.on('join-department', (department: string) => {
        socket.join(`dept_${department}`)
        console.log(`User joined department room: ${department}`)
      })

      // Handle sending notifications
      socket.on('send-notification', (data) => {
        const { target, type, notification } = data
        
        switch (target.type) {
          case 'user':
            io.to(`user_${target.id}`).emit('notification', notification)
            break
          case 'role':
            io.to(`role_${target.id}`).emit('notification', notification)
            break
          case 'department':
            io.to(`dept_${target.id}`).emit('notification', notification)
            break
          case 'all':
            io.emit('notification', notification)
            break
        }
      })

      // Handle real-time updates for different features
      socket.on('task-update', (data) => {
        socket.broadcast.emit('task-updated', data)
      })

      socket.on('leave-request', (data) => {
        // Notify managers/HR about new leave requests
        io.to('role_manager').emit('leave-request-submitted', data)
        io.to('role_admin').emit('leave-request-submitted', data)
      })

      socket.on('meeting-reminder', (data) => {
        // Send meeting reminders to all participants
        data.participants.forEach((userId: string) => {
          io.to(`user_${userId}`).emit('meeting-reminder', data)
        })
      })

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
      })
    })
  }
  res.end()
}

export default SocketHandler
