import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET() {
  try {
    const leaveRequests = await prisma.leaveRequest.findMany({ include: { employee: true } });
    return NextResponse.json(leaveRequests);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const leaveRequest = await prisma.leaveRequest.create({ data });
    return NextResponse.json(leaveRequest);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
