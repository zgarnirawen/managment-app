import { Suspense } from 'react';
import RoleBasedDashboard from '../components/RoleBasedDashboard';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-nextgen-dark-gray">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-white text-lg">Loading dashboard...</div>
        </div>
      }>
        <RoleBasedDashboard />
      </Suspense>
    </div>
  );
}
