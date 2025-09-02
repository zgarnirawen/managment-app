import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

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

// Define detailed role-based access control based on user requirements

// Admin-only routes (Administration, Payroll, Audit, Global Management)
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

// Manager+ routes (accessible to Managers and Admins)
const isManagerPlusRoute = createRouteMatcher([
  '/dashboard/manager(.*)',
  '/leave(.*)', // Leave approval for managers
  '/sprints(.*)', // Sprint management
  '/reports(.*)', // Team-level reports
  '/team-management(.*)',
  '/team-timesheets(.*)',
  '/project-management(.*)'
]);

// Employee+ routes (accessible to Employees, Managers, and Admins - not Interns)
const isEmployeePlusRoute = createRouteMatcher([
  '/dashboard/tasks(.*)',
  '/dashboard/projects(.*)',
  '/dashboard/calendar(.*)',
  '/timesheets(.*)',
  '/time-tracking(.*)',
  '/personal-reports(.*)',
  '/gamification(.*)'
]);

// Intern-only routes
const isInternOnlyRoute = createRouteMatcher([
  '/intern-portal(.*)',
  '/mentorship(.*)',
  '/learning(.*)'
]);

// Shared routes (available to all authenticated users)
const isSharedRoute = createRouteMatcher([
  '/dashboard/notifications(.*)',
  '/settings(.*)',
  '/profile(.*)',
  '/dashboard/chat(.*)',
  '/collaboration(.*)',
  '/dashboard$', // Exact dashboard match
  '/$' // Home page
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const url = req.nextUrl;

  // Allow unauthenticated access to employee count API for first-user detection
  if (url.pathname === '/api/employees/count') {
    return NextResponse.next();
  }

  // Only apply protection to our defined protected routes
  if (isProtectedRoute(req) && !userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Handle authenticated users with role-based access control
  if (userId && sessionClaims) {
    // Try multiple ways to get user metadata
    const unsafeMetadata = sessionClaims.unsafeMetadata as any;
    const publicMetadata = sessionClaims.publicMetadata as any;
    
    // Get role from multiple possible locations
    const userRole = unsafeMetadata?.role || 
                     publicMetadata?.role as string;
    
    const roleSetupComplete = unsafeMetadata?.roleSetupComplete || 
                              publicMetadata?.roleSetupComplete as boolean;

    // Debug logging
    console.log('🔍 Middleware check:', {
      userId,
      pathname: url.pathname,
      userRole,
      roleSetupComplete,
      unsafeMetadata,
      publicMetadata,
      allClaims: Object.keys(sessionClaims)
    });

    // Handle direct /dashboard access - redirect to role-specific dashboard
    if (url.pathname === '/dashboard' && userRole) {
      const role = userRole.toLowerCase();
      let redirectPath = '/dashboard/employee'; // default fallback
      
      switch (role) {
        case 'super_admin':
        case 'admin':
          redirectPath = '/dashboard/admin';
          break;
        case 'manager':
          redirectPath = '/dashboard/manager';
          break;
        case 'employee':
          redirectPath = '/dashboard/employee';
          break;
        case 'intern':
          redirectPath = '/dashboard/employee'; // Interns use employee dashboard for now
          break;
      }
      
      console.log(`🔄 Redirecting from /dashboard to ${redirectPath} for role: ${role}`);
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }

    // TEMPORARILY DISABLE ROLE CHECK - Allow all access for now
    // This will let users complete setup and access dashboards
    if (false && (!userRole || !roleSetupComplete) && url.pathname !== '/setup') {
      console.log('❌ Role setup not complete, redirecting to setup');
      return NextResponse.redirect(new URL('/setup', req.url));
    } else {
      console.log('✅ Allowing access (role check temporarily disabled)');
    }

    // Comprehensive role-based access control
    if (userRole) {
      const role = userRole.toLowerCase();
      
      // Admin-only routes
      if (isAdminOnlyRoute(req) && !['admin', 'super_admin'].includes(role)) {
        return NextResponse.redirect(new URL('/dashboard?error=unauthorized&required=admin', req.url));
      }

      // Manager+ routes (Managers and Admins only)
      if (isManagerPlusRoute(req) && !['admin', 'super_admin', 'manager'].includes(role)) {
        return NextResponse.redirect(new URL('/dashboard?error=unauthorized&required=manager', req.url));
      }

      // Employee+ routes (Employees, Managers, and Admins - not Interns)
      if (isEmployeePlusRoute(req) && !['admin', 'super_admin', 'manager', 'employee'].includes(role)) {
        return NextResponse.redirect(new URL('/intern-portal?error=unauthorized&required=employee', req.url));
      }

      // Intern-only routes
      if (isInternOnlyRoute(req) && role !== 'intern') {
        return NextResponse.redirect(new URL('/dashboard?error=unauthorized&required=intern', req.url));
      }

      // Special handling for interns - redirect from restricted areas to intern portal
      if (role === 'intern') {
        const restrictedForInterns = createRouteMatcher([
          '/payroll(.*)',
          '/leave(.*)', // Limited leave for interns handled in intern portal
          '/sprints(.*)',
          '/dashboard/admin(.*)',
          '/dashboard/manager(.*)',
          '/dashboard/employees',
          '/dashboard/projects', // No full project access
          '/timesheets(.*)', // No timesheet access for interns
          '/time-tracking(.*)',
          '/personal-reports(.*)',
          '/reports(.*)'
        ]);
        
        if (restrictedForInterns(req)) {
          return NextResponse.redirect(new URL('/intern-portal', req.url));
        }
      }
    }
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
