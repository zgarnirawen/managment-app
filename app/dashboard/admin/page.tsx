'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Bell, 
  Award,
  BarChart3,
  Clock,
  MessageSquare,
  Settings,
  LogOut,
  Shield,
  Database,
  Activity
} from 'lucide-react';
import PromotionSystem from '../../components/PromotionSystem';
import SecuritySystem from '../../components/SecuritySystem';
import DepartmentSystem from '../../components/DepartmentSystem';

interface DashboardStats {
  totalEmployees: number;
  totalManagers: number;
  pendingPromotion: number;
  systemAlerts: number;
}

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalManagers: 0,
    pendingPromotion: 0,
    systemAlerts: 0
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      const userRole = user.unsafeMetadata?.role;
      if (userRole !== 'admin') {
        router.push('/dashboard');
        return;
      }
      fetchDashboardData();
    }
  }, [isLoaded, user, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      const employees = data.employees || [];
      
      setStats({
        totalEmployees: employees.length,
        totalManagers: employees.filter((emp: any) => emp.role === 'manager').length,
        pendingPromotion: employees.filter((emp: any) => 
          ['intern', 'employee', 'manager'].includes(emp.role)).length,
        systemAlerts: 2 // Mock data
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
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
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'promotions', label: 'Promotions', icon: Award },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'teams', label: 'Team Management', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: Database },
    { id: 'reports', label: 'Reports', icon: TrendingUp }
  ];

  const StatCard = ({ title, value, icon: Icon, trend, color, description }: any) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{description}</p>
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
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-orange-600" />
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
              <p className="text-gray-600">System Administration - Welcome back, {user?.firstName}!</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button 
                onClick={() => router.push('/settings')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={() => router.push('/sign-out')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Employees"
                value={stats.totalEmployees}
                description="All system users"
                icon={Users}
                trend={8}
                color="bg-blue-500"
              />
              <StatCard
                title="Managers"
                value={stats.totalManagers}
                description="Active managers"
                icon={Shield}
                trend={15}
                color="bg-green-500"
              />
              <StatCard
                title="Promotion Queue"
                value={stats.pendingPromotion}
                description="Ready for promotion"
                icon={Award}
                trend={22}
                color="bg-yellow-500"
              />
              <StatCard
                title="System Alerts"
                value={stats.systemAlerts}
                description="Requires attention"
                icon={Activity}
                trend={-10}
                color="bg-red-500"
              />
            </div>

            {/* Admin Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <button 
                  onClick={() => setActiveTab('departments')}
                  className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span className="font-medium text-indigo-900">Departments</span>
                </button>
                <button 
                  onClick={() => setActiveTab('promotions')}
                  className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <Award className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-orange-900">Promotions</span>
                </button>
                <button 
                  onClick={() => setActiveTab('users')}
                  className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">User Management</span>
                </button>
                <button 
                  onClick={() => setActiveTab('system')}
                  className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Database className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-900">System Config</span>
                </button>
                <button 
                  onClick={() => setActiveTab('reports')}
                  className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">Analytics</span>
                </button>
              </div>
            </div>

            {/* System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Healthy</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Authentication</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Notifications</span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Warning</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Backup</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Completed</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Admin Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">User role updated: Jane Doe → Manager</span>
                    <span className="text-xs text-gray-500 ml-auto">1 hour ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">System backup completed successfully</span>
                    <span className="text-xs text-gray-500 ml-auto">3 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">New user registration: John Smith</span>
                    <span className="text-xs text-gray-500 ml-auto">5 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'departments' && <DepartmentSystem userRole="admin" />}

        {activeTab === 'promotions' && <PromotionSystem />}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
            <p className="text-gray-600">Advanced user management features coming soon...</p>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Team Management</h3>
              <button
                onClick={() => router.push('/team-management')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Full Team Management
              </button>
            </div>
            
            {/* Team Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Total Teams</h4>
                <div className="text-2xl font-bold text-blue-700">8</div>
                <div className="text-sm text-blue-600">Active teams</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Team Members</h4>
                <div className="text-2xl font-bold text-green-700">{stats.totalEmployees}</div>
                <div className="text-sm text-green-600">Across all teams</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Managers</h4>
                <div className="text-2xl font-bold text-purple-700">{stats.totalManagers}</div>
                <div className="text-sm text-purple-600">Team leaders</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Departments</h4>
                <div className="text-2xl font-bold text-yellow-700">5</div>
                <div className="text-sm text-yellow-600">Active departments</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                onClick={() => setActiveTab('departments')}
                className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Database className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900">Department Management</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Configuration</h3>
            <p className="text-gray-600">System configuration panel coming soon...</p>
          </div>
        )}

        {activeTab === 'security' && (
          <SecuritySystem userRole="admin" />
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics & Reports</h3>
            <p className="text-gray-600">Advanced reporting features coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
