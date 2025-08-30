import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { createTimeEntrySchema } from '../../lib/validations';
import { ZodError } from 'zod';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const date = searchParams.get('date');
    const approved = searchParams.get('approved');
    
    const whereClause: {
      employeeId?: string;
      startTime?: { gte: Date; lt: Date };
      approved?: boolean;
    } = {};
    
    if (employeeId) {
      whereClause.employeeId = employeeId;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      whereClause.startTime = {
        gte: startDate,
        lt: endDate,
      };
    }
    
    if (approved !== null && approved !== undefined) {
      whereClause.approved = approved === 'true';
    }
    
    const timeEntries = await prisma.timeEntry.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(timeEntries);
  } catch (error) {
    console.error('GET /api/time-entries error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate the incoming data
    const validatedData = createTimeEntrySchema.parse(data);
    
    // Check if employee exists
    const employeeExists = await prisma.employee.findUnique({
      where: { id: validatedData.employeeId },
    });
    
    if (!employeeExists) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }
    
    // Get the last time entry for validation
    const lastEntry = await prisma.timeEntry.findFirst({
      where: { employeeId: validatedData.employeeId },
      orderBy: { createdAt: 'desc' },
    });
    
    // Validate time entry sequence
    if (lastEntry) {
      const isValidSequence = validateTimeEntrySequence(lastEntry.type, validatedData.type);
      if (!isValidSequence) {
        return NextResponse.json(
          { error: `Invalid time entry sequence. Cannot ${validatedData.type} after ${lastEntry.type}` },
          { status: 400 }
        );
      }
    } else if (validatedData.type !== 'CLOCK_IN') {
      return NextResponse.json(
        { error: 'First time entry must be CLOCK_IN' },
        { status: 400 }
      );
    }
    
    const timeEntry = await prisma.timeEntry.create({
      data: validatedData,
      include: { 
        employee: { 
          select: { 
            id: true,
            name: true, 
            email: true 
          } 
        }
      },
    });
    
    return NextResponse.json(timeEntry, { status: 201 });
  } catch (error) {
    console.error('POST /api/time-entries error:', error);
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.issues 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create time entry' }, 
      { status: 500 }
    );
  }
}

// Helper function to validate time entry sequence
function validateTimeEntrySequence(lastType: string, newType: string): boolean {
  const validTransitions: Record<string, string[]> = {
    'CLOCK_IN': ['BREAK_START', 'CLOCK_OUT'],
    'BREAK_START': ['BREAK_END'],
    'BREAK_END': ['BREAK_START', 'CLOCK_OUT'],
    'CLOCK_OUT': ['CLOCK_IN'],
  };
  
  return validTransitions[lastType]?.includes(newType) || false;
}
