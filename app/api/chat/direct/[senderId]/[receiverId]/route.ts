import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Récupérer les messages directs entre deux employés
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ senderId: string; receiverId: string }> }
) {
  try {
    const { senderId, receiverId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: senderId, receiverId: receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        receiver: {
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
      receiverId: message.receiverId,
      receiverName: message.receiver.name,
      messageType: message.messageType,
      attachments: message.attachments,
      isEdited: message.isEdited,
      editedAt: message.editedAt,
      isRead: message.isRead,
      readAt: message.readAt,
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
    console.error('Error fetching direct messages:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des messages' },
      { status: 500 }
    );
  }
}

// POST - Envoyer un message direct
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ senderId: string; receiverId: string }> }
) {
  try {
    const { senderId, receiverId } = await params;
    const body = await request.json();
    const { content, messageType, replyToId, attachments } = body;

    if (!content) {
      return NextResponse.json(
        { message: 'Contenu requis' },
        { status: 400 }
      );
    }

    // Vérifier que les employés existent
    const [sender, receiver] = await Promise.all([
      prisma.employee.findUnique({ where: { id: senderId } }),
      prisma.employee.findUnique({ where: { id: receiverId } })
    ]);

    if (!sender || !receiver) {
      return NextResponse.json(
        { message: 'Expéditeur ou destinataire non trouvé' },
        { status: 404 }
      );
    }

    // Créer le message
    const message = await prisma.directMessage.create({
      data: {
        content,
        senderId,
        receiverId,
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
        receiver: {
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
      receiverId: message.receiverId,
      receiverName: message.receiver.name,
      messageType: message.messageType,
      attachments: message.attachments,
      isRead: message.isRead,
      createdAt: message.createdAt,
      replyTo: message.replyTo ? {
        id: message.replyTo.id,
        content: message.replyTo.content,
        senderName: message.replyTo.sender.name
      } : null
    };

    return NextResponse.json(formattedMessage, { status: 201 });
  } catch (error) {
    console.error('Error creating direct message:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}
