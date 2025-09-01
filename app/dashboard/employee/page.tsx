'use client';

import { useUser } from '@clerk/nextjs';
import AssignedTasks from './AssignedTasks';
import WorkingHours from './WorkingHours';
import LeaveRequestForm from './LeaveRequestForm';
import PerformanceSummary from './PerformanceSummary';
import EmployeeTimeTracking from './EmployeeTimeTracking';
import EmployeeTimesheet from './EmployeeTimesheet';
import RoleGuard from '../../components/RoleGuard';

export default function EmployeeDashboard() {
  return (
    <RoleGuard allowedRoles={['EMPLOYEE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN']}>
      <EmployeeDashboardContent />
    </RoleGuard>
  );
}

function EmployeeDashboardContent() {
  const { user } = useUser();
  const employeeId = user?.id || '';

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Employee Dashboard</h1>
      
      {/* Time Tracking Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <EmployeeTimeTracking employeeId={employeeId} />
        <WorkingHours />
      </div>

      {/* Tasks and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AssignedTasks />
        <PerformanceSummary />
      </div>

      {/* Timesheet and Leave Request */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmployeeTimesheet employeeId={employeeId} />
        <LeaveRequestForm />
      </div>
    </main>
  );
}
