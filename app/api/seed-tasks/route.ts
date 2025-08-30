import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function POST() {
  try {
    // Create some sample tasks for testing
    const sampleTasks = [
      {
        title: 'Setup Authentication',
        description: 'Implement user authentication using Clerk',
        status: 'TODO',
        priority: 'HIGH',
      },
      {
        title: 'Design Database Schema',
        description: 'Create comprehensive database schema for employee management',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
      },
      {
        title: 'Create Dashboard UI',
        description: 'Build responsive dashboard interface',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
      },
      {
        title: 'Setup CI/CD Pipeline',
        description: 'Configure continuous integration and deployment',
        status: 'TODO',
        priority: 'LOW',
      },
      {
        title: 'Write Unit Tests',
        description: 'Add comprehensive unit test coverage',
        status: 'DONE',
        priority: 'MEDIUM',
      }
    ];

    const createdTasks: any[] = [];
    
    for (const taskData of sampleTasks) {
      const task = await (prisma as any).task.create({
        data: taskData
      });
      createdTasks.push(task);
    }
    
    return NextResponse.json({ 
      message: 'Sample tasks created successfully',
      tasks: createdTasks
    });
  } catch (error) {
    console.error('POST /api/seed-tasks error:', error);
    return NextResponse.json(
      { error: 'Failed to create sample tasks' }, 
      { status: 500 }
    );
  }
}
