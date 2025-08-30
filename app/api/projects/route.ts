import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({ include: { employees: true, tasks: true } });
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const project = await prisma.project.create({ data });
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
