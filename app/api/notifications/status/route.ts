import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // Get notification statistics
    const [
      totalNotifications,
      unreadNotifications,
      todayNotifications,
      weekNotifications,
      monthNotifications,
      notificationsByType
    ] = await Promise.all([
      // Total notifications
      prisma.notification.count({
        where: { employeeId }
      }),
      
      // Unread notifications
      prisma.notification.count({
        where: { employeeId, read: false }
      }),
      
      // Today's notifications
      prisma.notification.count({
        where: {
          employeeId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // This week's notifications
      prisma.notification.count({
        where: {
          employeeId,
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7))
          }
        }
      }),
      
      // This month's notifications
      prisma.notification.count({
        where: {
          employeeId,
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30))
          }
        }
      }),
      
      // Notifications by type
      prisma.notification.groupBy({
        by: ['type'],
        where: {
          employeeId,
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30))
          }
        },
        _count: {
          type: true
        }
      })
    ]);

    // Calculate response rate (notifications that were read)
    const readNotifications = await prisma.notification.count({
      where: { employeeId, read: true }
    });
    
    const responseRate = totalNotifications > 0 
      ? Math.round((readNotifications / totalNotifications) * 100)
      : 0;

    // Format notification types
    const typeBreakdown = notificationsByType.map(item => ({
      type: item.type.replace('_', ' ').toLowerCase(),
      count: item._count.type
    }));

    return NextResponse.json({
      summary: {
        total: totalNotifications,
        unread: unreadNotifications,
        responseRate,
        today: todayNotifications,
        thisWeek: weekNotifications,
        thisMonth: monthNotifications,
      },
      typeBreakdown,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('GET /api/notifications/status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification status' },
      { status: 500 }
    );
  }
}
