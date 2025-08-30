"use client";

import EmployeesTable from './EmployeesTable';
import TasksProjectsTable from './TasksProjectsTable';
import ApproveRequests from './ApproveRequests';
import GlobalStats from './GlobalStats';
import RoleGuard from '../../components/RoleGuard';

export default function AdminDashboard() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <GlobalStats />
        <EmployeesTable />
        <TasksProjectsTable />
        <ApproveRequests />
      </main>
    </RoleGuard>
  );
}
