'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Calendar, 
  Bell, 
  Settings,
  LogOut,
  MessageSquare,
  Target,
  Clock,
  TrendingUp,
  CheckCircle,
  Star,
  Award,
  Mail,
  Video,
  FileText,
  BarChart3,
  Trophy
} from 'lucide-react';
import GamificationSystem from '../components/GamificationSystem';
import ChatSystem from '../components/ChatSystem';
import TimeTrackingSystem from '../components/TimeTrackingSystem';
import ProjectManagementSystem from '../components/ProjectManagementSystem';
import CalendarSystem from '../components/CalendarSystem';
import LeaveManagementSystem from '../components/LeaveManagementSystem';
import FileManagementSystem from '../components/FileManagementSystem';

interface DashboardStats {
  tasksCompleted: number;
  projectsActive: number;
  hoursWorked: number;
  teamMeetings: number;
}

export default function EmployeeDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    tasksCompleted: 15,
    projectsActive: 3,
    hoursWorked: 42,
    teamMeetings: 8
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      const userRole = user.unsafeMetadata?.role;
      if (userRole !== 'employee') {
        router.push('/dashboard');
        return;
      }
      fetchDashboardData();
    }
  }, [isLoaded, user, router]);

  const fetchDashboardData = async () => {
    try {
      // Mock data - in real app, fetch from API
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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
    { id: 'time_tracking', label: 'Time Tracking', icon: Clock },
    { id: 'tasks', label: 'Tasks & Projects', icon: Target },
    { id: 'communication', label: 'Communication', icon: MessageSquare },
    { id: 'calendar', label: 'Calendar & Events', icon: Calendar },
    { id: 'leave', label: 'Leave Requests', icon: Users },
    { id: 'files', label: 'My Files', icon: FileText },
    { id: 'progress', label: 'Progress & Rewards', icon: Trophy }
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
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">👤</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Employee Dashboard</h1>
                  <p className="text-blue-200">Welcome back, {user?.firstName}! Ready to make an impact?</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg px-3 py-2">
                <p className="text-blue-100 text-sm font-medium">👤 Employee</p>
              </div>
              <button className="relative p-2 text-blue-200 hover:text-white hover:bg-blue-600 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button 
                onClick={() => router.push('/settings')}
                className="p-2 text-blue-200 hover:text-white hover:bg-blue-600 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={() => router.push('/sign-out')}
                className="p-2 text-blue-200 hover:text-white hover:bg-blue-600 rounded-lg transition-colors"
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
                title="Tasks Completed"
                value={stats.tasksCompleted}
                subtitle="This month"
                trend={12}
                icon={CheckCircle}
                color="bg-green-500"
              />
              <StatCard
                title="Active Projects"
                value={stats.projectsActive}
                subtitle="Currently assigned"
                trend={0}
                icon={Target}
                color="bg-blue-500"
              />
              <StatCard
                title="Hours Worked"
                value={stats.hoursWorked}
                subtitle="This week"
                trend={8}
                icon={Clock}
                color="bg-purple-500"
              />
              <StatCard
                title="Team Meetings"
                value={stats.teamMeetings}
                subtitle="This month"
                trend={-5}
                icon={Users}
                color="bg-orange-500"
              />
            </div>

            {/* Employee Features */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Features</h3>
              <p className="text-gray-600 mb-4">
                As an employee, you now have access to enhanced collaboration tools and can participate in team projects.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => setActiveTab('communication')}
                  className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <div className="text-left">
                    <span className="font-medium text-blue-900 block">Team Chat</span>
                    <span className="text-sm text-blue-700">Collaborate with your team</span>
                  </div>
                </button>
                <button 
                  onClick={() => setActiveTab('calendar')}
                  className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Calendar className="w-5 h-5 text-green-600" />
                  <div className="text-left">
                    <span className="font-medium text-green-900 block">Schedule Meetings</span>
                    <span className="text-sm text-green-700">Book and manage meetings</span>
                  </div>
                </button>
                <button 
                  onClick={() => setActiveTab('tasks')}
                  className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Target className="w-5 h-5 text-purple-600" />
                  <div className="text-left">
                    <span className="font-medium text-purple-900 block">Project Tasks</span>
                    <span className="text-sm text-purple-700">Manage your projects</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Completed "API Integration" task</span>
                    <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Joined team standup meeting</span>
                    <span className="text-xs text-gray-500 ml-auto">4 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Updated project documentation</span>
                    <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Project Review Meeting</p>
                      <p className="text-xs text-gray-500">Tomorrow at 10:00 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                    <Video className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Team Video Call</p>
                      <p className="text-xs text-gray-500">Friday at 2:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Quarterly Report Due</p>
                      <p className="text-xs text-gray-500">Next Monday</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'time_tracking' && (
          <TimeTrackingSystem userRole="employee" currentUserId={user?.id || '1'} />
        )}

        {activeTab === 'tasks' && (
          <ProjectManagementSystem userRole="employee" currentUserId={user?.id || '1'} />
        )}

        {activeTab === 'communication' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Team Communication
              </h3>
              <ChatSystem />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-green-600" />
                  Email System
                </h3>
                <p className="text-gray-600 mb-4">
                  Send and receive emails within the organization. Manage your communications efficiently.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Unread Messages</span>
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">3</span>
                  </div>
                  <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Open Email
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5 text-purple-600" />
                  Video Meetings
                </h3>
                <p className="text-gray-600 mb-4">
                  Schedule and join video conferences with your team. Perfect for remote collaboration.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Next Meeting</span>
                    <span className="text-sm text-blue-600 font-medium">Today 2:00 PM</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      Schedule
                    </button>
                    <button className="flex-1 px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
                      Join
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <CalendarSystem 
            userRole="employee" 
            userId={user?.id || '1'} 
            teamMembers={[]} 
          />
        )}

        {activeTab === 'leave' && (
          <LeaveManagementSystem 
            userRole="employee" 
            userId={user?.id || '1'} 
            employeeName={user?.fullName || 'Employee'} 
          />
        )}

        {activeTab === 'files' && (
          <FileManagementSystem 
            userRole="employee" 
            userId={user?.id || '1'} 
            userName={user?.fullName || 'Employee'} 
          />
        )}

        {activeTab === 'progress' && <GamificationSystem />}
      </div>
    </div>
  );
}
