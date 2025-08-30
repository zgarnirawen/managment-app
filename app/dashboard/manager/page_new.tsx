'use client';

import { useState } from 'react';
import ManagerTimeApproval from './ManagerTimeApproval';
import ManagerTimesheets from './ManagerTimesheets';
import RoleGuard from '../../components/RoleGuard';

export default function ManagerDashboard() {
  return (
    <RoleGuard allowedRoles={['manager']}>
      <ManagerDashboardContent />
    </RoleGuard>
  );
}

function ManagerDashboardContent() {
  const [activeTab, setActiveTab] = useState('approvals');

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Manager Dashboard</h1>
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('approvals')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'approvals'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Time Approvals
            </button>
            <button
              onClick={() => setActiveTab('timesheets')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'timesheets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Timesheets & Reports
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'approvals' && <ManagerTimeApproval />}
      {activeTab === 'timesheets' && <ManagerTimesheets />}
    </main>
  );
}
