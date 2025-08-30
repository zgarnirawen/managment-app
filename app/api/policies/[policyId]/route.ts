import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ policyId: string }> }
) {
  try {
    const { policyId } = await params;
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role - only admins can update policies
    const user = await prisma.employee.findUnique({
      where: { clerkUserId: userId },
      select: { role: true, name: true, id: true }
    });

    if (!user || user.role !== 'Admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { status, approvedById } = body;

    // Update policy
    const policy = await prisma.policy.update({
      where: { id: policyId },
      data: {
        status,
        approvedById: status === 'active' ? user.id : null,
        updatedAt: new Date()
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId,
        userName: user.name,
        userRole: user.role,
        action: 'update',
        resource: 'policy',
        resourceId: policy.id,
        details: `Updated policy status to: ${status}`,
        severity: status === 'active' ? 'medium' : 'low',
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Policy updated successfully' 
    });

  } catch (error) {
    console.error('Policy update error:', error);
    return NextResponse.json(
      { error: 'Failed to update policy' },
      { status: 500 }
    );
  }
}
