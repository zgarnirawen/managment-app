import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/setup',
  '/sprints',
  '/leave', 
  '/payroll',
  '/gamification',
  '/intern-portal',
  '/timesheets',
  '/time-tracking',
  '/reports',
  '/profile',
  '/settings'
]);

// Admin-only routes
const isAdminOnlyRoute = createRouteMatcher([
  '/dashboard/admin(.*)',
  '/dashboard/employees',
  '/payroll(.*)',
  '/audit(.*)',
  '/policies(.*)',
  '/org-reports(.*)',
  '/global-settings(.*)',
  '/employee-management(.*)'
]);

// Manager+ routes
const isManagerPlusRoute = createRouteMatcher([
  '/dashboard/manager(.*)',
  '/leave(.*)',
  '/sprints(.*)',
  '/reports(.*)',
  '/team-management(.*)',
  '/team-timesheets(.*)',
  '/project-management(.*)'
]);

// Employee+ routes
const isEmployeePlusRoute = createRouteMatcher([
  '/dashboard/tasks(.*)',
  '/dashboard/projects(.*)',
  '/dashboard/calendar(.*)',
  '/timesheets(.*)',
  '/time-tracking(.*)',
  '/personal-reports(.*)',
  '/gamification(.*)'
]);

// Function to get user role from database
async function getUserRoleFromDB(userId: string): Promise<string | null> {
  try {
    const user = await prisma.employee.findUnique({
      where: { clerkUserId: userId },
      select: { role: true }
    });
    
    if (user) {
      // Convert database role to standard format
      return user.role.toLowerCase().replace(/\s+/g, '_');
    }
    return null;
  } catch (error) {
    console.error('Error fetching user role from DB:', error);
    return null;
  }
}

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();
  const url = req.nextUrl;

  // Allow unauthenticated access to setup-related APIs
  if (url.pathname.startsWith('/api/auth/') || url.pathname === '/api/employees/count') {
    return NextResponse.next();
  }

  // Only apply protection to our defined protected routes
  if (isProtectedRoute(req) && !userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Handle authenticated users with role-based access control
  if (userId && sessionClaims) {
    // Get user metadata from sessionClaims
    const unsafeMetadata = (sessionClaims as any).unsafeMetadata || {};
    const publicMetadata = (sessionClaims as any).publicMetadata || {};
    
    // Get role from metadata first
    let userRole = unsafeMetadata?.role || publicMetadata?.role as string;
    let roleSetupComplete = unsafeMetadata?.roleSetupComplete || publicMetadata?.roleSetupComplete as boolean;

    // If no role in metadata, check database
    if (!userRole) {
      console.log('🔍 No role in metadata, checking database...');
      userRole = await getUserRoleFromDB(userId);
      if (userRole) {
        console.log('✅ Found role in database:', userRole);
        roleSetupComplete = true; // If user exists in DB, setup is complete
      }
    }

    // Debug logging
    console.log('🔍 Middleware check:', {
      userId,
      pathname: url.pathname,
      userRole,
      roleSetupComplete,
      source: userRole && !unsafeMetadata?.role ? 'database' : 'metadata'
    });

    // Handle direct /dashboard access - redirect to role-specific dashboard
    if (url.pathname === '/dashboard' && userRole) {
      const role = userRole.toLowerCase().replace(/\s+/g, '_');
      let redirectPath = '/dashboard/employee'; // default fallback
      
      switch (role) {
        case 'super_administrator':
          redirectPath = '/dashboard/super-admin';
          break;
        case 'administrator':
          redirectPath = '/dashboard/admin';
          break;
        case 'manager':
          redirectPath = '/dashboard/manager';
          break;
        case 'employee':
          redirectPath = '/dashboard/employee';
          break;
        case 'intern':
          redirectPath = '/dashboard/intern';
          break;
      }
      
      console.log(`🔄 Redirecting from /dashboard to ${redirectPath} for role: ${role}`);
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }

    // Redirect users without role setup to auth-setup page
    if (!userRole || !roleSetupComplete) {
      // Allow access to auth-setup page
      if (url.pathname === '/auth-setup') {
        return NextResponse.next();
      }
      
      console.log('❌ Role setup not complete, redirecting to auth-setup');
      return NextResponse.redirect(new URL('/auth-setup', req.url));
    } else {
      console.log('✅ User authenticated with role:', userRole);
    }

    // Role-based access control
    if (userRole) {
      const role = userRole.toLowerCase();
      
      // Admin-only routes
      if (isAdminOnlyRoute(req) && !['administrator', 'super_administrator'].includes(role)) {
        return NextResponse.redirect(new URL('/dashboard?error=unauthorized&required=admin', req.url));
      }

      // Manager+ routes
      if (isManagerPlusRoute(req) && !['administrator', 'super_administrator', 'manager'].includes(role)) {
        return NextResponse.redirect(new URL('/dashboard?error=unauthorized&required=manager', req.url));
      }

      // Employee+ routes
      if (isEmployeePlusRoute(req) && !['administrator', 'super_administrator', 'manager', 'employee'].includes(role)) {
        return NextResponse.redirect(new URL('/intern-portal?error=unauthorized&required=employee', req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
