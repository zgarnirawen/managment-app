import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function requireRole(role: string, next: () => Promise<NextResponse>) {
  const user = await currentUser();
  if (!user || !user.publicMetadata?.role || user.publicMetadata.role !== role) {
    return NextResponse.redirect('/sign-in');
  }
  return next();
}
