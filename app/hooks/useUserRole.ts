'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export interface UserRole {
  role: string;
  loading: boolean;
  error: string | null;
}

export function useUserRole(): UserRole {
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!user) {
      setRole('');
      setLoading(false);
      return;
    }

    try {
      // Read role directly from Clerk's public metadata
      const userRole = user.publicMetadata?.role as string;
      setRole(userRole || '');
      setError(null);
    } catch (err) {
      console.error('Error reading user role:', err);
      setError(err instanceof Error ? err.message : 'Failed to read user role');
      setRole('');
    } finally {
      setLoading(false);
    }
  }, [user, isLoaded]);

  return { role, loading, error };
}
