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
  Activity,
  Crown,
  AlertTriangle,
  Key,
  UserCheck,
  Ban
} from 'lucide-react';
import PromotionSystem from '../components/PromotionSystem';

interface DashboardStats {
  totalEmployees: number;
  totalAdmins: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  pendingActions: number;
}

interface AdminCandidate {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  performance: number;
}

export default function SuperAdminDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalAdmins: 0,
    systemHealth: 'healthy',
    pendingActions: 2
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [adminCandidates, setAdminCandidates] = useState<AdminCandidate[]>([]);
  const [showSuccessionModal, setShowSuccessionModal] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      const userRole = user.unsafeMetadata?.role;
      if (userRole !== 'super_admin') {
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
        totalAdmins: employees.filter((emp: any) => emp.role === 'admin').length,
        systemHealth: 'healthy',
        pendingActions: 2
      });

      // Get manager-level employees who could be promoted to admin
      setAdminCandidates(
        employees
          .filter((emp: any) => emp.role === 'manager')
          .map((emp: any) => ({
            id: emp.id,
            name: emp.name,
            email: emp.email,
            role: emp.role,
            department: emp.department?.name || 'Unassigned',
            performance: Math.floor(Math.random() * 20) + 80 // Mock performance score
          }))
          .slice(0, 5)
      );
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const promoteToAdmin = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/employees/${employeeId}/promote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newRole: 'admin',
          reason: 'Promoted to Admin by Super Admin for system management responsibilities'
        })
      });

      if (response.ok) {
        await fetchDashboardData();
      } else {
        alert('Failed to promote to admin');
      }
    } catch (error) {
      console.error('Admin promotion failed:', error);
      alert('Failed to promote to admin');
    }
  };

  const initiateSuccession = () => {
    setShowSuccessionModal(true);
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
    { id: 'overview', label: 'System Overview', icon: Database },
    { id: 'admin-management', label: 'Admin Management', icon: Shield },
    { id: 'promotions', label: 'Global Promotions', icon: Award },
    { id: 'succession', label: 'Succession Planning', icon: Crown },
    { id: 'system-control', label: 'System Control', icon: Settings }
  ];

  const StatCard = ({ title, value, icon: Icon, trend, color, description, status }: any) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{description}</p>
          {status && (
            <div className={`inline-flex items-center gap-1 mt-1 px-2 py-1 rounded-full text-xs font-medium ${
              status === 'healthy' ? 'bg-green-100 text-green-800' :
              status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {status === 'healthy' ? '✅' : status === 'warning' ? '⚠️' : '🚨'} {status}
            </div>
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
      <div className="bg-gradient-to-r from-red-600 to-red-700 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Crown className="w-8 h-8 text-red-200" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Super Admin Control Center</h1>
                  <p className="text-red-200">Highest System Authority - Welcome, {user?.firstName}!</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-red-500/20 border border-red-400/30 rounded-lg px-3 py-2">
                <p className="text-red-100 text-sm font-medium">System Owner</p>
              </div>
              <button className="relative p-2 text-red-200 hover:text-white hover:bg-red-600 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                {stats.pendingActions > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center">
                    {stats.pendingActions}
                  </span>
                )}
              </button>
              <button 
                onClick={() => router.push('/settings')}
                className="p-2 text-red-200 hover:text-white hover:bg-red-600 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={() => router.push('/sign-out')}
                className="p-2 text-red-200 hover:text-white hover:bg-red-600 rounded-lg transition-colors"
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
                      ? 'border-red-500 text-red-600'
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
            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total System Users"
                value={stats.totalEmployees}
                description="All registered users"
                icon={Users}
                color="bg-blue-500"
              />
              <StatCard
                title="System Administrators"
                value={stats.totalAdmins}
                description="Active admin accounts"
                icon={Shield}
                color="bg-purple-500"
              />
              <StatCard
                title="System Health"
                value="Operational"
                description="All systems running"
                status={stats.systemHealth}
                icon={Activity}
                color="bg-green-500"
              />
              <StatCard
                title="Pending Actions"
                value={stats.pendingActions}
                description="Requires super admin"
                icon={AlertTriangle}
                color="bg-yellow-500"
              />
            </div>

            {/* Critical Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-red-600" />
                Super Admin Only Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => setActiveTab('admin-management')}
                  className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Shield className="w-5 h-5 text-red-600" />
                  <div className="text-left">
                    <span className="font-medium text-red-900 block">Promote to Admin</span>
                    <span className="text-sm text-red-700">Elevate managers to admin role</span>
                  </div>
                </button>
                <button 
                  onClick={initiateSuccession}
                  className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <Crown className="w-5 h-5 text-orange-600" />
                  <div className="text-left">
                    <span className="font-medium text-orange-900 block">Succession Planning</span>
                    <span className="text-sm text-orange-700">Plan super admin succession</span>
                  </div>
                </button>
                <button 
                  onClick={() => setActiveTab('system-control')}
                  className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Database className="w-5 h-5 text-gray-600" />
                  <div className="text-left">
                    <span className="font-medium text-gray-900 block">System Override</span>
                    <span className="text-sm text-gray-700">Emergency system controls</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Super Admin Activity */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Super Admin Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">System backup initiated and completed successfully</span>
                  <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">New admin promoted: Sarah Johnson</span>
                  <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">System configuration updated</span>
                  <span className="text-xs text-gray-500 ml-auto">3 days ago</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin-management' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                Admin Promotion Candidates
              </h3>
              <p className="text-gray-600 mb-6">
                Only Super Admins can promote managers to admin level. Choose carefully as admins have significant system privileges.
              </p>
              
              <div className="space-y-4">
                {adminCandidates.map((candidate) => (
                  <div key={candidate.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{candidate.name}</h4>
                        <p className="text-sm text-gray-600">{candidate.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {candidate.role}
                          </span>
                          <span className="text-sm text-gray-500">{candidate.department}</span>
                          <span className="text-sm text-green-600 font-medium">
                            Performance: {candidate.performance}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => promoteToAdmin(candidate.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Crown className="w-4 h-4" />
                      Promote to Admin
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'promotions' && <PromotionSystem />}

        {activeTab === 'succession' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-red-600" />
              Super Admin Succession Planning
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h4 className="font-medium text-yellow-800">Critical System Function</h4>
              </div>
              <p className="text-yellow-700 text-sm">
                Super Admin succession is a critical process. Only the current Super Admin can designate a successor. 
                This action transfers all system ownership and cannot be undone.
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => setShowSuccessionModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Crown className="w-4 h-4" />
                Initiate Succession Process
              </button>
              
              <div className="text-sm text-gray-600">
                <p>Current Super Admin: <strong>{user?.fullName}</strong></p>
                <p>Account Created: <strong>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</strong></p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system-control' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-red-600" />
              Emergency System Controls
            </h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h4 className="font-medium text-red-800">Emergency Controls Only</h4>
              </div>
              <p className="text-red-700 text-sm">
                These controls should only be used in emergency situations. All actions are logged and audited.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="flex items-center gap-2 p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                <Ban className="w-5 h-5 text-red-600" />
                <div className="text-left">
                  <span className="font-medium text-red-900 block">Emergency Lockdown</span>
                  <span className="text-sm text-red-700">Lock all user accounts</span>
                </div>
              </button>
              
              <button className="flex items-center gap-2 p-4 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                <Database className="w-5 h-5 text-orange-600" />
                <div className="text-left">
                  <span className="font-medium text-orange-900 block">Force Backup</span>
                  <span className="text-sm text-orange-700">Immediate system backup</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Succession Modal */}
      {showSuccessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Succession Planning</h3>
            <p className="text-gray-600 mb-6">
              This feature requires additional security verification and is not yet implemented. 
              Contact system administrator for succession planning.
            </p>
            <button
              onClick={() => setShowSuccessionModal(false)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
