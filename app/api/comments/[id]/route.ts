import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { z } from 'zod';
import Pusher from 'pusher';

// Initialize Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required'),
});

// GET /api/comments/[id] - Get a specific comment
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const comment = await prisma.comment.findUnique({
      where: { id },
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
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(comment);
  } catch (error) {
    console.error('GET /api/comments/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comment' },
      { status: 500 }
    );
  }
}

// PUT /api/comments/[id] - Update a comment
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const { content } = updateCommentSchema.parse(data);
    
    // Check if comment exists and get current state
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: {
        task: { select: { id: true } },
        project: { select: { id: true } }
      }
    });
    
    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }
    
    // Update the comment
    const comment = await prisma.comment.update({
      where: { id },
      data: { content },
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
    
    // Trigger real-time update via Pusher
    const channel = existingComment.taskId ? `task-${existingComment.taskId}` : `project-${existingComment.projectId}`;
    await pusher.trigger(channel, 'comment-updated', { comment });
    
    return NextResponse.json(comment);
  } catch (error) {
    console.error('PUT /api/comments/[id] error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

// DELETE /api/comments/[id] - Delete a comment
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Check if comment exists and get current state
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: {
        task: { select: { id: true } },
        project: { select: { id: true } }
      }
    });
    
    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }
    
    // Delete the comment
    await prisma.comment.delete({
      where: { id }
    });
    
    // Trigger real-time update via Pusher
    const channel = existingComment.taskId ? `task-${existingComment.taskId}` : `project-${existingComment.projectId}`;
    await pusher.trigger(channel, 'comment-deleted', { commentId: id });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/comments/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
