'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  UserPlus, 
  UserMinus,
  Star,
  Award,
  TrendingUp,
  Calendar,
  Search,
  Filter,
  Building2,
  Target,
  Clock,
  MessageSquare,
  BarChart3
} from 'lucide-react';

interface Team {
  id: string;
  name: string;
  description: string;
  departmentId: string;
  departmentName: string;
  leaderId: string;
  leaderName: string;
  members: TeamMember[];
  projects: Project[];
  status: 'active' | 'inactive' | 'paused';
  createdAt: string;
  performance: number;
  totalTasks: number;
  completedTasks: number;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  position: string;
  department: string;
  joinedAt: string;
  performance: number;
  tasksCompleted: number;
  status: 'active' | 'inactive';
}

interface Project {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'on-hold';
  progress: number;
  deadline: string;
}

interface Department {
  id: string;
  name: string;
}

export default function TeamManagementPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [userRole, setUserRole] = useState<string>('');

  // Form state
  const [teamForm, setTeamForm] = useState({
    name: '',
    description: '',
    departmentId: '',
    leaderId: ''
  });

  // Check user permissions
  useEffect(() => {
    if (isLoaded && user) {
      const role = user.unsafeMetadata?.role as string;
      setUserRole(role);
      
      // Only managers, admins, and super admins can access team management
      if (!['manager', 'admin', 'super_admin'].includes(role)) {
        router.push('/dashboard');
        return;
      }
      
      loadTeamData();
    }
  }, [isLoaded, user, router]);

  const canManageTeams = ['manager', 'admin', 'super_admin'].includes(userRole);
  const canAssignMembers = ['manager', 'admin', 'super_admin'].includes(userRole);
  const canViewAllTeams = ['admin', 'super_admin'].includes(userRole);

  const loadTeamData = async () => {
    try {
      // Load mock data - in production, fetch from API
      const mockDepartments: Department[] = [
        { id: '1', name: 'Engineering' },
        { id: '2', name: 'Marketing' },
        { id: '3', name: 'Sales' },
        { id: '4', name: 'HR' },
        { id: '5', name: 'Operations' }
      ];

      const mockEmployees: TeamMember[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@company.com',
          role: 'employee',
          position: 'Senior Developer',
          department: 'Engineering',
          joinedAt: '2023-01-15',
          performance: 92,
          tasksCompleted: 45,
          status: 'active'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@company.com',
          role: 'employee',
          position: 'Marketing Specialist',
          department: 'Marketing',
          joinedAt: '2023-02-01',
          performance: 88,
          tasksCompleted: 38,
          status: 'active'
        },
        {
          id: '3',
          name: 'Bob Johnson',
          email: 'bob@company.com',
          role: 'manager',
          position: 'Team Lead',
          department: 'Engineering',
          joinedAt: '2022-11-10',
          performance: 95,
          tasksCompleted: 67,
          status: 'active'
        },
        {
          id: '4',
          name: 'Alice Brown',
          email: 'alice@company.com',
          role: 'employee',
          position: 'Sales Rep',
          department: 'Sales',
          joinedAt: '2023-03-12',
          performance: 85,
          tasksCompleted: 29,
          status: 'active'
        }
      ];

      const mockTeams: Team[] = [
        {
          id: '1',
          name: 'Frontend Development',
          description: 'Responsible for user interface and user experience',
          departmentId: '1',
          departmentName: 'Engineering',
          leaderId: '3',
          leaderName: 'Bob Johnson',
          members: [mockEmployees[0], mockEmployees[2]],
          projects: [
            { id: '1', name: 'Dashboard Redesign', status: 'active', progress: 75, deadline: '2025-10-15' },
            { id: '2', name: 'Mobile App', status: 'active', progress: 45, deadline: '2025-11-30' }
          ],
          status: 'active',
          createdAt: '2023-01-01',
          performance: 92,
          totalTasks: 24,
          completedTasks: 18
        },
        {
          id: '2',
          name: 'Marketing Campaign',
          description: 'Digital marketing and brand awareness initiatives',
          departmentId: '2',
          departmentName: 'Marketing',
          leaderId: '2',
          leaderName: 'Jane Smith',
          members: [mockEmployees[1]],
          projects: [
            { id: '3', name: 'Q4 Campaign', status: 'active', progress: 60, deadline: '2025-12-31' }
          ],
          status: 'active',
          createdAt: '2023-02-15',
          performance: 88,
          totalTasks: 16,
          completedTasks: 12
        },
        {
          id: '3',
          name: 'Sales Outreach',
          description: 'Customer acquisition and relationship management',
          departmentId: '3',
          departmentName: 'Sales',
          leaderId: '4',
          leaderName: 'Alice Brown',
          members: [mockEmployees[3]],
          projects: [
            { id: '4', name: 'Enterprise Sales', status: 'active', progress: 30, deadline: '2025-09-30' }
          ],
          status: 'active',
          createdAt: '2023-03-01',
          performance: 85,
          totalTasks: 12,
          completedTasks: 8
        }
      ];

      setDepartments(mockDepartments);
      setEmployees(mockEmployees);
      setTeams(mockTeams);
    } catch (error) {
      console.error('Failed to load team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || team.departmentId === selectedDepartment;
    
    // Managers can only see teams in their department
    if (userRole === 'manager' && !canViewAllTeams) {
      const userDepartment = user?.unsafeMetadata?.department;
      return matchesSearch && matchesDepartment && team.departmentName === userDepartment;
    }
    
    return matchesSearch && matchesDepartment;
  });

  const handleCreateTeam = async () => {
    if (!teamForm.name || !teamForm.departmentId || !teamForm.leaderId) return;

    const department = departments.find(d => d.id === teamForm.departmentId);
    const leader = employees.find(e => e.id === teamForm.leaderId);

    const newTeam: Team = {
      id: Date.now().toString(),
      name: teamForm.name,
      description: teamForm.description,
      departmentId: teamForm.departmentId,
      departmentName: department?.name || '',
      leaderId: teamForm.leaderId,
      leaderName: leader?.name || '',
      members: leader ? [leader] : [],
      projects: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      performance: 0,
      totalTasks: 0,
      completedTasks: 0
    };

    setTeams([...teams, newTeam]);
    setTeamForm({ name: '', description: '', departmentId: '', leaderId: '' });
    setShowCreateForm(false);
  };

  const handleAddMember = (memberId: string) => {
    if (!selectedTeam) return;

    const member = employees.find(e => e.id === memberId);
    if (!member || selectedTeam.members.find(m => m.id === memberId)) return;

    const updatedTeam = {
      ...selectedTeam,
      members: [...selectedTeam.members, member]
    };

    setTeams(teams.map(t => t.id === selectedTeam.id ? updatedTeam : t));
    setSelectedTeam(updatedTeam);
  };

  const handleRemoveMember = (memberId: string) => {
    if (!selectedTeam) return;

    const updatedTeam = {
      ...selectedTeam,
      members: selectedTeam.members.filter(m => m.id !== memberId)
    };

    setTeams(teams.map(t => t.id === selectedTeam.id ? updatedTeam : t));
    setSelectedTeam(updatedTeam);
  };

  const handleDeleteTeam = (teamId: string) => {
    if (confirm('Are you sure you want to delete this team?')) {
      setTeams(teams.filter(t => t.id !== teamId));
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600 mt-1">Organize and manage your teams efficiently</p>
          </div>
          {canManageTeams && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Team
            </button>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Teams</p>
                <p className="text-2xl font-bold text-gray-900">{filteredTeams.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredTeams.reduce((sum, team) => sum + team.members.length, 0)}
                </p>
              </div>
              <UserPlus className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Performance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(filteredTeams.reduce((sum, team) => sum + team.performance, 0) / filteredTeams.length) || 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredTeams.reduce((sum, team) => sum + team.projects.length, 0)}
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search teams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <div key={team.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Team Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-600">{team.departmentName}</p>
                  </div>
                  {canManageTeams && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTeam(team);
                          setShowEditForm(true);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4">{team.description}</p>

                {/* Team Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{team.members.length}</p>
                    <p className="text-xs text-gray-600">Members</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{team.performance}%</p>
                    <p className="text-xs text-gray-600">Performance</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Tasks Progress</span>
                    <span>{team.completedTasks}/{team.totalTasks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${team.totalTasks > 0 ? (team.completedTasks / team.totalTasks) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Team Leader */}
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {team.leaderName.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{team.leaderName}</p>
                    <p className="text-xs text-gray-600">Team Leader</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedTeam(team);
                      setShowMemberModal(true);
                    }}
                    className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    Manage Members
                  </button>
                  <button className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Team Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create New Team</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                  <input
                    type="text"
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter team name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={teamForm.description}
                    onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter team description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={teamForm.departmentId}
                    onChange={(e) => setTeamForm({ ...teamForm, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team Leader</label>
                  <select
                    value={teamForm.leaderId}
                    onChange={(e) => setTeamForm({ ...teamForm, leaderId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Team Leader</option>
                    {employees.filter(emp => ['manager', 'employee'].includes(emp.role)).map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} - {emp.position}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTeam}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Team
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Member Management Modal */}
        {showMemberModal && selectedTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Manage Team Members - {selectedTeam.name}</h3>
                <button
                  onClick={() => setShowMemberModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {/* Current Members */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Current Members ({selectedTeam.members.length})</h4>
                <div className="space-y-2">
                  {selectedTeam.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {member.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.position}</p>
                        </div>
                      </div>
                      {canAssignMembers && member.id !== selectedTeam.leaderId && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Employees */}
              {canAssignMembers && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Available Employees</h4>
                  <div className="space-y-2">
                    {employees
                      .filter(emp => !selectedTeam.members.find(member => member.id === emp.id))
                      .map((employee) => (
                        <div key={employee.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {employee.name.charAt(0)}
                            </div>
                            <div className="ml-3">
                              <p className="font-medium">{employee.name}</p>
                              <p className="text-sm text-gray-600">{employee.position}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAddMember(employee.id)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
