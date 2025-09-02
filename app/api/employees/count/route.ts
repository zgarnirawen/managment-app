import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Simple count query that doesn't require authentication
    // This is used for first-user detection during setup
    const count = await prisma.employee.count();
    
    return NextResponse.json({ 
      count,
      isFirstUser: count === 0 
    });
  } catch (error) {
    console.error('Error counting employees:', error);
    return NextResponse.json(
      { error: 'Failed to count employees', count: 0, isFirstUser: false },
      { status: 500 }
    );
  }
}
