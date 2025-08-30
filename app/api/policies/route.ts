import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role - only admins can manage policies
    const user = await prisma.employee.findUnique({
      where: { clerkUserId: userId },
      select: { role: true, name: true, id: true }
    });

    if (!user || user.role !== 'Admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get all policies
    const policies = await prisma.policy.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        createdByEmployee: {
          select: { name: true }
        },
        approvedByEmployee: {
          select: { name: true }
        }
      }
    });

    // Format policies data
    const formattedPolicies = policies.map(policy => ({
      id: policy.id,
      title: policy.title,
      category: policy.category,
      description: policy.description,
      content: policy.content,
      version: policy.version,
      status: policy.status,
      createdAt: policy.createdAt.toISOString(),
      updatedAt: policy.updatedAt.toISOString(),
      createdBy: policy.createdByEmployee?.name || 'Unknown',
      effectiveDate: policy.effectiveDate.toISOString(),
      expiryDate: policy.expiryDate?.toISOString(),
      approvedBy: policy.approvedByEmployee?.name,
      tags: policy.tags || []
    }));

    return NextResponse.json({ policies: formattedPolicies });

  } catch (error) {
    console.error('Policies fetch error:', error);
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

    // Get user role - only admins can create policies
    const user = await prisma.employee.findUnique({
      where: { clerkUserId: userId },
      select: { role: true, name: true, id: true }
    });

    if (!user || user.role !== 'Admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      title, 
      category, 
      description, 
      content, 
      version = '1.0',
      effectiveDate,
      expiryDate,
      tags = []
    } = body;

    // Create new policy
    const policy = await prisma.policy.create({
      data: {
        title,
        category,
        description,
        content,
        version,
        status: 'draft',
        effectiveDate: new Date(effectiveDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        tags,
        createdById: user.id
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId,
        userName: user.name,
        userRole: user.role,
        action: 'create',
        resource: 'policy',
        resourceId: policy.id,
        details: `Created policy: ${title} (${category})`,
        severity: 'medium',
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Policy created successfully',
      policyId: policy.id 
    });

  } catch (error) {
    console.error('Policy creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create policy' },
      { status: 500 }
    );
  }
}
