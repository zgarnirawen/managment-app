import { Suspense } from 'react';
import InternDashboard from '../../components/intern/InternDashboard';
import { Card, CardContent } from '../../components/ui/card';
import { Loader2 } from 'lucide-react';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Loading intern portal...</span>
      </div>
    </div>
  );
}

export default function InternPortalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Suspense fallback={<LoadingSpinner />}>
        <InternDashboard />
      </Suspense>
    </div>
  );
}
