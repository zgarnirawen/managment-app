import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  target: z.enum(['ALL', 'INTERNS', 'EMPLOYEES', 'DEPARTMENT', 'MANAGERS']).default('ALL'),
  departmentId: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  expiresAt: z.string().transform((date) => new Date(date)).optional(),
  createdBy: z.string(),
});

const updateAnnouncementSchema = createAnnouncementSchema.partial();

// GET /api/announcements - List announcements
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const target = url.searchParams.get('target');
    const departmentId = url.searchParams.get('departmentId');
    const onlyActive = url.searchParams.get('onlyActive') === 'true';

    let where: any = {};

    if (target) {
      where.target = target;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (onlyActive) {
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ];
    }

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/announcements - Create new announcement
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createAnnouncementSchema.parse(body);

    // If targeting department, verify department exists
    if (validatedData.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: validatedData.departmentId }
      });

      if (!department) {
        return NextResponse.json({ error: 'Department not found' }, { status: 404 });
      }
    }

    // Create announcement
    const announcement = await prisma.announcement.create({
      data: validatedData,
      include: {
        department: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    // TODO: Send real-time notifications via Pusher based on target
    // await sendAnnouncementNotification(announcement);

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/announcements - Update announcement
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
    }

    const validatedData = updateAnnouncementSchema.parse(updateData);

    // Check if announcement exists
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id }
    });

    if (!existingAnnouncement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    // Update announcement
    const updatedAnnouncement = await prisma.announcement.update({
      where: { id },
      data: validatedData,
      include: {
        department: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    return NextResponse.json(updatedAnnouncement);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating announcement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/announcements - Delete announcement
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const announcementId = url.searchParams.get('id');

    if (!announcementId) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
    }

    // Check if announcement exists
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id: announcementId }
    });

    if (!existingAnnouncement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    // Delete announcement
    await prisma.announcement.delete({
      where: { id: announcementId }
    });

    return NextResponse.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
