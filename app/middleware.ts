import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define route matchers for protected routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/manager(.*)',
  '/employee(.*)',
  '/intern(.*)',
  '/profile(.*)',
  '/settings(.*)'
]);

const isAdminRoute = createRouteMatcher([
  '/dashboard/admin(.*)',
  '/admin(.*)'
]);

const isManagerRoute = createRouteMatcher([
  '/dashboard/manager(.*)',
  '/manager(.*)'
]);

const isEmployeeRoute = createRouteMatcher([
  '/dashboard/employee(.*)',
  '/employee(.*)'
]);

const isInternRoute = createRouteMatcher([
  '/dashboard/intern(.*)',
  '/intern(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Get user information
  const { userId } = await auth();

  // If user is authenticated, check role-based access
  if (userId) {
    // For now, we'll let all authenticated users access protected routes
    // Role-based access control can be implemented here when needed
    // const userRole = user.publicMetadata?.role as string;
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
