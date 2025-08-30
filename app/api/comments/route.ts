import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { z } from 'zod';
import Pusher from 'pusher';
import { Resend } from 'resend';

// Initialize Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required'),
  taskId: z.string().optional(),
  projectId: z.string().optional(),
  authorId: z.string(),
  mentions: z.array(z.string()).optional().default([]),
});

const getCommentsSchema = z.object({
  taskId: z.string().optional(),
  projectId: z.string().optional(),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 50),
  offset: z.string().optional().transform(val => val ? parseInt(val) : 0),
});

// GET /api/comments - Fetch comments for a task or project
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams);
    
    const { taskId, projectId, limit, offset } = getCommentsSchema.parse(params);
    
    if (!taskId && !projectId) {
      return NextResponse.json(
        { error: 'Either taskId or projectId must be provided' },
        { status: 400 }
      );
    }

    const where = taskId ? { taskId } : { projectId };
    
    const comments = await prisma.comment.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        mentions: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.comment.count({ where });

    return NextResponse.json({
      comments,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('GET /api/comments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/comments - Create a new comment
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { content, taskId, projectId, authorId, mentions } = createCommentSchema.parse(data);

    if (!taskId && !projectId) {
      return NextResponse.json(
        { error: 'Either taskId or projectId must be provided' },
        { status: 400 }
      );
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content,
        taskId,
        projectId,
        authorId,
        mentions: {
          connect: mentions.map(id => ({ id }))
        }
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        mentions: {
          select: { id: true, name: true, email: true }
        },
        task: {
          select: { id: true, title: true }
        },
        project: {
          select: { id: true, name: true }
        }
      }
    });

    // Create notifications for mentions
    if (mentions.length > 0) {
      await prisma.notification.createMany({
        data: mentions.map(mentionId => ({
          title: 'You were mentioned in a comment',
          message: `${comment.author.name} mentioned you in a comment on ${taskId ? `task "${comment.task?.title}"` : `project "${comment.project?.name}"`}`,
          type: 'COMMENT_MENTION',
          employeeId: mentionId,
          isRead: false,
        }))
      });

      // Send email notifications for mentions
      for (const mention of comment.mentions) {
        try {
          await resend.emails.send({
            from: process.env.FROM_EMAIL!,
            to: mention.email,
            subject: 'You were mentioned in a comment',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>You were mentioned in a comment</h2>
                <p>Hi ${mention.name},</p>
                <p><strong>${comment.author.name}</strong> mentioned you in a comment:</p>
                <blockquote style="background: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
                  ${content}
                </blockquote>
                <p>On: ${taskId ? `Task "${comment.task?.title}"` : `Project "${comment.project?.name}"`}</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${taskId ? 'tasks' : 'projects'}?${taskId ? 'taskId' : 'projectId'}=${taskId || projectId}" 
                   style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">
                  View Comment
                </a>
              </div>
            `
          });
        } catch (emailError) {
          console.error('Failed to send mention email:', emailError);
        }
      }
    }

    // Trigger real-time update via Pusher
    const channel = taskId ? `task-${taskId}` : `project-${projectId}`;
    await pusher.trigger(channel, 'comment-added', {
      comment,
      mentions: comment.mentions
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('POST /api/comments error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
