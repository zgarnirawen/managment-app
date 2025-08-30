'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import EmployeeForm from '../../components/forms/EmployeeForm';
import { Plus, Edit, Trash2, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  department?: {
    id: string;
    name: string;
  };
  role: string;
  status: string;
  createdAt: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employees');
      
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      
      const data = await response.json();
      setEmployees(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to load employees. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setShowAddForm(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowAddForm(true);
  };

  const handleFormSuccess = () => {
    setShowAddForm(false);
    setEditingEmployee(null);
    fetchEmployees();
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setEditingEmployee(null);
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete employee');
      }

      await fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete employee');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      case 'on_leave':
        return 'warning';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-nextgen-dark-blue">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-nextgen-white">Loading employees...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-screen bg-nextgen-dark-blue">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-nextgen-white">Employees</h1>
        <Button onClick={handleAddEmployee} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeForm
              employee={editingEmployee || undefined}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {employees.map((employee) => (
          <Card key={employee.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{employee.name}</CardTitle>
                  <p className="text-sm text-nextgen-light-gray">
                    {employee.position || 'No position assigned'}
                  </p>
                </div>
                <Badge variant={getStatusBadgeVariant(employee.status)}>
                  {employee.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-nextgen-light-gray" />
                <span className="truncate text-nextgen-white">{employee.email}</span>
              </div>
              
              {employee.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-nextgen-light-gray" />
                  <span className="text-nextgen-white">{employee.phone}</span>
                </div>
              )}
              
              <div className="text-sm">
                <div className="flex justify-between">
                  <span className="text-nextgen-light-gray">Department:</span>
                  <span className="text-nextgen-white">{employee.department?.name || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-nextgen-light-gray">Role:</span>
                  <span className="text-nextgen-white">{employee.role || 'Unassigned'}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditEmployee(employee)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteEmployee(employee.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {employees.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-nextgen-white">No employees found</h3>
              <p className="text-nextgen-light-gray">
                Get started by adding your first employee.
              </p>
              <Button onClick={handleAddEmployee} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
