import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role - only admins can access audit logs
    const user = await prisma.employee.findUnique({
      where: { clerkUserId: userId },
      select: { role: true, id: true, name: true }
    });

    if (!user || user.role !== 'Admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 50;
    const skip = (page - 1) * limit;

    // Filters
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const userIdFilter = searchParams.get('userId');
    const action = searchParams.get('action');
    const severity = searchParams.get('severity');
    const resource = searchParams.get('resource');
    const isExport = searchParams.get('export') === 'true';

    // Build where clause
    const where: any = {};
    
    if (dateFrom || dateTo) {
      where.timestamp = {};
      if (dateFrom) where.timestamp.gte = new Date(dateFrom);
      if (dateTo) where.timestamp.lte = new Date(dateTo + 'T23:59:59.999Z');
    }
    
    if (userIdFilter) {
      where.OR = [
        { userId: { contains: userIdFilter, mode: 'insensitive' } },
        { userName: { contains: userIdFilter, mode: 'insensitive' } }
      ];
    }
    
    if (action) where.action = { equals: action, mode: 'insensitive' };
    if (severity) where.severity = severity;
    if (resource) where.resource = { contains: resource, mode: 'insensitive' };

    // For exports, get all matching records
    if (isExport) {
      const logs = await prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: 10000 // Limit exports to 10k records
      });

      // Convert to CSV
      const headers = ['Timestamp', 'User ID', 'User Name', 'User Role', 'Action', 'Resource', 'Resource ID', 'Details', 'Severity', 'IP Address'];
      const csvContent = [
        headers.join(','),
        ...logs.map(log => [
          log.timestamp.toISOString(),
          log.userId,
          log.userName,
          log.userRole,
          log.action,
          log.resource,
          log.resourceId || '',
          `"${log.details.replace(/"/g, '""')}"`, // Escape quotes in details
          log.severity,
          log.ipAddress
        ].join(','))
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    // Regular paginated query
    const [logs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip
      }),
      prisma.auditLog.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Audit logs API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, resource, resourceId, details, severity = 'low' } = body;

    // Get user details
    const user = await prisma.employee.findUnique({
      where: { clerkUserId: userId },
      select: { name: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get IP address and user agent
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create audit log entry
    const auditLog = await prisma.auditLog.create({
      data: {
        userId,
        userName: user.name,
        userRole: user.role,
        action,
        resource,
        resourceId,
        details,
        severity,
        ipAddress,
        userAgent,
        timestamp: new Date()
      }
    });

    return NextResponse.json({ success: true, logId: auditLog.id });

  } catch (error) {
    console.error('Audit log creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create audit log' },
      { status: 500 }
    );
  }
}
