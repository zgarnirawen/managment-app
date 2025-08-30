import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createResourceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['PDF', 'DOC', 'LINK', 'VIDEO', 'IMAGE', 'SPREADSHEET', 'PRESENTATION', 'ARCHIVE', 'OTHER']),
  url: z.string().url('Invalid URL'),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  departmentId: z.string().optional(),
  uploadedBy: z.string(),
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(true),
});

const updateResourceSchema = createResourceSchema.partial().omit({ uploadedBy: true });

// GET /api/resources - List resources
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const departmentId = url.searchParams.get('departmentId');
    const tags = url.searchParams.get('tags');
    const onlyPublic = url.searchParams.get('onlyPublic') === 'true';

    let where: any = {};

    if (type) {
      where.type = type;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (onlyPublic) {
      where.isPublic = true;
    }

    if (tags) {
      const tagArray = tags.split(',');
      where.tags = {
        hasSome: tagArray
      };
    }

    const resources = await prisma.resource.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            name: true,
          }
        },
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/resources - Create new resource
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createResourceSchema.parse(body);

    // If resource is department-specific, verify department exists
    if (validatedData.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: validatedData.departmentId }
      });

      if (!department) {
        return NextResponse.json({ error: 'Department not found' }, { status: 404 });
      }
    }

    // Create resource
    const resource = await prisma.resource.create({
      data: validatedData,
      include: {
        department: {
          select: {
            id: true,
            name: true,
          }
        },
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating resource:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/resources - Update resource
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }

    const validatedData = updateResourceSchema.parse(updateData);

    // Check if resource exists
    const existingResource = await prisma.resource.findUnique({
      where: { id }
    });

    if (!existingResource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Update resource
    const updatedResource = await prisma.resource.update({
      where: { id },
      data: validatedData,
      include: {
        department: {
          select: {
            id: true,
            name: true,
          }
        },
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json(updatedResource);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating resource:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/resources - Delete resource
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const resourceId = url.searchParams.get('id');

    if (!resourceId) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }

    // Check if resource exists
    const existingResource = await prisma.resource.findUnique({
      where: { id: resourceId }
    });

    if (!existingResource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Delete resource
    await prisma.resource.delete({
      where: { id: resourceId }
    });

    return NextResponse.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/resources - Increment download count
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, action } = body;

    if (!id || action !== 'download') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Increment download count
    const updatedResource = await prisma.resource.update({
      where: { id },
      data: {
        downloadCount: {
          increment: 1
        }
      }
    });

    return NextResponse.json({ downloadCount: updatedResource.downloadCount });
  } catch (error) {
    console.error('Error updating resource download count:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
