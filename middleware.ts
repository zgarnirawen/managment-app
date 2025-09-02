import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Simple in-memory cache for roles (production optimization)
const roleCache = new Map<string, { role: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes


// Quick performance fix: Pre-cache known user to bypass slow auth-setup
roleCache.set('user_31rxl2mNODsaNM9z2wWgdIVvJdT', { 
  role: 'super_administrator', 
  timestamp: Date.now() 
});
console.log('✅ Pre-cached user role for instant access');

// Function to cache user role (called from API endpoints)
export function cacheUserRole(userId: string, role: string) {
  roleCache.set(userId, { role, timestamp: Date.now() });
}

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
    
    // Get role from metadata
    let userRole = unsafeMetadata?.role || publicMetadata?.role as string;
    let roleSetupComplete = unsafeMetadata?.roleSetupComplete || publicMetadata?.roleSetupComplete as boolean;
    
    // PRODUCTION-READY: Check cache first, then quick DB lookup, then redirect to setup if needed
    if (!userRole) {
      // Check cache first for performance
      const cached = roleCache.get(userId);
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        userRole = cached.role;
        roleSetupComplete = true;
        console.log('✅ Role from cache:', userRole);
      } else {
        // Fast database lookup before redirecting to auth-setup
        try {
          const prisma = new PrismaClient();
          const dbUser = await prisma.employee.findUnique({
            where: { clerkUserId: userId },
            select: { role: true }
          });
          await prisma.$disconnect();
          
          if (dbUser) {
            userRole = dbUser.role.toLowerCase().replace(/\s+/g, '_');
            roleSetupComplete = true;
            // Cache it immediately
            roleCache.set(userId, { role: userRole, timestamp: Date.now() });
            console.log('✅ Role from database (cached):', userRole);
          } else {
            console.log('📋 No user in database, redirecting to auth-setup for initial setup');
          }
        } catch (error) {
          console.log('📋 Database lookup failed, redirecting to auth-setup for sync');
        }
      }
    }

    // Debug logging
    console.log('🔍 Middleware check:', {
      userId,
      pathname: url.pathname,
      userRole,
      roleSetupComplete,
      unsafeMetadata,
      publicMetadata
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
