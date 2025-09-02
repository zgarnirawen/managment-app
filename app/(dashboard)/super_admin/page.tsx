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
  Building,
  Crown,
  Lock,
  Server,
  AlertTriangle,
  Eye
} from 'lucide-react';

interface GlobalMetric {
  id: string;
  name: string;
  value: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  change: string;
  trend: 'up' | 'down' | 'stable';
}

interface SecurityAlert {
  id: string;
  type: 'high' | 'medium' | 'low';
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface SystemHealth {
  servers: number;
  uptime: string;
  performance: number;
  security: number;
  backup: string;
}

interface CompanyOverview {
  totalUsers: number;
  totalRevenue: number;
  totalBudget: number;
  globalPerformance: number;
  departments: number;
  activeProjects: number;
}

export default function SuperAdminDashboard() {
  const { user } = useUser();
  const [globalMetrics, setGlobalMetrics] = useState<GlobalMetric[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [companyOverview, setCompanyOverview] = useState<CompanyOverview | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuperAdminData();
  }, []);

  const loadSuperAdminData = async () => {
    try {
      setLoading(true);
      
      // Mock data for super admin dashboard
      setGlobalMetrics([
        {
          id: '1',
          name: 'Global System Health',
          value: '99.97%',
          status: 'excellent',
          change: '+0.02%',
          trend: 'up'
        },
        {
          id: '2',
          name: 'Total Active Users',
          value: '12,847',
          status: 'excellent',
          change: '+8.5%',
          trend: 'up'
        },
        {
          id: '3',
          name: 'Security Score',
          value: '98/100',
          status: 'excellent',
          change: '+2',
          trend: 'up'
        },
        {
          id: '4',
          name: 'Revenue Growth',
          value: '+15.2%',
          status: 'excellent',
          change: '+2.1%',
          trend: 'up'
        },
        {
          id: '5',
          name: 'Database Performance',
          value: '1.8ms',
          status: 'good',
          change: '-0.3ms',
          trend: 'up'
        },
        {
          id: '6',
          name: 'Backup Status',
          value: '100%',
          status: 'excellent',
          change: '0%',
          trend: 'stable'
        }
      ]);

      setSecurityAlerts([
        {
          id: '1',
          type: 'medium',
          message: 'Unusual login pattern detected from IP 192.168.1.100',
          timestamp: '2025-09-02T14:30:00Z',
          resolved: false
        },
        {
          id: '2',
          type: 'low',
          message: 'SSL certificate expires in 30 days',
          timestamp: '2025-09-02T09:15:00Z',
          resolved: false
        },
        {
          id: '3',
          type: 'high',
          message: 'Failed authentication attempts exceeded threshold',
          timestamp: '2025-09-01T22:45:00Z',
          resolved: true
        }
      ]);

      setSystemHealth({
        servers: 12,
        uptime: '99.97%',
        performance: 95,
        security: 98,
        backup: 'Completed 2 hours ago'
      });

      setCompanyOverview({
        totalUsers: 12847,
        totalRevenue: 2500000,
        totalBudget: 1800000,
        globalPerformance: 92,
        departments: 8,
        activeProjects: 45
      });

      setNotifications([
        {
          id: '1',
          type: 'security',
          message: 'Security audit completed - 98/100 score',
          time: '30 minutes ago',
          read: false,
          priority: 'high'
        },
        {
          id: '2',
          type: 'system',
          message: 'Automatic backup completed successfully',
          time: '2 hours ago',
          read: false,
          priority: 'medium'
        },
        {
          id: '3',
          type: 'performance',
          message: 'System performance improved by 5%',
          time: '4 hours ago',
          read: true,
          priority: 'low'
        },
        {
          id: '4',
          type: 'alert',
          message: 'Database optimization scheduled for tonight',
          time: '6 hours ago',
          read: true,
          priority: 'medium'
        }
      ]);

    } catch (error) {
      console.error('Error loading super admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveSecurityAlert = (alertId: string) => {
    setSecurityAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId
          ? { ...alert, resolved: true }
          : alert
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-emerald-100 text-emerald-800';
      case 'good': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      case 'stable': return <div className="w-4 h-4 border-b-2 border-gray-400"></div>;
      default: return null;
    }
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
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Crown className="w-8 h-8 text-yellow-600" />
            Super Admin Dashboard
          </h1>
          <p className="text-gray-600">Ultimate system control and oversight</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm px-3 py-1">
            👑 Super Admin Level 5
          </Badge>
          <Button variant="outline" size="sm">
            <Lock className="w-4 h-4 mr-2" />
            Security Center
          </Button>
        </div>
      </div>

      {/* Global System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {globalMetrics.map((metric) => (
          <Card key={metric.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge className={getStatusColor(metric.status)} variant="secondary">
                  {metric.status}
                </Badge>
                {getTrendIcon(metric.trend)}
              </div>
              <div className="text-2xl font-bold mb-1">{metric.value}</div>
              <div className="text-sm text-gray-600 mb-2">{metric.name}</div>
              <div className={`text-xs ${
                metric.change.startsWith('+') ? 'text-green-600' : 
                metric.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'
              }`}>
                {metric.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              System Health Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{systemHealth?.servers}</div>
                  <div className="text-sm text-gray-600">Active Servers</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{systemHealth?.uptime}</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">System Performance</span>
                    <span className="text-sm text-gray-600">{systemHealth?.performance}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-full" 
                      style={{ width: `${systemHealth?.performance}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Security Score</span>
                    <span className="text-sm text-gray-600">{systemHealth?.security}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full" 
                      style={{ width: `${systemHealth?.security}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Last backup: {systemHealth?.backup}. All systems operating normally.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Security Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {securityAlerts.map((alert) => (
                <div key={alert.id} className={`border rounded-lg p-4 ${getAlertColor(alert.type)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {alert.type === 'high' && <AlertTriangle className="w-5 h-5" />}
                      {alert.type === 'medium' && <AlertCircle className="w-5 h-5" />}
                      {alert.type === 'low' && <Eye className="w-5 h-5" />}
                      <Badge variant="secondary" className="capitalize">
                        {alert.type}
                      </Badge>
                    </div>
                    {alert.resolved && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  
                  <p className="text-sm mb-2">{alert.message}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                    {!alert.resolved && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => resolveSecurityAlert(alert.id)}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full">
                <Shield className="w-4 h-4 mr-2" />
                View All Security Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Global Company Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {companyOverview?.totalUsers.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                ${(companyOverview?.totalRevenue || 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                ${(companyOverview?.totalBudget || 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Budget</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {companyOverview?.globalPerformance}%
              </div>
              <div className="text-sm text-gray-600">Performance</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">
                {companyOverview?.departments}
              </div>
              <div className="text-sm text-gray-600">Departments</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600">
                {companyOverview?.activeProjects}
              </div>
              <div className="text-sm text-gray-600">Projects</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Super Admin Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5" />
              Super Admin Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex flex-col">
                <Database className="w-6 h-6 mb-2" />
                <span>Database Management</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <Server className="w-6 h-6 mb-2" />
                <span>Server Configuration</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <Shield className="w-6 h-6 mb-2" />
                <span>Security Center</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <Globe className="w-6 h-6 mb-2" />
                <span>Global Settings</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <Users className="w-6 h-6 mb-2" />
                <span>User Management</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <BarChart3 className="w-6 h-6 mb-2" />
                <span>Analytics Hub</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Critical Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Critical Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className={`border rounded-lg p-4 ${
                  !notification.read ? 'bg-red-50 border-red-200' : ''
                } ${notification.priority === 'high' ? 'border-l-4 border-l-red-500' : 
                    notification.priority === 'medium' ? 'border-l-4 border-l-yellow-500' : 
                    'border-l-4 border-l-blue-500'}`}>
                  <div className="flex items-start gap-3">
                    {notification.type === 'security' && <Shield className="w-5 h-5 text-red-600 mt-0.5" />}
                    {notification.type === 'system' && <Server className="w-5 h-5 text-blue-600 mt-0.5" />}
                    {notification.type === 'performance' && <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />}
                    {notification.type === 'alert' && <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">{notification.message}</p>
                        <Badge variant="secondary" className={`text-xs ${
                          notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                          notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                    </div>
                    
                    {!notification.read && (
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Actions */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Emergency Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="destructive" className="h-16 flex flex-col">
              <Lock className="w-6 h-6 mb-2" />
              <span>Emergency Lockdown</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col border-orange-300">
              <Database className="w-6 h-6 mb-2" />
              <span>Force Backup</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col border-yellow-300">
              <Server className="w-6 h-6 mb-2" />
              <span>System Restart</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col border-blue-300">
              <Shield className="w-6 h-6 mb-2" />
              <span>Security Scan</span>
            </Button>
          </div>
          
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Emergency actions require additional authentication and will be logged. Use only when necessary.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
