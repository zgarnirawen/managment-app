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
    async function fetchUserRole() {
      if (!isLoaded) {
        return;
      }

      if (!user) {
        setRole('');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/user/current-role', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user role');
        }

        const data = await response.json();
        setRole(data.role || '');
      } catch (err) {
        console.error('Error fetching user role:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user role');
        setRole('');
      } finally {
        setLoading(false);
      }
    }

    fetchUserRole();
  }, [user, isLoaded]);

  return { role, loading, error };
}
