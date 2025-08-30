'use client';

import { useState, useEffect } from 'react';
import { 
  UserGroupIcon,
  UserPlusIcon,
  UserMinusIcon,
  StarIcon,
  ShieldCheckIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { UserGroupIcon as UserGroupIconSolid } from '@heroicons/react/24/solid';

interface ChannelMember {
  id: string;
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  joinedAt: string;
  employee: {
    id: string;
    name: string;
    email: string;
    department?: {
      id: string;
      name: string;
    };
    role: {
      id: string;
      name: string;
    };
  };
}

interface ChannelMemberManagementProps {
  channelId: string;
  channelName: string;
  members: ChannelMember[];
  currentUserId: string;
  isChannelAdmin: boolean;
  onAddMember?: (employeeId: string, role?: 'MEMBER' | 'MODERATOR') => void;
  onRemoveMember?: (memberId: string) => void;
  onUpdateMemberRole?: (memberId: string, newRole: 'ADMIN' | 'MODERATOR' | 'MEMBER') => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChannelMemberManagement({
  channelId,
  channelName,
  members,
  currentUserId,
  isChannelAdmin,
  onAddMember,
  onRemoveMember,
  onUpdateMemberRole,
  isOpen,
  onClose
}: ChannelMemberManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const filteredMembers = members.filter(member =>
    member.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchAvailableEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chat/users');
      if (response.ok) {
        const employees = await response.json();
        // Filter out employees who are already members
        const memberIds = members.map(m => m.employee.id);
        const available = employees.filter((emp: any) => !memberIds.includes(emp.id));
        setAvailableEmployees(available);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showAddMember) {
      fetchAvailableEmployees();
    }
  }, [showAddMember, members]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <StarIcon className="w-4 h-4 text-yellow-500" />;
      case 'MODERATOR':
        return <ShieldCheckIcon className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Admin';
      case 'MODERATOR':
        return 'Moderator';
      default:
        return 'Member';
    }
  };

  const handleAddMember = (employeeId: string) => {
    if (onAddMember) {
      onAddMember(employeeId, 'MEMBER');
      setShowAddMember(false);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    if (onRemoveMember && window.confirm('Remove this member from the channel?')) {
      onRemoveMember(memberId);
    }
  };

  const handleRoleChange = (memberId: string, newRole: 'ADMIN' | 'MODERATOR' | 'MEMBER') => {
    if (onUpdateMemberRole) {
      onUpdateMemberRole(memberId, newRole);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <UserGroupIconSolid className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Channel Members
              </h2>
              <p className="text-sm text-gray-600">
                {channelName} • {members.length} members
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Search and Add */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {isChannelAdmin && (
              <button
                onClick={() => setShowAddMember(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlusIcon className="w-4 h-4" />
                Add Member
              </button>
            )}
          </div>

          {/* Members List */}
          <div className="space-y-3">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {member.employee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {member.employee.name}
                      </span>
                      {getRoleIcon(member.role)}
                      <span className="text-sm text-gray-500">
                        {getRoleLabel(member.role)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{member.employee.email}</p>
                    {member.employee.department && (
                      <p className="text-xs text-gray-500">
                        {member.employee.department.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Member Actions */}
                {isChannelAdmin && member.employee.id !== currentUserId && (
                  <div className="flex items-center gap-2">
                    {/* Role Selector */}
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as any)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="MODERATOR">Moderator</option>
                      <option value="ADMIN">Admin</option>
                    </select>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Remove member"
                    >
                      <UserMinusIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add Member Modal */}
        {showAddMember && (
          <div className="absolute inset-0 bg-white rounded-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add Members</h3>
              <button
                onClick={() => setShowAddMember(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 max-h-[50vh] overflow-y-auto">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading employees...</div>
              ) : (
                <div className="space-y-3">
                  {availableEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {employee.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{employee.name}</p>
                          <p className="text-sm text-gray-600">{employee.email}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddMember(employee.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
