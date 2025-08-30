import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to convert buffer to stream
function bufferToStream(buffer: Buffer): Readable {
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  return readable;
}

// Helper function to upload buffer to Cloudinary
function uploadToCloudinary(buffer: Buffer, folder: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `employee-management/${folder}`,
        resource_type: 'auto',
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    const stream = bufferToStream(buffer);
    stream.pipe(uploadStream);
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'general';
    const taskId = formData.get('taskId') as string;
    const projectId = formData.get('projectId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, folder);

    // Prepare file metadata
    const fileMetadata = {
      url: result.secure_url,
      public_id: result.public_id,
      original_filename: file.name,
      size: file.size,
      format: result.format,
      resource_type: result.resource_type,
      created_at: new Date().toISOString(),
    };

    // If taskId or projectId is provided, update the corresponding record
    if (taskId) {
      const { prisma } = await import('../../lib/prisma');
      
      // Get current attachments
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { attachments: true }
      });

      if (task) {
        // Add new attachment to existing ones
        const updatedAttachments = [...task.attachments, result.secure_url];
        
        await prisma.task.update({
          where: { id: taskId },
          data: { attachments: updatedAttachments }
        });

        // Trigger real-time update via Pusher
        const Pusher = (await import('pusher')).default;
        const pusher = new Pusher({
          appId: process.env.PUSHER_APP_ID!,
          key: process.env.PUSHER_KEY!,
          secret: process.env.PUSHER_SECRET!,
          cluster: process.env.PUSHER_CLUSTER!,
          useTLS: true,
        });

        await pusher.trigger(`task-${taskId}`, 'attachment-added', {
          taskId,
          attachment: fileMetadata
        });
      }
    }

    if (projectId) {
      const { prisma } = await import('../../lib/prisma');
      
      // Get current attachments
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { attachments: true }
      });

      if (project) {
        // Add new attachment to existing ones
        const updatedAttachments = [...project.attachments, result.secure_url];
        
        await prisma.project.update({
          where: { id: projectId },
          data: { attachments: updatedAttachments }
        });

        // Trigger real-time update via Pusher
        const Pusher = (await import('pusher')).default;
        const pusher = new Pusher({
          appId: process.env.PUSHER_APP_ID!,
          key: process.env.PUSHER_KEY!,
          secret: process.env.PUSHER_SECRET!,
          cluster: process.env.PUSHER_CLUSTER!,
          useTLS: true,
        });

        await pusher.trigger(`project-${projectId}`, 'attachment-added', {
          projectId,
          attachment: fileMetadata
        });
      }
    }

    return NextResponse.json({
      success: true,
      file: fileMetadata
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// GET /api/uploads - Get attachments for a task or project
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const projectId = searchParams.get('projectId');

    if (!taskId && !projectId) {
      return NextResponse.json(
        { error: 'Either taskId or projectId must be provided' },
        { status: 400 }
      );
    }

    const { prisma } = await import('../../lib/prisma');

    if (taskId) {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { attachments: true }
      });

      return NextResponse.json({
        attachments: task?.attachments || []
      });
    }

    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { attachments: true }
      });

      return NextResponse.json({
        attachments: project?.attachments || []
      });
    }

    // This should not be reached due to validation above, but added for safety
    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    );

  } catch (error) {
    console.error('GET uploads error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attachments' },
      { status: 500 }
    );
  }
}
