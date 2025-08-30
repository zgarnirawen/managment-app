import { ClerkProvider } from '@clerk/nextjs';
import React from 'react';

export default function ClerkAuthProvider({ children }: { children: React.ReactNode }) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
