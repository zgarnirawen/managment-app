import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { createNotification, NotificationData } from '../../services/notificationService';
import nodemailer from 'nodemailer';

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const where: { employeeId: string; read?: boolean } = { employeeId };
    if (unreadOnly) {
      where.read = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        employeeId,
        read: false,
      }
    });

    return NextResponse.json({
      notifications,
      unreadCount,
      total: notifications.length,
    });
  } catch (error) {
    console.error('GET /api/notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data: NotificationData & { sendEmail?: boolean, emailSubject?: string } = await request.json();
    
    // Validate required fields
    if (!data.employeeId || !data.message || !data.type) {
      return NextResponse.json(
        { error: 'Employee ID, message, and type are required' },
        { status: 400 }
      );
    }

    const notification = await createNotification(data);
    
    // Send email if requested
    if (data.sendEmail) {
      await sendEmailNotification(data);
    }
    
    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('POST /api/notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

async function sendEmailNotification(data: any) {
  try {
    // Get employee email
    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId },
      select: { email: true, name: true }
    });

    if (!employee?.email) {
      console.warn('No email found for employee:', data.employeeId);
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@company.com',
      to: employee.email,
      subject: data.emailSubject || 'New Notification',
      html: generateEmailTemplate(data.message, employee.name, data)
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', employee.email);
  } catch (error) {
    console.error('Email sending error:', error);
  }
}

function generateEmailTemplate(message: string, employeeName: string, data?: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Notification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ZGARNI Employee Management</h1>
        </div>
        <div class="content">
          <p>Hello ${employeeName},</p>
          ${message}
        </div>
        <div class="footer">
          <p>This is an automated message from ZGARNI Employee Management System.</p>
          <p>Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
