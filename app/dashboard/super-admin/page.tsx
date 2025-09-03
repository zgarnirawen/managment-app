'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Crown, 
  Users, 
  TrendingUp, 
  Shield, 
  Settings,
  BarChart3,
  UserPlus,
  UserMinus,
  Database,
  Activity,
  Globe,
  Lock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import SecuritySystem from '../../components/SecuritySystem';
import PayrollSystem from '../../components/PayrollSystem';

interface GlobalStats {
  totalUsers: number;
  totalAdmins: number;
  totalManagers: number;
  totalEmployees: number;
  totalInterns: number;
  activeProjects: number;
  systemHealth: string;
}

export default function SuperAdminDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<GlobalStats>({
    totalUsers: 0,
    totalAdmins: 0,
    totalManagers: 0,
    totalEmployees: 0,
    totalInterns: 0,
    activeProjects: 0,
    systemHealth: 'excellent'
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [adminCandidates, setAdminCandidates] = useState<any[]>([]);
  const [transferCandidate, setTransferCandidate] = useState<string>('');

  useEffect(() => {
    if (isLoaded && user) {
      const userRole = user.unsafeMetadata?.role;
      if (userRole !== 'super_admin') {
        router.push('/dashboard');
        return;
      }
      fetchGlobalData();
    }
  }, [isLoaded, user, router]);

  const fetchGlobalData = async () => {
    try {
      // Mock data - replace with actual API calls
      setStats({
        totalUsers: 127,
        totalAdmins: 3,
        totalManagers: 12,
        totalEmployees: 98,
        totalInterns: 14,
        activeProjects: 23,
        systemHealth: 'excellent'
      });

      setAdminCandidates([
        { id: '1', name: 'John Manager', role: 'manager', department: 'Engineering' },
        { id: '2', name: 'Sarah Lead', role: 'manager', department: 'Marketing' },
        { id: '3', name: 'Mike Senior', role: 'manager', department: 'Sales' }
      ]);
    } catch (error) {
      console.error('Failed to fetch global data:', error);
    } finally {
      setLoading(false);
    }
  };

  const promoteToAdmin = async (userId: string) => {
    try {
      // Implementation for promoting user to admin
      console.log('Promoting user to admin:', userId);
      // API call to update user role
      // Refresh data
      fetchGlobalData();
    } catch (error) {
      console.error('Failed to promote user:', error);
    }
  };

  const revokeAdminRole = async (userId: string) => {
    try {
      // Implementation for revoking admin role
      console.log('Revoking admin role:', userId);
      // API call to update user role
      // Refresh data
      fetchGlobalData();
    } catch (error) {
      console.error('Failed to revoke admin role:', error);
    }
  };

  const transferSuperAdminRole = async (newSuperAdminId: string) => {
    try {
      // Implementation for transferring super admin role
      console.log('Transferring super admin role to:', newSuperAdminId);
      // API call to transfer role
      // Redirect to dashboard after transfer
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to transfer super admin role:', error);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Global Overview', icon: Globe },
    { id: 'user_management', label: 'User Management', icon: Users },
    { id: 'team_management', label: 'Team Management', icon: Users },
    { id: 'admin_control', label: 'Admin Control', icon: Crown },
    { id: 'system_monitor', label: 'System Monitor', icon: Activity },
    { id: 'security', label: 'Security Center', icon: Shield },
    { id: 'payroll', label: 'Global Payroll', icon: BarChart3 },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }: any) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          {trend && (
            <p className={`text-sm mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Crown className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Global system control and management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-yellow-50 px-3 py-2 rounded-full">
                <Crown className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-yellow-800">Super Administrator</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="bg-blue-500"
            subtitle="Platform users"
            trend={8}
          />
          <StatCard
            title="Active Projects"
            value={stats.activeProjects}
            icon={BarChart3}
            color="bg-green-500"
            subtitle="Company-wide"
            trend={12}
          />
          <StatCard
            title="System Health"
            value="Excellent"
            icon={Activity}
            color="bg-purple-500"
            subtitle="All systems operational"
          />
          <StatCard
            title="Total Admins"
            value={stats.totalAdmins}
            icon={Crown}
            color="bg-yellow-500"
            subtitle="Administrative users"
          />
        </div>

        {/* Role Distribution */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Crown className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-900">1</p>
              <p className="text-sm text-yellow-700">Super Admin</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <Shield className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-900">{stats.totalAdmins}</p>
              <p className="text-sm text-red-700">Admins</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-900">{stats.totalManagers}</p>
              <p className="text-sm text-blue-700">Managers</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <UserPlus className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-900">{stats.totalEmployees}</p>
              <p className="text-sm text-green-700">Employees</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <UserMinus className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-900">{stats.totalInterns}</p>
              <p className="text-sm text-purple-700">Interns</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                    activeTab === tab.id
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* System Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Database</p>
                    <p className="text-xs text-green-700">Operational</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Authentication</p>
                    <p className="text-xs text-green-700">Operational</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-900">File Storage</p>
                    <p className="text-xs text-green-700">Operational</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Global Activity</h3>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">New user registration</p>
                        <p className="text-xs text-gray-500">2 minutes ago</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">System</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin_control' && (
          <div className="space-y-6">
            {/* Admin Management */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Role Management</h3>
              
              {/* Promote to Admin */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Promote Manager to Admin</h4>
                <div className="space-y-3">
                  {adminCandidates.map((candidate) => (
                    <div key={candidate.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{candidate.name}</p>
                        <p className="text-sm text-gray-500">{candidate.department} - {candidate.role}</p>
                      </div>
                      <button
                        onClick={() => promoteToAdmin(candidate.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Promote to Admin
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Super Admin Transfer */}
              <div className="border-t pt-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Transfer Super Admin Role</h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Warning</p>
                      <p className="text-sm text-yellow-700">
                        Transferring Super Admin role will revoke your current privileges and redirect you to the standard dashboard.
                      </p>
                    </div>
                  </div>
                </div>
                <select
                  value={transferCandidate}
                  onChange={(e) => setTransferCandidate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Select Admin to transfer role to...</option>
                  <option value="admin1">Admin User 1</option>
                  <option value="admin2">Admin User 2</option>
                </select>
                <button
                  onClick={() => transferCandidate && transferSuperAdminRole(transferCandidate)}
                  disabled={!transferCandidate}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 flex items-center"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Transfer Super Admin Role
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team_management' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Global Team Management</h3>
              <button
                onClick={() => router.push('/team-management')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Access Full Team Management
              </button>
            </div>
            
            {/* Global Team Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Total Teams</h4>
                <div className="text-2xl font-bold text-blue-700">15</div>
                <div className="text-sm text-blue-600">Across all departments</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Managers</h4>
                <div className="text-2xl font-bold text-green-700">{stats.totalManagers}</div>
                <div className="text-sm text-green-600">Team leaders</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Employees</h4>
                <div className="text-2xl font-bold text-purple-700">{stats.totalEmployees}</div>
                <div className="text-sm text-purple-600">Team members</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Interns</h4>
                <div className="text-2xl font-bold text-yellow-700">{stats.totalInterns}</div>
                <div className="text-sm text-yellow-600">In training</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">Admins</h4>
                <div className="text-2xl font-bold text-red-700">{stats.totalAdmins}</div>
                <div className="text-sm text-red-600">System administrators</div>
              </div>
            </div>

            {/* Global Team Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4">Team Distribution by Department</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Engineering</span>
                    <span className="text-sm font-medium text-gray-900">5 teams (45 members)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Marketing</span>
                    <span className="text-sm font-medium text-gray-900">3 teams (22 members)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sales</span>
                    <span className="text-sm font-medium text-gray-900">4 teams (28 members)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">HR</span>
                    <span className="text-sm font-medium text-gray-900">2 teams (15 members)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Finance</span>
                    <span className="text-sm font-medium text-gray-900">1 team (8 members)</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4">Team Performance Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Team Size</span>
                    <span className="text-sm font-medium text-gray-900">8.2 members</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Team Productivity</span>
                    <span className="text-sm font-medium text-green-600">92% efficiency</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Cross-team Collaboration</span>
                    <span className="text-sm font-medium text-blue-600">78% active</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Team Satisfaction</span>
                    <span className="text-sm font-medium text-purple-600">4.6/5.0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Management Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => router.push('/team-management')}
                className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Manage All Teams</span>
              </button>
              <button
                onClick={() => router.push('/dashboard/employees')}
                className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">Employee Directory</span>
              </button>
              <button
                onClick={() => setActiveTab('admin_control')}
                className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Crown className="w-5 h-5 text-red-600" />
                <span className="font-medium text-gray-900">Admin Management</span>
              </button>
              <button
                onClick={() => setActiveTab('system_monitor')}
                className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Activity className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900">System Monitor</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <SecuritySystem userRole="super_admin" />
        )}

        {activeTab === 'payroll' && (
          <PayrollSystem userRole="super_admin" userId={user?.id || '1'} userName={user?.fullName || 'Super Admin'} />
        )}

        {activeTab === 'system_monitor' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Monitoring</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Performance Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">CPU Usage</span>
                      <span className="text-sm font-medium text-green-600">23%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Memory Usage</span>
                      <span className="text-sm font-medium text-blue-600">67%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Database Load</span>
                      <span className="text-sm font-medium text-purple-600">45%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">System Health</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm text-gray-600">All services operational</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm text-gray-600">Database connectivity good</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm text-gray-600">No security alerts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
