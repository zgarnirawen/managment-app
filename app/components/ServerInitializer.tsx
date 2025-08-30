'use client';

import { useEffect } from 'react';

// This component initializes server-side services
export default function ServerInitializer() {
  useEffect(() => {
    // Initialize timesheet cron job on the server
    fetch('/api/admin/init-cron', { method: 'POST' })
      .then(() => console.log('Timesheet cron job initialized'))
      .catch(err => console.error('Failed to initialize cron job:', err));
  }, []);

  return null; // This component doesn't render anything
}
