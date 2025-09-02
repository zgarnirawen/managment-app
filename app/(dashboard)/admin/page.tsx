'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { 
  Users, 
  Clock, 
  FileText, 
  ArrowUp, 
  Bell,
  CheckCircle,
  AlertCircle,
  Calendar,
  Target,
  MessageSquare,
  BarChart3,
  Settings,
  UserPlus,
  DollarSign,
  TrendingUp,
  Award,
  Shield,
  Database,
  Globe,
  Zap,
  Building
} from 'lucide-react';

interface Department {
  id: string;
  name: string;
  manager: string;
  employees: number;
  budget: number;
  budgetUsed: number;
  performance: number;
}

interface SystemMetric {
  id: string;
  name: string;
  value: string;
  status: 'good' | 'warning' | 'critical';
  change: string;
}

interface PromotionRequest {
  id: string;
  employeeName: string;
  currentRole: string;
  requestedRole: string;
  manager: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  justification: string;
}

interface CompanyMetric {
  totalEmployees: number;
  totalBudget: number;
  budgetUsed: number;
  activeProjects: number;
  overallPerformance: number;
}

export default function AdminDashboard() {
  const { user } = useUser();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [promotionRequests, setPromotionRequests] = useState<PromotionRequest[]>([]);
  const [companyMetrics, setCompanyMetrics] = useState<CompanyMetric | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Mock data for admin dashboard
      setDepartments([
        {
          id: '1',
          name: 'Engineering',
          manager: 'Alice Johnson',
          employees: 25,
          budget: 150000,
          budgetUsed: 95000,
          performance: 88
        },
        {
          id: '2',
          name: 'Design',
          manager: 'Bob Wilson',
          employees: 12,
          budget: 80000,
          budgetUsed: 52000,
          performance: 92
        },
        {
          id: '3',
          name: 'Marketing',
          manager: 'Carol Davis',
          employees: 18,
          budget: 100000,
          budgetUsed: 75000,
          performance: 85
        },
        {
          id: '4',
          name: 'Sales',
          manager: 'David Brown',
          employees: 20,
          budget: 120000,
          budgetUsed: 88000,
          performance: 90
        },
        {
          id: '5',
          name: 'Operations',
          manager: 'Emma Smith',
          employees: 15,
          budget: 90000,
          budgetUsed: 67000,
          performance: 86
        }
      ]);

      setSystemMetrics([
        {
          id: '1',
          name: 'Server Uptime',
          value: '99.9%',
          status: 'good',
          change: '+0.1%'
        },
        {
          id: '2',
          name: 'Database Performance',
          value: '2.3ms',
          status: 'good',
          change: '-0.2ms'
        },
        {
          id: '3',
          name: 'Active Users',
          value: '1,247',
          status: 'good',
          change: '+12%'
        },
        {
          id: '4',
          name: 'Error Rate',
          value: '0.02%',
          status: 'warning',
          change: '+0.01%'
        },
        {
          id: '5',
          name: 'Storage Usage',
          value: '78%',
          status: 'warning',
          change: '+5%'
        }
      ]);

      setPromotionRequests([
        {
          id: '1',
          employeeName: 'John Doe',
          currentRole: 'Employee',
          requestedRole: 'Senior Employee',
          manager: 'Alice Johnson',
          date: '2025-09-01',
          status: 'pending',
          justification: 'Consistently exceeds performance targets and demonstrates leadership qualities'
        },
        {
          id: '2',
          employeeName: 'Jane Smith',
          currentRole: 'Senior Employee',
          requestedRole: 'Manager',
          manager: 'Bob Wilson',
          date: '2025-08-30',
          status: 'pending',
          justification: 'Successfully led multiple projects and mentored junior team members'
        },
        {
          id: '3',
          employeeName: 'Mike Johnson',
          currentRole: 'Intern',
          requestedRole: 'Employee',
          manager: 'Carol Davis',
          date: '2025-08-28',
          status: 'approved',
          justification: 'Completed all training requirements and delivered excellent work quality'
        }
      ]);

      setCompanyMetrics({
        totalEmployees: 90,
        totalBudget: 540000,
        budgetUsed: 377000,
        activeProjects: 24,
        overallPerformance: 88
      });

      setNotifications([
        {
          id: '1',
          type: 'promotion',
          message: '2 promotion requests pending review',
          time: '1 hour ago',
          read: false
        },
        {
          id: '2',
          type: 'system',
          message: 'Storage usage approaching 80% capacity',
          time: '2 hours ago',
          read: false
        },
        {
          id: '3',
          type: 'budget',
          message: 'Engineering department budget 63% utilized',
          time: '3 hours ago',
          read: true
        },
        {
          id: '4',
          type: 'security',
          message: 'Security audit completed successfully',
          time: '1 day ago',
          read: true
        }
      ]);

    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromotionRequest = () => {
    alert('Promotion request feature coming soon!');
  };

  const approvePromotion = (requestId: string) => {
    setPromotionRequests(prev =>
      prev.map(request =>
        request.id === requestId
          ? { ...request, status: 'approved' as const }
          : request
      )
    );
  };

  const rejectPromotion = (requestId: string) => {
    setPromotionRequests(prev =>
      prev.map(request =>
        request.id === requestId
          ? { ...request, status: 'rejected' as const }
          : request
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'bg-green-100 text-green-800';
    if (performance >= 80) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nextgen-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-orange-100 text-orange-800 text-sm px-3 py-1">
            🟠 Admin Level 4
          </Badge>
          <Button onClick={handlePromotionRequest} variant="outline" size="sm">
            <ArrowUp className="w-4 h-4 mr-2" />
            Request Promotion
          </Button>
        </div>
      </div>

      {/* Company Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold">{companyMetrics?.totalEmployees}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Budget Usage</p>
              <p className="text-2xl font-bold">
                {companyMetrics ? Math.round((companyMetrics.budgetUsed / companyMetrics.totalBudget) * 100) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Target className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold">{companyMetrics?.activeProjects}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overall Performance</p>
              <p className="text-2xl font-bold">{companyMetrics?.overallPerformance}%</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Building className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Departments</p>
              <p className="text-2xl font-bold">{departments.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Department Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departments.map((dept) => (
                <div key={dept.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{dept.name}</h3>
                      <p className="text-sm text-gray-600">Manager: {dept.manager}</p>
                    </div>
                    <Badge className={getPerformanceColor(dept.performance)}>
                      {dept.performance}%
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-600">Employees: </span>
                      <span className="font-medium">{dept.employees}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Budget Used: </span>
                      <span className="font-medium">
                        {Math.round((dept.budgetUsed / dept.budget) * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full ${
                        (dept.budgetUsed / dept.budget) > 0.8 ? 'bg-red-600' :
                        (dept.budgetUsed / dept.budget) > 0.6 ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${(dept.budgetUsed / dept.budget) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>${dept.budgetUsed.toLocaleString()} used</span>
                    <span>${dept.budget.toLocaleString()} total</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              System Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemMetrics.map((metric) => (
                <div key={metric.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{metric.name}</h3>
                    <Badge className={getStatusColor(metric.status)}>
                      {metric.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{metric.value}</span>
                    <span className={`text-sm ${
                      metric.change.startsWith('+') && metric.status === 'good' ? 'text-green-600' :
                      metric.change.startsWith('-') && metric.status === 'good' ? 'text-green-600' :
                      'text-orange-600'
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Promotion Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Promotion Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {promotionRequests.filter(r => r.status === 'pending').map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{request.employeeName}</h3>
                      <p className="text-sm text-gray-600">
                        {request.currentRole} → {request.requestedRole}
                      </p>
                      <p className="text-sm text-gray-500">Manager: {request.manager}</p>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {request.justification}
                  </p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-500">
                      Requested: {new Date(request.date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => approvePromotion(request.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => rejectPromotion(request.id)}
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
              
              {promotionRequests.filter(r => r.status === 'pending').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No pending promotion requests
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              System Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className={`border rounded-lg p-4 ${
                  !notification.read ? 'bg-blue-50 border-blue-200' : ''
                }`}>
                  <div className="flex items-start gap-3">
                    {notification.type === 'promotion' && <Award className="w-5 h-5 text-purple-600 mt-0.5" />}
                    {notification.type === 'system' && <Database className="w-5 h-5 text-blue-600 mt-0.5" />}
                    {notification.type === 'budget' && <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />}
                    {notification.type === 'security' && <Shield className="w-5 h-5 text-red-600 mt-0.5" />}
                    
                    <div className="flex-1">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                    
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Administrative Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Administrative Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col">
              <Users className="w-6 h-6 mb-2" />
              <span>User Management</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <DollarSign className="w-6 h-6 mb-2" />
              <span>Budget Management</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <Settings className="w-6 h-6 mb-2" />
              <span>System Settings</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <Shield className="w-6 h-6 mb-2" />
              <span>Security Audit</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <BarChart3 className="w-6 h-6 mb-2" />
              <span>Analytics</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <Globe className="w-6 h-6 mb-2" />
              <span>Global Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Company Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">88%</div>
              <div className="text-sm text-gray-600">Overall Performance</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">70%</div>
              <div className="text-sm text-gray-600">Budget Utilization</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">24</div>
              <div className="text-sm text-gray-600">Active Projects</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">90</div>
              <div className="text-sm text-gray-600">Total Employees</div>
            </div>
          </div>
          
          <div className="mt-6">
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                Company performance is strong with 88% overall rating. Engineering and Design departments are leading in performance metrics.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
