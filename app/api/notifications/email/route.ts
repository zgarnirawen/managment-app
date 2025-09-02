import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Configure NodeMailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'your-email@company.com',
    pass: process.env.SMTP_PASSWORD || 'your-app-password'
  }
})

// Email templates
const templates = {
  default: {
    subject: (subject: string) => subject,
    html: (message: string, data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; margin-bottom: 20px;">Notification from Employee Management System</h2>
          <div style="background: white; padding: 20px; border-radius: 4px; border-left: 4px solid #3b82f6;">
            <p style="color: #555; line-height: 1.6; margin: 0;">${message}</p>
          </div>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
            <p>This is an automated notification from the Employee Management System.</p>
            <p>Please do not reply to this email.</p>
          </div>
        </div>
      </div>
    `
  },
  task_assignment: {
    subject: (subject: string) => `[Task Assignment] ${subject}`,
    html: (message: string, data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; margin-bottom: 20px;">🎯 New Task Assignment</h2>
          <div style="background: white; padding: 20px; border-radius: 4px; border-left: 4px solid #10b981;">
            <h3 style="color: #10b981; margin-top: 0;">Task Details</h3>
            <p style="color: #555; line-height: 1.6;">${message}</p>
            <div style="margin-top: 15px; padding: 15px; background: #f0fdf4; border-radius: 4px;">
              <p style="margin: 0; color: #15803d;"><strong>Priority:</strong> ${data.priority || 'Medium'}</p>
            </div>
          </div>
          <div style="margin-top: 20px; text-align: center;">
            <a href="#" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              View Task Details
            </a>
          </div>
        </div>
      </div>
    `
  },
  sprint_update: {
    subject: (subject: string) => `[Sprint Update] ${subject}`,
    html: (message: string, data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; margin-bottom: 20px;">🚀 Sprint Update</h2>
          <div style="background: white; padding: 20px; border-radius: 4px; border-left: 4px solid #3b82f6;">
            <h3 style="color: #3b82f6; margin-top: 0;">Sprint Information</h3>
            <p style="color: #555; line-height: 1.6;">${message}</p>
          </div>
          <div style="margin-top: 20px; text-align: center;">
            <a href="#" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              View Sprint Board
            </a>
          </div>
        </div>
      </div>
    `
  },
  meeting_reminder: {
    subject: (subject: string) => `[Meeting Reminder] ${subject}`,
    html: (message: string, data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; margin-bottom: 20px;">📅 Meeting Reminder</h2>
          <div style="background: white; padding: 20px; border-radius: 4px; border-left: 4px solid #f59e0b;">
            <h3 style="color: #f59e0b; margin-top: 0;">Meeting Details</h3>
            <p style="color: #555; line-height: 1.6;">${message}</p>
          </div>
          <div style="margin-top: 20px; text-align: center;">
            <a href="#" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Join Meeting
            </a>
          </div>
        </div>
      </div>
    `
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, cc = [], subject, message, priority = 'medium', template = 'default' } = body

    // Validate required fields
    if (!to || !Array.isArray(to) || to.length === 0) {
      return NextResponse.json(
        { error: 'Recipients (to) are required' },
        { status: 400 }
      )
    }

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      )
    }

    // Get template
    const emailTemplate = templates[template as keyof typeof templates] || templates.default

    // Prepare email options
    const mailOptions = {
      from: process.env.SMTP_USER || 'noreply@company.com',
      to: to.join(', '),
      cc: cc.length > 0 ? cc.join(', ') : undefined,
      subject: emailTemplate.subject(subject),
      html: emailTemplate.html(message, { priority }),
      priority: (priority === 'urgent' ? 'high' : priority === 'low' ? 'low' : 'normal') as 'high' | 'low' | 'normal'
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)

    console.log('Email sent successfully:', info)

    // Log notification to database (in real app)
    // await logNotification({
    //   type: 'email',
    //   recipients: to,
    //   subject,
    //   message,
    //   priority,
    //   template,
    //   messageId: info.messageId,
    //   sentAt: new Date()
    // })

    return NextResponse.json({
      success: true,
      messageId: 'email-sent',
      message: 'Email notification sent successfully'
    })

  } catch (error) {
    console.error('Failed to send email notification:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to send email notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve notification history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type')

    // In a real app, this would query the database
    const mockNotificationHistory = [
      {
        id: 1,
        type: 'email',
        recipients: ['user@company.com'],
        subject: 'Task Assignment Notification',
        sentAt: '2024-12-16T10:30:00',
        status: 'delivered',
        messageId: 'msg-12345'
      },
      {
        id: 2,
        type: 'email',
        recipients: ['team@company.com'],
        subject: 'Sprint Update',
        sentAt: '2024-12-16T09:15:00',
        status: 'delivered',
        messageId: 'msg-12346'
      }
    ]

    let filteredHistory = mockNotificationHistory
    if (type) {
      filteredHistory = mockNotificationHistory.filter(n => n.type === type)
    }

    const paginatedHistory = filteredHistory.slice(offset, offset + limit)

    return NextResponse.json({
      notifications: paginatedHistory,
      total: filteredHistory.length,
      hasMore: offset + limit < filteredHistory.length
    })

  } catch (error) {
    console.error('Failed to retrieve notification history:', error)
    
    return NextResponse.json(
      { error: 'Failed to retrieve notification history' },
      { status: 500 }
    )
  }
}
