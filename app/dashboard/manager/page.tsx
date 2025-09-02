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
  Target,
  MessageSquare,
  Settings,
  LogOut
} from 'lucide-react';
import PromotionSystem from '../../components/PromotionSystem';
import TimeTrackingSystem from '../../components/TimeTrackingSystem';
import ProjectManagementSystem from '../../components/ProjectManagementSystem';
import CalendarSystem from '../../components/CalendarSystem';
import LeaveManagementSystem from '../../components/LeaveManagementSystem';
import FileManagementSystem from '../../components/FileManagementSystem';
import PayrollSystem from '../../components/PayrollSystem';

interface DashboardStats {
  totalEmployees: number;
  pendingPromotion: number;
  teamTasks: number;
  upcomingMeetings: number;
}

export default function ManagerDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    pendingPromotion: 0,
    teamTasks: 0,
    upcomingMeetings: 0
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      const userRole = user.unsafeMetadata?.role;
      if (userRole !== 'manager') {
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
      
      setStats({
        totalEmployees: data.employees?.length || 0,
        pendingPromotion: data.employees?.filter((emp: any) => 
          ['intern', 'employee'].includes(emp.role)).length || 0,
        teamTasks: 15, // Mock data
        upcomingMeetings: 3 // Mock data
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
    { id: 'time_tracking', label: 'Time & Attendance', icon: Clock },
    { id: 'projects', label: 'Projects & Tasks', icon: Target },
    { id: 'calendar', label: 'Calendar & Events', icon: Calendar },
    { id: 'leave', label: 'Leave Management', icon: Users },
    { id: 'files', label: 'File Management', icon: MessageSquare },
    { id: 'payroll', label: 'Payroll', icon: TrendingUp },
    { id: 'promotions', label: 'Promotions', icon: Award },
    { id: 'team', label: 'Team Management', icon: Users },
    { id: 'reports', label: 'Analytics', icon: TrendingUp }
  ];

  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
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
              <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
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
                      ? 'border-blue-500 text-blue-600'
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
                title="Team Members"
                value={stats.totalEmployees}
                icon={Users}
                trend={5}
                color="bg-blue-500"
              />
              <StatCard
                title="Promotion Ready"
                value={stats.pendingPromotion}
                icon={Award}
                trend={12}
                color="bg-green-500"
              />
              <StatCard
                title="Active Tasks"
                value={stats.teamTasks}
                icon={Clock}
                trend={-3}
                color="bg-yellow-500"
              />
              <StatCard
                title="Meetings Today"
                value={stats.upcomingMeetings}
                icon={Calendar}
                trend={0}
                color="bg-purple-500"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => setActiveTab('promotions')}
                  className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Award className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Review Promotions</span>
                </button>
                <button 
                  onClick={() => setActiveTab('team')}
                  className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">Manage Team</span>
                </button>
                <button 
                  onClick={() => setActiveTab('reports')}
                  className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-900">View Reports</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">New employee John Doe started today</span>
                  <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Task "Project Review" completed</span>
                  <span className="text-xs text-gray-500 ml-auto">4 hours ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Meeting scheduled for tomorrow</span>
                  <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'promotions' && <PromotionSystem />}

        {activeTab === 'team' && (
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
            
            {/* Quick Team Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Team Members</h4>
                <div className="text-2xl font-bold text-blue-700">{stats.totalEmployees}</div>
                <div className="text-sm text-blue-600">Active employees</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Active Projects</h4>
                <div className="text-2xl font-bold text-green-700">12</div>
                <div className="text-sm text-green-600">In progress</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Pending Tasks</h4>
                <div className="text-2xl font-bold text-yellow-700">{stats.teamTasks}</div>
                <div className="text-sm text-yellow-600">Requires attention</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => router.push('/team-management')}
                className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Manage Teams</span>
              </button>
              <button
                onClick={() => router.push('/dashboard/employees')}
                className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">View Employees</span>
              </button>
              <button
                onClick={() => router.push('/tasks/assign')}
                className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Target className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900">Assign Tasks</span>
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Team Settings</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <CalendarSystem 
            userRole="manager" 
            userId={user?.id || '1'} 
            teamMembers={[
              { id: '1', name: 'John Smith', email: 'john@company.com' },
              { id: '2', name: 'Maria Davis', email: 'maria@company.com' }
            ]} 
          />
        )}

        {activeTab === 'leave' && (
          <LeaveManagementSystem 
            userRole="manager" 
            userId={user?.id || '1'} 
            employeeName={user?.fullName || 'Manager'} 
          />
        )}

        {activeTab === 'files' && (
          <FileManagementSystem 
            userRole="manager" 
            userId={user?.id || '1'} 
            userName={user?.fullName || 'Manager'} 
          />
        )}

        {activeTab === 'payroll' && (
          <PayrollSystem 
            userRole="manager" 
            userId={user?.id || '1'} 
            userName={user?.fullName || 'Manager'} 
          />
        )}

        {activeTab === 'time_tracking' && (
          <TimeTrackingSystem userRole="manager" currentUserId={user?.id || '1'} />
        )}

        {activeTab === 'projects' && (
          <ProjectManagementSystem userRole="manager" currentUserId={user?.id || '1'} />
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Analytics Overview */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Team Analytics</h3>
              
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Task Completion Rate</h4>
                  <div className="text-2xl font-bold text-blue-700">87%</div>
                  <div className="text-sm text-blue-600">+5% from last month</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Team Productivity</h4>
                  <div className="text-2xl font-bold text-green-700">94%</div>
                  <div className="text-sm text-green-600">+12% from last month</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">Employee Satisfaction</h4>
                  <div className="text-2xl font-bold text-purple-700">4.8/5</div>
                  <div className="text-sm text-purple-600">+0.3 from last month</div>
                </div>
              </div>

              {/* Team Performance Chart */}
              <div className="mb-8">
                <h4 className="font-medium text-gray-900 mb-4">Team Performance Trends</h4>
                <div className="bg-gray-50 h-64 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Analytics dashboard visualization</p>
                    <p className="text-sm text-gray-500">Charts integration coming soon</p>
                  </div>
                </div>
              </div>

              {/* Team Members Performance */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Individual Performance</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                        JS
                      </div>
                      <div>
                        <div className="font-medium">John Smith</div>
                        <div className="text-sm text-gray-600">Senior Employee</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">98% Efficiency</div>
                      <div className="text-sm text-gray-600">15 tasks completed</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                        MD
                      </div>
                      <div>
                        <div className="font-medium">Maria Davis</div>
                        <div className="text-sm text-gray-600">Employee</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-blue-600">85% Efficiency</div>
                      <div className="text-sm text-gray-600">12 tasks completed</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium">
                        RJ
                      </div>
                      <div>
                        <div className="font-medium">Robert Johnson</div>
                        <div className="text-sm text-gray-600">Intern</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-yellow-600">76% Efficiency</div>
                      <div className="text-sm text-gray-600">8 tasks completed</div>
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
