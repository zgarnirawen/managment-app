import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Récupérer les messages d'un canal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const { channelId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const messages = await prisma.chatChannelMessage.findMany({
      where: {
        channelId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        reactions: {
          include: {
            employee: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      take: limit,
      skip: offset
    });

    const formattedMessages = messages.map(message => ({
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderName: message.sender.name,
      channelId: message.channelId,
      messageType: message.messageType,
      attachments: message.attachments,
      isEdited: message.isEdited,
      editedAt: message.editedAt,
      createdAt: message.createdAt,
      replyTo: message.replyTo ? {
        id: message.replyTo.id,
        content: message.replyTo.content,
        senderName: message.replyTo.sender.name
      } : null,
      reactions: message.reactions.reduce((acc, reaction) => {
        if (!acc[reaction.emoji]) {
          acc[reaction.emoji] = [];
        }
        acc[reaction.emoji].push({
          employeeId: reaction.employeeId,
          employeeName: reaction.employee.name
        });
        return acc;
      }, {} as Record<string, Array<{ employeeId: string; employeeName: string }>>)
    }));

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error('Error fetching channel messages:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des messages' },
      { status: 500 }
    );
  }
}

// POST - Envoyer un message dans un canal
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const { channelId } = await params;
    const body = await request.json();
    const { content, senderId, messageType, replyToId, attachments } = body;

    if (!content || !senderId) {
      return NextResponse.json(
        { message: 'Contenu et expéditeur requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'employé existe
    const employee = await prisma.employee.findUnique({
      where: { id: senderId }
    });

    if (!employee) {
      return NextResponse.json(
        { message: 'Employé non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que le canal existe
    const channel = await prisma.chatChannel.findUnique({
      where: { id: channelId }
    });

    if (!channel) {
      return NextResponse.json(
        { message: 'Canal non trouvé' },
        { status: 404 }
      );
    }

    // Créer le message
    const message = await prisma.chatChannelMessage.create({
      data: {
        content,
        channelId,
        senderId,
        messageType: messageType || 'TEXT',
        replyToId,
        attachments: attachments || []
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    const formattedMessage = {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderName: message.sender.name,
      channelId: message.channelId,
      messageType: message.messageType,
      attachments: message.attachments,
      createdAt: message.createdAt,
      replyTo: message.replyTo ? {
        id: message.replyTo.id,
        content: message.replyTo.content,
        senderName: message.replyTo.sender.name
      } : null
    };

    return NextResponse.json(formattedMessage, { status: 201 });
  } catch (error) {
    console.error('Error creating channel message:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}
