'use client';

import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import Navigation from './components/Navigation';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,   // 10 minutes
    },
  },
});

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <body className="bg-nextgen-dark-blue text-nextgen-white min-h-screen">
        <ClerkProvider>
          <QueryClientProvider client={queryClient}>
            <Navigation />
            <main className="bg-nextgen-dark-blue min-h-screen">
              {children}
            </main>
            <footer className="bg-nextgen-medium-gray border-t border-nextgen-light-gray/20 py-6 px-8">
              <div className="max-w-7xl mx-auto text-center">
                <p className="text-nextgen-light-gray text-sm">
                  © {new Date().getFullYear()} ZGARNI - Employee & Time Management System. All rights reserved.
                </p>
                <p className="text-nextgen-light-gray/70 text-xs mt-1">
                  Built with Next.js, Tailwind CSS, and NextGen Color Palette
                </p>
              </div>
            </footer>
            <Toaster position="top-right" />
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
