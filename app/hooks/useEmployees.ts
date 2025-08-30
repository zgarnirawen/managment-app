import { useState, useEffect } from 'react';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  department?: {
    id: string;
    name: string;
  };
  role?: {
    id: string;
    name: string;
  };
  status: string;
  createdAt: string;
}

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError(error instanceof Error ? error.message : 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    loading,
    error,
    refetch: fetchEmployees
  };
};
