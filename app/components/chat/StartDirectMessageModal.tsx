'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, UserIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Employee {
  id: string;
  name: string;
  email: string;
  department?: { id: string; name: string };
  role: { id: string; name: string };
}

interface StartDirectMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserSelected: (userId: string, userName: string) => void;
}

export default function StartDirectMessageModal({ 
  isOpen, 
  onClose, 
  onUserSelected 
}: StartDirectMessageModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      setSearchQuery(''); // Reset search when modal opens
    }
  }, [isOpen]);

  // Debounced search effect
  useEffect(() => {
    if (isOpen) {
      const timeoutId = setTimeout(() => {
        fetchEmployees();
      }, 300); // 300ms delay for debouncing

      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, isOpen]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      // Use chat users API which properly filters based on permissions and excludes current user
      const response = await fetch(`/api/chat/users?search=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setEmployees(data || []);
      }
    } catch (error) {
      console.error('Error fetching users for chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (employee: Employee) => {
    onUserSelected(employee.id, employee.name);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-nextgen-light-blue rounded-lg p-6 w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <UserIcon className="h-5 w-5 mr-2 text-nextgen-teal" />
            Start Direct Message
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-nextgen-dark-blue border border-nextgen-teal/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-nextgen-teal text-sm"
          />
        </div>

        {/* Employee List */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-nextgen-teal"></div>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {searchQuery ? 'No employees found matching your search.' : 'No employees available.'}
            </div>
          ) : (
            employees.map((employee) => (
              <button
                key={employee.id}
                onClick={() => handleUserSelect(employee)}
                className="w-full p-3 rounded-lg bg-nextgen-dark-blue hover:bg-nextgen-dark-blue/70 border border-transparent hover:border-nextgen-teal/30 transition-all duration-200 text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-nextgen-teal rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {employee.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {employee.email}
                    </p>
                    {employee.department && (
                      <p className="text-xs text-gray-500 truncate">
                        {employee.department.name} • {employee.role.name}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-nextgen-teal/20">
          <button
            onClick={onClose}
            className="w-full py-2 text-gray-300 hover:text-white transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
