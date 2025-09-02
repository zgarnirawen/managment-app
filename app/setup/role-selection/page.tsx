'use client';

import DashboardSelector from '../../components/DashboardSelector';

export default function RoleSelectionPage() {
  return (
    <div className="min-h-screen bg-nextgen-dark-blue text-nextgen-white">
      <DashboardSelector showRoleSelection={true} />
    </div>
  );
}
