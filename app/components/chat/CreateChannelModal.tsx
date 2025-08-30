'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, HashtagIcon, LockClosedIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

interface Employee {
  id: string;
  name: string;
  email: string;
  department?: { id: string; name: string };
  role: { id: string; name: string };
}

interface Department {
  id: string;
  name: string;
}

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChannelCreated: () => void;
}

export default function CreateChannelModal({ isOpen, onClose, onChannelCreated }: CreateChannelModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'GENERAL' as 'GENERAL' | 'TEAM' | 'DEPARTMENT' | 'PROJECT' | 'INTERN' | 'ANNOUNCEMENT',
    isPrivate: false,
    departmentId: '',
    memberIds: [] as string[],
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      fetchDepartments();
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/chat/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onChannelCreated();
        onClose();
        setFormData({
          name: '',
          description: '',
          type: 'GENERAL',
          isPrivate: false,
          departmentId: '',
          memberIds: [],
        });
      } else {
        const errorData = await response.json();
        if (errorData.details) {
          const fieldErrors: Record<string, string> = {};
          errorData.details.forEach((error: any) => {
            fieldErrors[error.path[0]] = error.message;
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ general: errorData.error || 'Failed to create channel' });
        }
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleMemberToggle = (employeeId: string) => {
    setFormData(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(employeeId)
        ? prev.memberIds.filter(id => id !== employeeId)
        : [...prev.memberIds, employeeId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-nextgen-light-blue rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <HashtagIcon className="h-5 w-5 mr-2 text-nextgen-teal" />
            Create New Channel
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-200">
              {errors.general}
            </div>
          )}

          {/* Channel Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Channel Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-nextgen-dark-blue border border-nextgen-teal/30 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-nextgen-teal"
              placeholder="e.g., general, marketing-team, project-alpha"
              required
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-nextgen-dark-blue border border-nextgen-teal/30 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-nextgen-teal"
              placeholder="What's this channel about?"
              rows={3}
            />
          </div>

          {/* Channel Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Channel Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full bg-nextgen-dark-blue border border-nextgen-teal/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-nextgen-teal"
            >
              <option value="GENERAL">General</option>
              <option value="TEAM">Team</option>
              <option value="DEPARTMENT">Department</option>
              <option value="PROJECT">Project</option>
              <option value="INTERN">Intern</option>
              <option value="ANNOUNCEMENT">Announcement</option>
            </select>
          </div>

          {/* Privacy Setting */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Privacy
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="privacy"
                  checked={!formData.isPrivate}
                  onChange={() => setFormData(prev => ({ ...prev, isPrivate: false }))}
                  className="mr-2 text-nextgen-teal"
                />
                <GlobeAltIcon className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-white">Public - Anyone can join</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="privacy"
                  checked={formData.isPrivate}
                  onChange={() => setFormData(prev => ({ ...prev, isPrivate: true }))}
                  className="mr-2 text-nextgen-teal"
                />
                <LockClosedIcon className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-white">Private - Invite only</span>
              </label>
            </div>
          </div>

          {/* Department Selection */}
          {(formData.type === 'DEPARTMENT' || formData.type === 'TEAM') && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Department
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
                className="w-full bg-nextgen-dark-blue border border-nextgen-teal/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-nextgen-teal"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Member Selection */}
          {formData.isPrivate && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Add Members
              </label>
              <div className="max-h-40 overflow-y-auto bg-nextgen-dark-blue border border-nextgen-teal/30 rounded-lg p-3 space-y-2">
                {employees.map(employee => (
                  <label key={employee.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.memberIds.includes(employee.id)}
                      onChange={() => handleMemberToggle(employee.id)}
                      className="mr-2 text-nextgen-teal"
                    />
                    <div className="flex-1">
                      <div className="text-white text-sm">{employee.name}</div>
                      <div className="text-gray-400 text-xs">{employee.email}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="px-6 py-2 bg-nextgen-teal text-white rounded-lg hover:bg-nextgen-teal/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
