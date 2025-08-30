'use client';

import './globals.css';
import ClerkAuthProvider from './clerk-provider';
import QueryProvider from './providers/QueryProvider';
import Link from 'next/link';
import { Toaster } from 'sonner';
import NotificationBell from './components/notifications/NotificationBellSimple';
import { SignInButton, SignOutButton, useUser } from '@clerk/nextjs';

function Navigation() {
  const { isSignedIn, user } = useUser();
  const userRole = user?.unsafeMetadata?.role as string;
  
  return (
    <nav className="w-full bg-background text-foreground py-4 px-8 flex gap-6 items-center justify-between border-b border-border shadow-lg">
      <div className="flex gap-6 items-center">
        <Link href="/" className="font-semibold hover:text-primary transition-colors">Home</Link>
        <Link href="/dashboard" className="font-semibold hover:text-primary transition-colors">Dashboard</Link>
        <Link href="/dashboard/employees" className="font-semibold hover:text-primary transition-colors">Employees</Link>
        <Link href="/dashboard/tasks" className="font-semibold hover:text-primary transition-colors">Tasks</Link>
        <Link href="/dashboard/projects" className="font-semibold hover:text-primary transition-colors">Projects</Link>
        <Link href="/dashboard/calendar" className="font-semibold hover:text-primary transition-colors">Calendar</Link>
        <Link href="/chat" className="font-semibold hover:text-primary transition-colors text-primary">💬 Chat</Link>
        <Link href="/intern-portal" className="font-semibold hover:text-primary transition-colors text-muted-foreground">🎓 Intern Portal</Link>
        <Link href="/collaboration" className="font-semibold hover:text-primary transition-colors text-muted-foreground">🤝 Collaboration</Link>
        <Link href="/settings" className="font-semibold hover:text-primary transition-colors text-muted-foreground">⚙️ Settings</Link>
        <Link href="/dashboard/employee" className="font-semibold hover:text-primary transition-colors text-muted-foreground">Employee Portal</Link>
        <Link href="/dashboard/manager" className="font-semibold hover:text-primary transition-colors text-muted-foreground">Manager Portal</Link>
        {isSignedIn && (
          <>
            <Link href="/two-factor-setup" className="font-semibold hover:text-nextgen-teal transition-colors text-nextgen-light-gray">
              🔐 2FA Setup
            </Link>
            <Link href="/security" className="font-semibold hover:text-nextgen-teal transition-colors text-nextgen-light-gray">
              ⚙️ Security
            </Link>
          </>
        )}
      </div>
      <div className="flex items-center gap-4">
        {isSignedIn && (
          <>
            <NotificationBell employeeId="cmets2l7w0001mhu87uxes32j" />
            {userRole && (
              <span className="text-xs bg-secondary px-2 py-1 rounded-lg text-secondary-foreground">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </span>
            )}
          </>
        )}
        {isSignedIn ? (
          <SignOutButton>
            <button className="bg-destructive hover:bg-destructive/80 px-3 py-1 rounded-lg text-sm text-destructive-foreground transition-colors">
              Sign Out
            </button>
          </SignOutButton>
        ) : (
          <SignInButton>
            <button className="bg-primary hover:bg-primary/90 px-3 py-1 rounded-lg text-sm text-primary-foreground transition-colors">
              Sign In
            </button>
          </SignInButton>
        )}
      </div>
    </nav>
  );
}

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground min-h-screen">
        <ClerkAuthProvider>
          <QueryProvider>
            <Navigation />
            <main className="bg-background">
              {children}
            </main>
            <Toaster position="top-right" />
          </QueryProvider>
        </ClerkAuthProvider>
      </body>
    </html>
  );
}
