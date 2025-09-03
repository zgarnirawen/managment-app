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
    const userMetadata = (sessionClaims as any).metadata || {};
    const unsafeMetadata = (sessionClaims as any).unsafeMetadata || (userMetadata as any).unsafe || {};
    const publicMetadata = (sessionClaims as any).publicMetadata || (userMetadata as any).public || {};
    
    // Get role from multiple possible locations
    const userRole = unsafeMetadata?.role || 
                     publicMetadata?.role || 
                     (sessionClaims as any)?.role as string;
    
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
      sessionClaims: Object.keys(sessionClaims),
      metadata: userMetadata
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

    // Redirect users without role setup to auth-setup page (production-ready flow)
    // But allow API routes to function regardless of role setup status
    if (!userRole) {
      // Allow access to auth-setup page and API routes
      if (url.pathname === '/auth-setup' || url.pathname.startsWith('/api/')) {
        return NextResponse.next();
      }
      
      // Check if user recently completed setup (within last 5 minutes)
      const setupTimestamp = unsafeMetadata?.setupDate || publicMetadata?.setupDate;
      if (setupTimestamp) {
        const setupTime = new Date(setupTimestamp);
        const now = new Date();
        const timeDiff = now.getTime() - setupTime.getTime();
        const fiveMinutes = 5 * 60 * 1000;
        
        if (timeDiff < fiveMinutes) {
          console.log('⏳ Recent setup detected, allowing access to dashboard');
          return NextResponse.next();
        }
      }

      console.log('❌ No role found, redirecting to auth-setup');
      console.log('Redirecting from:', url.pathname, 'to: /auth-setup');
      
      // Force redirect with explicit URL construction
      const redirectUrl = new URL('/auth-setup', req.url);
      console.log('Redirect URL:', redirectUrl.toString());
      
      return NextResponse.redirect(redirectUrl);
    } else {
      console.log('✅ User authenticated with role:', userRole);
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
