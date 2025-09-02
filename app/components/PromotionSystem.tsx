'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { ChevronUp, Users, Crown, Award } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  position: string;
  hireDate: string;
  department?: {
    name: string;
  };
}

export default function PromotionSystem() {
  const { user } = useUser();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [promotingId, setPromotingId] = useState<string | null>(null);

  const userRole = user?.unsafeMetadata?.role as string;
  const canPromote = ['manager', 'admin', 'super_admin'].includes(userRole);

  const roleHierarchy = {
    'intern': 'employee',
    'employee': 'manager',
    'manager': 'admin',
    'admin': 'super_admin'
  };

  const rolePermissions = {
    'manager': ['intern', 'employee'],
    'admin': ['intern', 'employee', 'manager'],
    'super_admin': ['intern', 'employee', 'manager', 'admin']
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      setEmployees(data.employees || data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const promoteEmployee = async (employeeId: string, currentRole: string) => {
    const nextRole = roleHierarchy[currentRole as keyof typeof roleHierarchy];
    if (!nextRole) return;

    setPromotingId(employeeId);

    try {
      const response = await fetch(`/api/employees/${employeeId}/promote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newRole: nextRole,
          promotedBy: user?.id,
          reason: `Promoted from ${currentRole} to ${nextRole} by ${user?.fullName}`
        })
      });

      if (response.ok) {
        await fetchEmployees(); // Refresh the list
      } else {
        alert('Failed to promote employee');
      }
    } catch (error) {
      console.error('Promotion failed:', error);
      alert('Failed to promote employee');
    } finally {
      setPromotingId(null);
    }
  };

  const canPromoteEmployee = (employeeRole: string) => {
    if (!canPromote) return false;
    const allowedRoles = rolePermissions[userRole as keyof typeof rolePermissions] || [];
    return allowedRoles.includes(employeeRole) && roleHierarchy[employeeRole as keyof typeof roleHierarchy];
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'intern': return '🎓';
      case 'employee': return '👤';
      case 'manager': return '👔';
      case 'admin': return '⚙️';
      case 'super_admin': return '👑';
      default: return '👤';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'intern': return 'bg-green-100 text-green-800';
      case 'employee': return 'bg-blue-100 text-blue-800';
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-orange-100 text-orange-800';
      case 'super_admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!canPromote) {
    return (
      <div className="p-6 text-center">
        <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Promotion System
        </h3>
        <p className="text-gray-600">
          You need manager-level access or higher to promote employees.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Award className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Employee Promotion System</h2>
        </div>
        <p className="text-gray-600">
          Promote employees based on their performance and readiness for increased responsibilities.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Members
          </h3>
        </div>

        <div className="divide-y">
          {employees.map((employee) => {
            const canPromoteThis = canPromoteEmployee(employee.role);
            const nextRole = roleHierarchy[employee.role as keyof typeof roleHierarchy];
            
            return (
              <div key={employee.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {getRoleIcon(employee.role)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{employee.name}</h4>
                      <p className="text-sm text-gray-600">{employee.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(employee.role)}`}>
                          {employee.role}
                        </span>
                        <span className="text-sm text-gray-500">
                          {employee.position}
                        </span>
                        {employee.department && (
                          <span className="text-sm text-gray-500">
                            • {employee.department.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {canPromoteThis && (
                    <button
                      onClick={() => promoteEmployee(employee.id, employee.role)}
                      disabled={promotingId === employee.id}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronUp className="w-4 h-4" />
                      {promotingId === employee.id ? 'Promoting...' : `Promote to ${nextRole}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Promotion Guidelines</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Interns can be promoted to Employees after completing their program</li>
          <li>• Employees can be promoted to Managers when they show leadership skills</li>
          <li>• Managers can be promoted to Admins for system responsibilities</li>
          <li>• Only Super Admins can promote to Admin level</li>
          <li>• All promotions are logged and create notifications</li>
        </ul>
      </div>
    </div>
  );
}
