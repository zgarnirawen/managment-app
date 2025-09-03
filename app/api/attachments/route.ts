import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { nanoid } from 'nanoid';

const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get employee by clerk user ID
    const employee = await prisma.employee.findUnique({
      where: { clerkUserId: userId }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee profile required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const projectId = searchParams.get('projectId');

    let where: any = {};
    
    if (taskId) where.taskId = taskId;
    if (projectId) where.projectId = projectId;

    const attachments = await prisma.attachment.findMany({
      where,
      include: {
        uploader: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
        project: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(attachments);
  } catch (error) {
    console.error('GET /api/attachments error:', error);
    return NextResponse.json({ error: 'Failed to fetch attachments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get employee by clerk user ID
    const employee = await prisma.employee.findUnique({
      where: { clerkUserId: userId }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee profile required' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const entityType = formData.get('entityType') as string; // 'TASK' or 'PROJECT'
    const entityId = formData.get('entityId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!entityType || !entityId) {
      return NextResponse.json({ error: 'Entity type and ID required' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Allowed types: Images, PDF, Word, Excel, PowerPoint, Text files' 
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 10MB' 
      }, { status: 400 });
    }

    // Check if entity exists and user has access
    if (entityType === 'TASK') {
      const task = await prisma.task.findFirst({
        where: {
          id: entityId,
          OR: [
            { employeeId: employee.id },
            { project: { employees: { some: { id: employee.id } } } }
          ]
        }
      });

      if (!task) {
        return NextResponse.json({ error: 'Task not found or access denied' }, { status: 404 });
      }
    } else if (entityType === 'PROJECT') {
      const project = await prisma.project.findFirst({
        where: {
          id: entityId,
          employees: { some: { id: employee.id } }
        }
      });

      if (!project) {
        return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
      }
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = `${nanoid()}.${fileExtension}`;
    const filePath = join(uploadsDir, uniqueFilename);

    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Save file info to database
    const attachmentData: any = {
      fileName: file.name,
      fileUrl: `/uploads/${uniqueFilename}`,
      fileSize: file.size,
      fileType: file.type,
      uploadedBy: employee.id
    };

    if (entityType === 'TASK') {
      attachmentData.taskId = entityId;
    } else if (entityType === 'PROJECT') {
      attachmentData.projectId = entityId;
    }

    const attachment = await prisma.attachment.create({
      data: attachmentData,
      include: {
        uploader: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
        project: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error('POST /api/attachments error:', error);
    return NextResponse.json({ error: 'Failed to upload attachment' }, { status: 500 });
  }
}
