'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { 
  Calendar, 
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  CalendarDays
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  employeeId: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  employee: {
    id: string;
    name: string;
    email: string;
  };
}

interface LeaveFormData {
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export default function LeavePage() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [formData, setFormData] = useState<LeaveFormData>({
    type: 'VACATION',
    startDate: '',
    endDate: '',
    reason: ''
  });

  // Check if user is manager/admin (simplified check)
  const isManager = user?.publicMetadata?.role === 'manager' || user?.publicMetadata?.role === 'admin';

  // Fetch leave requests
  const { data: leaveRequests = [], isLoading } = useQuery({
    queryKey: ['leave-requests'],
    queryFn: async () => {
      const response = await fetch('/api/leave-requests');
      if (!response.ok) throw new Error('Failed to fetch leave requests');
      return response.json();
    }
  });

  // Create leave request mutation
  const createMutation = useMutation({
    mutationFn: async (data: LeaveFormData) => {
      const response = await fetch('/api/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate)
        })
      });
      if (!response.ok) throw new Error('Failed to create leave request');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      setIsCreateDialogOpen(false);
      setFormData({ type: 'VACATION', startDate: '', endDate: '', reason: '' });
      toast({
        title: "Success",
        description: "Leave request submitted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit leave request",
        variant: "destructive",
      });
    }
  });

  // Approve/Reject leave request mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { 
      id: string; 
      status: 'APPROVED' | 'REJECTED'; 
      rejectionReason?: string 
    }) => {
      const response = await fetch(`/api/leave-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejectionReason })
      });
      if (!response.ok) throw new Error('Failed to update leave request');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      setIsApprovalDialogOpen(false);
      setSelectedRequest(null);
      setRejectionReason('');
      toast({
        title: "Success",
        description: "Leave request updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update leave request",
        variant: "destructive",
      });
    }
  });

  // Filter requests based on user role
  const filteredRequests = isManager 
    ? leaveRequests 
    : leaveRequests.filter((req: LeaveRequest) => req.employeeId === user?.id);

  // Statistics
  const stats = {
    total: filteredRequests.length,
    pending: filteredRequests.filter((req: LeaveRequest) => req.status === 'PENDING').length,
    approved: filteredRequests.filter((req: LeaveRequest) => req.status === 'APPROVED').length,
    rejected: filteredRequests.filter((req: LeaveRequest) => req.status === 'REJECTED').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="text-yellow-700 border-yellow-300"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="text-green-700 border-green-300"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="text-red-700 border-red-300"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isManager ? 'Leave Management' : 'My Leave Requests'}
          </h1>
          <p className="text-gray-600">
            {isManager ? 'Manage team leave requests and approvals' : 'Submit and track your leave requests'}
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Request Leave
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>New Leave Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="type">Leave Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VACATION">Vacation</SelectItem>
                    <SelectItem value="SICK">Sick Leave</SelectItem>
                    <SelectItem value="PERSONAL">Personal</SelectItem>
                    <SelectItem value="MATERNITY">Maternity</SelectItem>
                    <SelectItem value="PATERNITY">Paternity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    min={formData.startDate}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Provide additional details..."
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => createMutation.mutate(formData)}
                  disabled={createMutation.isPending || !formData.startDate || !formData.endDate}
                  className="flex-1"
                >
                  {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {isManager ? 'All Leave Requests' : 'Your Leave Requests'}
        </h2>
        
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Leave Requests</h3>
              <p className="text-gray-600 mb-4">
                {isManager 
                  ? "No leave requests have been submitted yet." 
                  : "You haven't submitted any leave requests yet."}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Request Leave
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request: LeaveRequest) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {isManager && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{request.employee.name}</span>
                          </div>
                        )}
                        <Badge variant="outline">{request.type}</Badge>
                        {getStatusBadge(request.status)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(request.startDate)} - {formatDate(request.endDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{calculateDays(request.startDate, request.endDate)} days</span>
                        </div>
                      </div>
                      
                      {request.reason && (
                        <p className="text-sm text-gray-700 mt-2">{request.reason}</p>
                      )}
                      
                      {request.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm text-red-700">
                            <strong>Rejection Reason:</strong> {request.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {isManager && request.status === 'PENDING' && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: request.id, status: 'APPROVED' })}
                          disabled={updateStatusMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsApprovalDialogOpen(true);
                          }}
                          disabled={updateStatusMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Rejection Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Please provide a reason for rejecting this leave request:
            </p>
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (selectedRequest) {
                    updateStatusMutation.mutate({ 
                      id: selectedRequest.id, 
                      status: 'REJECTED',
                      rejectionReason
                    });
                  }
                }}
                disabled={updateStatusMutation.isPending || !rejectionReason.trim()}
                variant="destructive"
                className="flex-1"
              >
                {updateStatusMutation.isPending ? 'Rejecting...' : 'Reject Request'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsApprovalDialogOpen(false);
                  setRejectionReason('');
                  setSelectedRequest(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
