import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(departments);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const department = await prisma.department.create({ data });
    return NextResponse.json(department);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
