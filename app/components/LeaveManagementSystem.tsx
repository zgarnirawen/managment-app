'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Plus, Eye, Edit, FileText, Download } from 'lucide-react';

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'bereavement' | 'unpaid';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  appliedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  documents?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface LeaveBalance {
  employeeId: string;
  vacation: { total: number; used: number; remaining: number; };
  sick: { total: number; used: number; remaining: number; };
  personal: { total: number; used: number; remaining: number; };
  maternity: { total: number; used: number; remaining: number; };
  paternity: { total: number; used: number; remaining: number; };
  bereavement: { total: number; used: number; remaining: number; };
}

interface LeaveManagementProps {
  userRole: string;
  userId: string;
  employeeName: string;
}

const LeaveManagementSystem: React.FC<LeaveManagementProps> = ({ userRole, userId, employeeName }) => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance | null>(null);
  const [activeTab, setActiveTab] = useState('my-requests');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  // Mock data - replace with actual API calls
  const mockLeaveRequests: LeaveRequest[] = [
    {
      id: '1',
      employeeId: userId,
      employeeName: employeeName,
      leaveType: 'vacation',
      startDate: '2024-12-23',
      endDate: '2024-12-27',
      totalDays: 5,
      reason: 'Christmas vacation with family',
      status: 'approved',
      appliedDate: '2024-12-01',
      approvedBy: 'manager1',
      approvedDate: '2024-12-02'
    },
    {
      id: '2',
      employeeId: 'emp2',
      employeeName: 'Jane Smith',
      leaveType: 'sick',
      startDate: '2024-12-18',
      endDate: '2024-12-19',
      totalDays: 2,
      reason: 'Medical appointment and recovery',
      status: 'pending',
      appliedDate: '2024-12-17'
    },
    {
      id: '3',
      employeeId: 'emp3',
      employeeName: 'Bob Johnson',
      leaveType: 'personal',
      startDate: '2024-12-30',
      endDate: '2025-01-02',
      totalDays: 4,
      reason: 'Personal matters',
      status: 'approved',
      appliedDate: '2024-12-10',
      approvedBy: 'manager1',
      approvedDate: '2024-12-11'
    }
  ];

  const mockLeaveBalance: LeaveBalance = {
    employeeId: userId,
    vacation: { total: 20, used: 5, remaining: 15 },
    sick: { total: 10, used: 2, remaining: 8 },
    personal: { total: 5, used: 1, remaining: 4 },
    maternity: { total: 90, used: 0, remaining: 90 },
    paternity: { total: 14, used: 0, remaining: 14 },
    bereavement: { total: 3, used: 0, remaining: 3 }
  };

  useEffect(() => {
    setLeaveRequests(mockLeaveRequests);
    setLeaveBalances(mockLeaveBalance);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    const colors = {
      vacation: 'bg-blue-100 text-blue-800',
      sick: 'bg-red-100 text-red-800',
      personal: 'bg-purple-100 text-purple-800',
      maternity: 'bg-pink-100 text-pink-800',
      paternity: 'bg-indigo-100 text-indigo-800',
      bereavement: 'bg-gray-100 text-gray-800',
      unpaid: 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  const submitLeaveRequest = (requestData: Partial<LeaveRequest>) => {
    const newRequest: LeaveRequest = {
      id: Date.now().toString(),
      employeeId: userId,
      employeeName: employeeName,
      leaveType: requestData.leaveType || 'vacation',
      startDate: requestData.startDate || '',
      endDate: requestData.endDate || '',
      totalDays: calculateDays(requestData.startDate || '', requestData.endDate || ''),
      reason: requestData.reason || '',
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0],
      emergencyContact: requestData.emergencyContact
    };

    setLeaveRequests([...leaveRequests, newRequest]);
    setIsCreateModalOpen(false);
  };

  const approveRequest = (requestId: string) => {
    setLeaveRequests(leaveRequests.map(request =>
      request.id === requestId
        ? {
            ...request,
            status: 'approved' as const,
            approvedBy: userId,
            approvedDate: new Date().toISOString().split('T')[0]
          }
        : request
    ));
  };

  const rejectRequest = (requestId: string, reason: string) => {
    setLeaveRequests(leaveRequests.map(request =>
      request.id === requestId
        ? {
            ...request,
            status: 'rejected' as const,
            rejectionReason: reason
          }
        : request
    ));
  };

  const filteredRequests = leaveRequests.filter(request => {
    if (activeTab === 'my-requests' && request.employeeId !== userId) return false;
    if (activeTab === 'team-requests' && request.employeeId === userId) return false;
    if (filter !== 'all' && request.status !== filter) return false;
    return true;
  });

  const CreateLeaveModal = ({ onClose, onSubmit }: any) => {
    const [formData, setFormData] = useState({
      leaveType: 'vacation',
      startDate: '',
      endDate: '',
      reason: '',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      }
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Request Leave</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
              <select
                value={formData.leaveType}
                onChange={(e) => setFormData({...formData, leaveType: e.target.value as any})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="vacation">Vacation</option>
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal Leave</option>
                <option value="maternity">Maternity Leave</option>
                <option value="paternity">Paternity Leave</option>
                <option value="bereavement">Bereavement Leave</option>
                <option value="unpaid">Unpaid Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {formData.startDate && formData.endDate && (
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm text-blue-700">
                  Total Days: {calculateDays(formData.startDate, formData.endDate)}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea
                required
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please provide a reason for your leave request..."
              />
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Emergency Contact (Optional)</h4>
              <div>
                <input
                  type="text"
                  value={formData.emergencyContact.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergencyContact: {...formData.emergencyContact, name: e.target.value}
                  })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contact Name"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="tel"
                  value={formData.emergencyContact.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergencyContact: {...formData.emergencyContact, phone: e.target.value}
                  })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone"
                />
                <input
                  type="text"
                  value={formData.emergencyContact.relationship}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergencyContact: {...formData.emergencyContact, relationship: e.target.value}
                  })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Relationship"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const RequestDetailsModal = ({ request, onClose }: any) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Leave Request Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <p className="text-gray-900">{request.employeeName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(request.leaveType)}`}>
                {request.leaveType.charAt(0).toUpperCase() + request.leaveType.slice(1)}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <p className="text-gray-900">{request.totalDays} days</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <p className="text-gray-900">{new Date(request.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <p className="text-gray-900">{new Date(request.endDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <p className="text-gray-900 bg-gray-50 p-2 rounded">{request.reason}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Applied Date</label>
            <p className="text-gray-900">{new Date(request.appliedDate).toLocaleDateString()}</p>
          </div>

          {request.approvedBy && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Approved By</label>
                <p className="text-gray-900">{request.approvedBy}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Approved Date</label>
                <p className="text-gray-900">{request.approvedDate ? new Date(request.approvedDate).toLocaleDateString() : '-'}</p>
              </div>
            </div>
          )}

          {request.rejectionReason && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
              <p className="text-red-600 bg-red-50 p-2 rounded">{request.rejectionReason}</p>
            </div>
          )}

          {request.emergencyContact && request.emergencyContact.name && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-sm">{request.emergencyContact.name}</p>
                <p className="text-sm text-gray-600">{request.emergencyContact.phone}</p>
                <p className="text-sm text-gray-600">{request.emergencyContact.relationship}</p>
              </div>
            </div>
          )}
        </div>

        {request.status === 'pending' && (userRole === 'manager' || userRole === 'admin' || userRole === 'super_admin') && (
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => {
                approveRequest(request.id);
                onClose();
              }}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center justify-center"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </button>
            <button
              onClick={() => {
                const reason = prompt('Please provide a reason for rejection:');
                if (reason) {
                  rejectRequest(request.id, reason);
                  onClose();
                }
              }}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center justify-center"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Leave Management</h2>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Request Leave
        </button>
      </div>

      {/* Leave Balance Summary */}
      {leaveBalances && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(leaveBalances).filter(([key]) => key !== 'employeeId').map(([type, balance]) => (
            <div key={type} className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-sm font-medium text-gray-700 capitalize">{type}</h3>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Used: {balance.used}</span>
                  <span>Total: {balance.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(balance.used / balance.total) * 100}%` }}
                  ></div>
                </div>
                <p className="text-lg font-bold text-gray-900 mt-1">{balance.remaining} left</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('my-requests')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'my-requests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Requests
          </button>
          {(userRole === 'manager' || userRole === 'admin' || userRole === 'super_admin') && (
            <button
              onClick={() => setActiveTab('team-requests')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'team-requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Team Requests
            </button>
          )}
        </nav>
      </div>

      {/* Filters */}
      <div className="flex justify-between items-center">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="w-8 h-8 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.employeeName}</div>
                      <div className="text-sm text-gray-500">Applied: {new Date(request.appliedDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(request.leaveType)}`}>
                    {request.leaveType.charAt(0).toUpperCase() + request.leaveType.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>{new Date(request.startDate).toLocaleDateString()}</div>
                  <div className="text-gray-500">to {new Date(request.endDate).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {request.totalDays}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setIsDetailsModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {request.status === 'pending' && (userRole === 'manager' || userRole === 'admin' || userRole === 'super_admin') && (
                    <>
                      <button
                        onClick={() => approveRequest(request.id)}
                        className="text-green-600 hover:text-green-900 mr-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Please provide a reason for rejection:');
                          if (reason) rejectRequest(request.id, reason);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRequests.length === 0 && (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leave requests found</h3>
            <p className="text-gray-500">No leave requests match your current filters.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateLeaveModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={submitLeaveRequest}
        />
      )}

      {isDetailsModalOpen && selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={() => setIsDetailsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default LeaveManagementSystem;
