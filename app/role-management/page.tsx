'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

interface Employee {
  id: number;
  clerkUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  position: string;
  isActive: boolean;
  startDate: string;
}

const ROLE_HIERARCHY = ['intern', 'employee', 'manager', 'admin', 'super_admin'];
const ROLE_LABELS = {
  intern: 'Intern',
  employee: 'Employee', 
  manager: 'Manager',
  admin: 'Administrator',
  super_admin: 'Super Administrator'
};

const ROLE_COLORS = {
  intern: 'bg-green-100 text-green-800',
  employee: 'bg-blue-100 text-blue-800',
  manager: 'bg-purple-100 text-purple-800',
  admin: 'bg-orange-100 text-orange-800',
  super_admin: 'bg-red-100 text-red-800'
};

export default function RoleManagement() {
  const { user } = useUser();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newRole, setNewRole] = useState('');
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const currentUserRole = user?.unsafeMetadata?.role as string;

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees || []);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedEmployee || !newRole || !reason.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/auth/change-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: selectedEmployee.clerkUserId,
          newRole,
          reason: reason.trim()
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message);
        setSelectedEmployee(null);
        setNewRole('');
        setReason('');
        fetchEmployees(); // Refresh the list
      } else {
        throw new Error(result.error || 'Role change failed');
      }
    } catch (error) {
      console.error('Role change failed:', error);
      alert(`Role change failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };

  const canChangeRole = (targetRole: string, employeeRole: string) => {
    if (!['admin', 'super_admin'].includes(currentUserRole)) return false;
    
    // Only super admin can assign super_admin or admin roles
    if ((targetRole === 'super_admin' || targetRole === 'admin') && currentUserRole !== 'super_admin') {
      return false;
    }
    
    // Can't demote yourself if you're the only super admin (this should be checked server-side too)
    return true;
  };

  const getRoleLevel = (role: string) => ROLE_HIERARCHY.indexOf(role);

  if (!['admin', 'super_admin'].includes(currentUserRole)) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
            <p className="text-gray-600">Only administrators can access role management.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading employees...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            👥 Role Management
          </h1>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Employee List */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Team Members ({employees.length})
              </h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedEmployee?.id === employee.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setNewRole(employee.role);
                      setReason('');
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {employee.firstName} {employee.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{employee.email}</p>
                        <p className="text-sm text-gray-500">{employee.department}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[employee.role as keyof typeof ROLE_COLORS]}`}>
                          {ROLE_LABELS[employee.role as keyof typeof ROLE_LABELS]}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Level {getRoleLevel(employee.role) + 1}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Role Change Form */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Change Role
              </h2>
              
              {selectedEmployee ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Selected Employee
                    </h3>
                    <p className="text-gray-700">
                      {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{selectedEmployee.email}</p>
                    <p className="text-sm">
                      Current Role: <span className={`px-2 py-1 rounded text-xs font-medium ${ROLE_COLORS[selectedEmployee.role as keyof typeof ROLE_COLORS]}`}>
                        {ROLE_LABELS[selectedEmployee.role as keyof typeof ROLE_LABELS]}
                      </span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Role
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {ROLE_HIERARCHY.map((role) => (
                        <option
                          key={role}
                          value={role}
                          disabled={!canChangeRole(role, selectedEmployee.role)}
                        >
                          {ROLE_LABELS[role as keyof typeof ROLE_LABELS]}
                          {!canChangeRole(role, selectedEmployee.role) && ' (Restricted)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Change (Required)
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Enter the reason for this role change..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleRoleChange}
                      disabled={processing || !newRole || !reason.trim() || newRole === selectedEmployee.role}
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Updating...
                        </div>
                      ) : (
                        'Update Role'
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedEmployee(null);
                        setNewRole('');
                        setReason('');
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  {newRole && newRole !== selectedEmployee.role && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">Role Change Impact:</h4>
                      <p className="text-sm text-yellow-700">
                        {getRoleLevel(newRole) > getRoleLevel(selectedEmployee.role) ? (
                          <>🎉 <strong>Promotion:</strong> User will gain additional privileges and access to new features.</>
                        ) : getRoleLevel(newRole) < getRoleLevel(selectedEmployee.role) ? (
                          <>⚠️ <strong>Demotion:</strong> User will lose access to some features and administrative functions.</>
                        ) : (
                          <>↔️ <strong>Lateral Move:</strong> Role level remains the same but may have different responsibilities.</>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">👤</div>
                  <p className="text-gray-600">
                    Select an employee from the list to change their role
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
