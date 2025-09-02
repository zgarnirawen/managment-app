'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { 
  CalendarDays, 
  Plus, 
  Filter,
  Search,
  Download,
  Upload,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar as CalendarIcon,
  MapPin,
  FileText,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'

// Mock leave data
const mockLeaveRequests = [
  {
    id: 1,
    employeeName: 'John Smith',
    employeeId: 'EMP001',
    leaveType: 'vacation',
    startDate: '2024-12-20',
    endDate: '2024-12-27',
    totalDays: 6,
    reason: 'Family vacation during holidays',
    status: 'pending',
    appliedDate: '2024-12-10',
    approver: 'Sarah Manager',
    attachments: ['vacation-booking.pdf'],
    emergencyContact: '+1-555-0123'
  },
  {
    id: 2,
    employeeName: 'Sarah Johnson',
    employeeId: 'EMP002',
    leaveType: 'sick',
    startDate: '2024-12-16',
    endDate: '2024-12-16',
    totalDays: 1,
    reason: 'Medical appointment',
    status: 'approved',
    appliedDate: '2024-12-15',
    approver: 'Mike Manager',
    attachments: [],
    emergencyContact: '+1-555-0124'
  },
  {
    id: 3,
    employeeName: 'Mike Davis',
    employeeId: 'EMP003',
    leaveType: 'personal',
    startDate: '2024-12-18',
    endDate: '2024-12-19',
    totalDays: 2,
    reason: 'Personal errands and family matters',
    status: 'approved',
    appliedDate: '2024-12-12',
    approver: 'Sarah Manager',
    attachments: [],
    emergencyContact: '+1-555-0125'
  },
  {
    id: 4,
    employeeName: 'Emily Wilson',
    employeeId: 'EMP004',
    leaveType: 'maternity',
    startDate: '2024-12-25',
    endDate: '2025-03-25',
    totalDays: 90,
    reason: 'Maternity leave for newborn',
    status: 'pending',
    appliedDate: '2024-11-20',
    approver: 'HR Department',
    attachments: ['medical-certificate.pdf', 'maternity-form.pdf'],
    emergencyContact: '+1-555-0126'
  }
]

const leaveTypes = [
  { value: 'vacation', label: 'Vacation', color: 'bg-blue-100 text-blue-800', maxDays: 25 },
  { value: 'sick', label: 'Sick Leave', color: 'bg-red-100 text-red-800', maxDays: 10 },
  { value: 'personal', label: 'Personal', color: 'bg-yellow-100 text-yellow-800', maxDays: 5 },
  { value: 'maternity', label: 'Maternity', color: 'bg-purple-100 text-purple-800', maxDays: 120 },
  { value: 'paternity', label: 'Paternity', color: 'bg-green-100 text-green-800', maxDays: 15 },
  { value: 'emergency', label: 'Emergency', color: 'bg-orange-100 text-orange-800', maxDays: 3 }
]

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
}

// Mock employee leave balances
const leaveBalances = {
  vacation: { used: 12, remaining: 13, total: 25 },
  sick: { used: 3, remaining: 7, total: 10 },
  personal: { used: 2, remaining: 3, total: 5 }
}

interface LeaveRequestForm {
  leaveType: string
  startDate: Date | undefined
  endDate: Date | undefined
  reason: string
  emergencyContact: string
}

export default function LeaveDashboard() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('requests')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [formData, setFormData] = useState<LeaveRequestForm>({
    leaveType: 'vacation',
    startDate: undefined,
    endDate: undefined,
    reason: '',
    emergencyContact: ''
  })

  const filteredRequests = mockLeaveRequests.filter(request => {
    const matchesSearch = request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request)
    setShowDetailsDialog(true)
  }

  const handleSubmitRequest = () => {
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      alert('Please fill in all required fields')
      return
    }

    // Calculate total days
    const totalDays = Math.ceil((formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const newRequest = {
      id: Date.now(),
      employeeName: user?.firstName + ' ' + user?.lastName || 'Current User',
      employeeId: 'EMP' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
      leaveType: formData.leaveType,
      startDate: formData.startDate.toISOString().split('T')[0],
      endDate: formData.endDate.toISOString().split('T')[0],
      totalDays: totalDays,
      reason: formData.reason,
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0],
      approver: 'Pending Assignment',
      attachments: [],
      emergencyContact: formData.emergencyContact
    }

    console.log('New leave request:', newRequest)
    setShowRequestDialog(false)
    setFormData({
      leaveType: 'vacation',
      startDate: undefined,
      endDate: undefined,
      reason: '',
      emergencyContact: ''
    })
    alert('Leave request submitted successfully!')
  }

  const handleApproveReject = (action: 'approve' | 'reject', requestId: number) => {
    console.log(`${action} request ${requestId}`)
    alert(`Leave request ${action}d successfully!`)
    setShowDetailsDialog(false)
  }

  const calculateDaysUsed = (type: string) => {
    return mockLeaveRequests
      .filter(req => req.leaveType === type && req.status === 'approved')
      .reduce((total, req) => total + req.totalDays, 0)
  }

  const getUpcomingLeaves = () => {
    const today = new Date()
    return mockLeaveRequests
      .filter(req => new Date(req.startDate) >= today && req.status === 'approved')
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
            <p className="text-gray-600 mt-1">Manage leave requests, balances, and approvals</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => setShowRequestDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Request Leave
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="requests">All Requests</TabsTrigger>
            <TabsTrigger value="balance">My Balance</TabsTrigger>
            <TabsTrigger value="calendar">Leave Calendar</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* All Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Leave Requests</CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        placeholder="Search requests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Employee</th>
                        <th className="text-left p-4">Leave Type</th>
                        <th className="text-left p-4">Dates</th>
                        <th className="text-left p-4">Duration</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Applied</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map((request) => {
                        const leaveType = leaveTypes.find(type => type.value === request.leaveType)
                        return (
                          <tr key={request.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div>
                                <div className="font-medium">{request.employeeName}</div>
                                <div className="text-sm text-gray-600">{request.employeeId}</div>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge className={leaveType?.color}>
                                {leaveType?.label}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="text-sm">
                                <div>{formatDate(request.startDate)}</div>
                                <div className="text-gray-600">to {formatDate(request.endDate)}</div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-medium">{request.totalDays} days</span>
                            </td>
                            <td className="p-4">
                              <Badge className={statusColors[request.status as keyof typeof statusColors]}>
                                {request.status}
                              </Badge>
                            </td>
                            <td className="p-4 text-sm text-gray-600">
                              {formatDate(request.appliedDate)}
                            </td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => handleViewDetails(request)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {request.status === 'pending' && (
                                  <>
                                    <Button variant="ghost" size="sm" className="text-green-600">
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-600">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Balance Tab */}
          <TabsContent value="balance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(leaveBalances).map(([type, balance]) => {
                const leaveType = leaveTypes.find(t => t.value === type)
                const usagePercentage = (balance.used / balance.total) * 100
                
                return (
                  <Card key={type}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{leaveType?.label}</span>
                        <Badge className={leaveType?.color}>
                          {balance.remaining} left
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-3xl font-bold">
                          {balance.remaining}
                          <span className="text-lg text-gray-600">/{balance.total} days</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${usagePercentage}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Used: {balance.used} days</span>
                          <span>{usagePercentage.toFixed(0)}% used</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Upcoming Leaves */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Approved Leaves</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getUpcomingLeaves().map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{leave.employeeName}</div>
                        <div className="text-sm text-gray-600">
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={leaveTypes.find(t => t.value === leave.leaveType)?.color}>
                          {leaveTypes.find(t => t.value === leave.leaveType)?.label}
                        </Badge>
                        <div className="text-sm text-gray-600 mt-1">{leave.totalDays} days</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Leave Calendar</CardTitle>
                <CardDescription>View all approved leaves on the calendar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Upcoming Leave Schedule</h3>
                    <div className="text-sm text-gray-600">
                      Calendar view showing all approved leave requests
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Legend</h3>
                    <div className="space-y-2">
                      {leaveTypes.map((type) => (
                        <div key={type.value} className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded ${type.color.replace('text-', 'bg-').replace('100', '500')}`} />
                          <span className="text-sm">{type.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Reports</CardTitle>
                  <CardDescription>Download leave reports and analytics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Report Type</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summary">Leave Summary</SelectItem>
                        <SelectItem value="detailed">Detailed Report</SelectItem>
                        <SelectItem value="balance">Balance Report</SelectItem>
                        <SelectItem value="analytics">Leave Analytics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Period</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current-month">Current Month</SelectItem>
                        <SelectItem value="last-month">Last Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Requests (This Month)</span>
                      <span className="font-semibold">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pending Approvals</span>
                      <span className="font-semibold text-orange-600">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Approved Requests</span>
                      <span className="font-semibold text-green-600">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Days/Request</span>
                      <span className="font-semibold">3.2</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Request Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Leave Request Details</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Employee</label>
                    <p className="font-medium">{selectedRequest.employeeName}</p>
                    <p className="text-sm text-gray-600">{selectedRequest.employeeId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Leave Type</label>
                    <div>
                      <Badge className={leaveTypes.find(t => t.value === selectedRequest.leaveType)?.color}>
                        {leaveTypes.find(t => t.value === selectedRequest.leaveType)?.label}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Start Date</label>
                    <p>{formatDate(selectedRequest.startDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">End Date</label>
                    <p>{formatDate(selectedRequest.endDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Total Days</label>
                    <p className="font-medium">{selectedRequest.totalDays} days</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div>
                      <Badge className={statusColors[selectedRequest.status as keyof typeof statusColors]}>
                        {selectedRequest.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Reason</label>
                  <p className="mt-1">{selectedRequest.reason}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Emergency Contact</label>
                  <p className="mt-1">{selectedRequest.emergencyContact}</p>
                </div>

                {selectedRequest.attachments.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Attachments</label>
                    <div className="mt-1 space-y-2">
                      {selectedRequest.attachments.map((attachment: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{attachment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRequest.status === 'pending' && (
                  <div className="flex space-x-2 pt-4 border-t">
                    <Button 
                      onClick={() => handleApproveReject('approve', selectedRequest.id)}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => handleApproveReject('reject', selectedRequest.id)}
                      className="flex-1"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Request Leave Dialog */}
        <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Request Leave</DialogTitle>
              <DialogDescription>
                Submit a new leave request for approval
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Leave Type</label>
                <Select value={formData.leaveType} onValueChange={(value) => setFormData({ ...formData, leaveType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label} (Max: {type.maxDays} days)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <Input
                    type="date"
                    value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value ? new Date(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <Input
                    type="date"
                    value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value ? new Date(e.target.value) : undefined })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Reason</label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Please provide a reason for your leave request..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Emergency Contact</label>
                <Input
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="+1-555-0123"
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleSubmitRequest} className="flex-1">
                  Submit Request
                </Button>
                <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
