import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)'
]);

// Define routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/setup'
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const url = req.nextUrl;

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to sign-in
  if (isProtectedRoute(req) && !userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Handle authenticated users
  if (userId && sessionClaims) {
    const unsafeMetadata = sessionClaims.unsafeMetadata as any;
    const userRole = unsafeMetadata?.role as string;
    const roleSetupComplete = unsafeMetadata?.roleSetupComplete as boolean;

    // TEMPORARY: Skip role setup check to allow navigation
    // TODO: Re-enable this when Clerk authentication is fixed
    /*
    if (!userRole || !roleSetupComplete) {
      if (url.pathname !== '/setup') {
        return NextResponse.redirect(new URL('/setup', req.url));
      }
    }
    */

    // Role-based access control for specific admin routes
    if (url.pathname.startsWith('/dashboard/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard?error=unauthorized', req.url));
    }

    // Role-based access control for manager routes
    if (url.pathname.startsWith('/dashboard/manager') && !['admin', 'manager'].includes(userRole)) {
      return NextResponse.redirect(new URL('/dashboard?error=unauthorized', req.url));
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
