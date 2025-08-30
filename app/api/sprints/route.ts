import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createSprintSchema = z.object({
  name: z.string().min(1, 'Sprint name is required'),
  startDate: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    'Invalid start date'
  ),
  endDate: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    'Invalid end date'
  ),
}).refine(
  (data) => new Date(data.startDate) < new Date(data.endDate),
  {
    message: 'End date must be after start date',
    path: ['endDate']
  }
);

const updateSprintSchema = z.object({
  name: z.string().min(1, 'Sprint name is required').optional(),
  startDate: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    'Invalid start date'
  ).optional(),
  endDate: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    'Invalid end date'
  ).optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) < new Date(data.endDate);
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate']
  }
);

// GET - List all sprints
export async function GET() {
  try {
    // For now, using raw SQL until Prisma client recognizes Sprint model
    const sprints = await prisma.$queryRaw`
      SELECT s.*, 
             COUNT(t.id)::int as task_count
      FROM "Sprint" s
      LEFT JOIN "Task" t ON s.id = t."sprintId"
      GROUP BY s.id
      ORDER BY s."createdAt" DESC
    `;

    return NextResponse.json(sprints);
  } catch (error) {
    console.error('Error fetching sprints:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sprints' },
      { status: 500 }
    );
  }
}

// POST - Create a new sprint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validatedData = createSprintSchema.parse(body);

    const sprint = await prisma.$queryRaw`
      INSERT INTO "Sprint" (id, name, "startDate", "endDate", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${validatedData.name}, ${new Date(validatedData.startDate)}, ${new Date(validatedData.endDate)}, NOW(), NOW())
      RETURNING *
    `;

    return NextResponse.json(sprint, { status: 201 });
  } catch (error) {
    console.error('Error creating sprint:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create sprint' },
      { status: 500 }
    );
  }
}

// PUT - Update a sprint
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const sprintId = url.searchParams.get('id');
    
    if (!sprintId) {
      return NextResponse.json(
        { error: 'Sprint ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateSprintSchema.parse(body);

    // Check if sprint exists
    const existingSprint = await prisma.$queryRaw`
      SELECT * FROM "Sprint" WHERE id = ${sprintId}
    `;

    if (!Array.isArray(existingSprint) || existingSprint.length === 0) {
      return NextResponse.json(
        { error: 'Sprint not found' },
        { status: 404 }
      );
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    
    if (validatedData.name) {
      updates.push(`name = $${updates.length + 1}`);
      values.push(validatedData.name);
    }
    if (validatedData.startDate) {
      updates.push(`"startDate" = $${updates.length + 1}`);
      values.push(new Date(validatedData.startDate));
    }
    if (validatedData.endDate) {
      updates.push(`"endDate" = $${updates.length + 1}`);
      values.push(new Date(validatedData.endDate));
    }
    
    updates.push(`"updatedAt" = NOW()`);

    if (updates.length === 1) { // Only updatedAt
      return NextResponse.json(existingSprint[0]);
    }

    const updateQuery = `UPDATE "Sprint" SET ${updates.join(', ')} WHERE id = $${values.length + 1} RETURNING *`;
    values.push(sprintId);

    const result = await prisma.$queryRawUnsafe(updateQuery, ...values);
    
    return NextResponse.json(Array.isArray(result) ? result[0] : result);
  } catch (error) {
    console.error('Error updating sprint:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update sprint' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a sprint
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const sprintId = url.searchParams.get('id');
    
    if (!sprintId) {
      return NextResponse.json(
        { error: 'Sprint ID is required' },
        { status: 400 }
      );
    }

    // Check if sprint exists
    const existingSprint = await prisma.$queryRaw`
      SELECT * FROM "Sprint" WHERE id = ${sprintId}
    `;

    if (!Array.isArray(existingSprint) || existingSprint.length === 0) {
      return NextResponse.json(
        { error: 'Sprint not found' },
        { status: 404 }
      );
    }

    // Unassign all tasks from the sprint before deleting
    await prisma.$queryRaw`
      UPDATE "Task" SET "sprintId" = NULL WHERE "sprintId" = ${sprintId}
    `;

    // Delete the sprint
    await prisma.$queryRaw`
      DELETE FROM "Sprint" WHERE id = ${sprintId}
    `;

    return NextResponse.json(
      { message: 'Sprint deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting sprint:', error);
    return NextResponse.json(
      { error: 'Failed to delete sprint' },
      { status: 500 }
    );
  }
}
