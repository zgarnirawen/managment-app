import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params;
    const body = await request.json();
    const { emoji, action } = body;

    if (!emoji || !action) {
      return NextResponse.json(
        { error: 'Emoji and action are required' },
        { status: 400 }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const currentEmployee = await prisma.employee.findUnique({
      where: { clerkUserId: userId }
    });

    if (!currentEmployee) {
      return NextResponse.json(
        { error: 'Employee profile required' },
        { status: 401 }
      );
    }

    // TODO: Implement reaction logic here
    return NextResponse.json(
      { success: true, message: 'Reaction managed successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error managing reaction:', error);
    return NextResponse.json(
      { error: 'Failed to manage reaction' },
      { status: 500 }
    );
  }
}
