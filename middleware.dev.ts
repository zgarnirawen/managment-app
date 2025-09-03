import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Development middleware with enhanced logging and debugging
export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // Log request details in development
  if (process.env.NODE_ENV === 'development') {
    const userMetadata = (sessionClaims as any)?.metadata || {};
    const unsafeMetadata = (sessionClaims as any)?.unsafeMetadata || (userMetadata as any)?.unsafe || {};
    const publicMetadata = (sessionClaims as any)?.publicMetadata || (userMetadata as any)?.public || {};

    console.log('🔧 DEV MIDDLEWARE:', {
      url: req.url,
      method: req.method,
      userId: userId || 'anonymous',
      userRole: unsafeMetadata?.role || publicMetadata?.role || 'none',
      timestamp: new Date().toISOString()
    });
  }

  // Define route matchers for different user roles
  const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/admin(.*)',
    '/manager(.*)',
    '/employee(.*)',
    '/intern(.*)',
    '/super-admin(.*)',
    '/api/(.*)'
  ]);

  const isAdminRoute = createRouteMatcher([
    '/admin(.*)',
    '/dashboard/admin(.*)',
    '/super-admin(.*)',
    '/dashboard/super-admin(.*)'
  ]);

  const isManagerRoute = createRouteMatcher([
    '/manager(.*)',
    '/dashboard/manager(.*)'
  ]);

  const isEmployeeRoute = createRouteMatcher([
    '/employee(.*)',
    '/dashboard/employee(.*)'
  ]);

  const isInternRoute = createRouteMatcher([
    '/intern(.*)',
    '/dashboard/intern(.*)'
  ]);

  // If accessing protected route without authentication
  if (isProtectedRoute(req) && !userId) {
    console.log('🚫 DEV: Unauthorized access attempt to protected route');
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  // Role-based access control with development logging
  if (userId && sessionClaims) {
    const userMetadata = (sessionClaims as any)?.metadata || {};
    const unsafeMetadata = (sessionClaims as any)?.unsafeMetadata || (userMetadata as any)?.unsafe || {};
    const publicMetadata = (sessionClaims as any)?.publicMetadata || (userMetadata as any)?.public || {};

    const userRole = unsafeMetadata?.role ||
                     publicMetadata?.role ||
                     (sessionClaims as any)?.role as string;

    if (process.env.NODE_ENV === 'development') {
      console.log('👤 DEV: User role check:', {
        userId,
        userRole,
        route: req.url,
        isAdminRoute: isAdminRoute(req),
        isManagerRoute: isManagerRoute(req),
        isEmployeeRoute: isEmployeeRoute(req),
        isInternRoute: isInternRoute(req)
      });
    }

    // Admin routes - only admins and super admins
    if (isAdminRoute(req) && !['admin', 'super_admin'].includes(userRole)) {
      console.log('🚫 DEV: Insufficient permissions for admin route');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Manager routes - managers, admins, and super admins
    if (isManagerRoute(req) && !['manager', 'admin', 'super_admin'].includes(userRole)) {
      console.log('🚫 DEV: Insufficient permissions for manager route');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Employee routes - employees, managers, admins, and super admins
    if (isEmployeeRoute(req) && !['employee', 'manager', 'admin', 'super_admin'].includes(userRole)) {
      console.log('🚫 DEV: Insufficient permissions for employee route');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Intern routes - only interns
    if (isInternRoute(req) && userRole !== 'intern') {
      console.log('🚫 DEV: Insufficient permissions for intern route');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Continue with the request
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
