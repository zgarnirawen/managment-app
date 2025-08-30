import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const role = await prisma.role.create({ data });
    return NextResponse.json(role);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
