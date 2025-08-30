import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Récupérer toutes les demandes de congés
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');

    let whereClause: any = {};
    
    if (employeeId) {
      whereClause.employeeId = employeeId;
    }
    
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(leaveRequests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des demandes de congé' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle demande de congé
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, startDate, endDate, reason } = body;

    // Validation des données
    if (!type || !startDate || !endDate) {
      return NextResponse.json(
        { message: 'Type, date de début et date de fin sont requis' },
        { status: 400 }
      );
    }

    // Vérifier que la date de fin est après la date de début
    if (new Date(startDate) > new Date(endDate)) {
      return NextResponse.json(
        { message: 'La date de fin doit être après la date de début' },
        { status: 400 }
      );
    }

    // Récupérer l'ID de l'employé connecté (simplification)
    const userEmail = request.headers.get('x-user-email') || 'user@example.com';
    
    // Trouver l'employé par email
    let employee = await prisma.employee.findUnique({
      where: { email: userEmail }
    });

    // Si l'employé n'existe pas, créer un rôle et département par défaut d'abord
    if (!employee) {
      // Vérifier si le rôle existe
      let employeeRole = await prisma.role.findFirst({
        where: { name: 'EMPLOYEE' }
      });

      if (!employeeRole) {
        employeeRole = await prisma.role.create({
          data: {
            name: 'EMPLOYEE'
          }
        });
      }

      // Vérifier si le département existe
      let generalDept = await prisma.department.findFirst({
        where: { name: 'General' }
      });

      if (!generalDept) {
        generalDept = await prisma.department.create({
          data: {
            name: 'General',
            description: 'General department'
          }
        });
      }

      employee = await prisma.employee.create({
        data: {
          name: 'Utilisateur Test',
          email: userEmail,
          role: 'Employee',
          departmentId: generalDept.id
        }
      });
    }

    // Vérifier les conflits de dates pour le même employé
    const conflictingRequest = await prisma.leaveRequest.findFirst({
      where: {
        employeeId: employee.id,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          {
            AND: [
              { startDate: { lte: new Date(endDate) } },
              { endDate: { gte: new Date(startDate) } }
            ]
          }
        ]
      }
    });

    if (conflictingRequest) {
      return NextResponse.json(
        { message: 'Vous avez déjà une demande de congé sur cette période' },
        { status: 400 }
      );
    }

    // Créer la demande de congé
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: 'PENDING',
        employeeId: employee.id
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(leaveRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating leave request:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création de la demande de congé' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une demande de congé (pour approbation/rejet)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, rejectionReason } = body;

    if (!id || !status) {
      return NextResponse.json(
        { message: 'ID et statut sont requis' },
        { status: 400 }
      );
    }

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { message: 'Statut invalide' },
        { status: 400 }
      );
    }

    if (status === 'REJECTED' && !rejectionReason) {
      return NextResponse.json(
        { message: 'Un motif de rejet est requis' },
        { status: 400 }
      );
    }

    const updateData: any = {
      status
    };

    if (status === 'REJECTED' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const updatedRequest = await prisma.leaveRequest.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error updating leave request:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour de la demande de congé' },
      { status: 500 }
    );
  }
}
