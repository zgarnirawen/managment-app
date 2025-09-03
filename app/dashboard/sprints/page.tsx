'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { 
  GitBranch, 
  Plus, 
  Calendar,
  Clock,
  Target,
  Users,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  BarChart3,
  TrendingUp
} from 'lucide-react';

interface SprintTask {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  assignee: string;
  storyPoints: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface Sprint {
  id: string;
  name: string;
  description: string;
  projectName: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  goals: string[];
  progress: number;
  teamMembers: string[];
  scrumMaster: string;
  totalStoryPoints: number;
  completedStoryPoints: number;
  tasks: SprintTask[];
  velocity: number;
  burndownData: { date: string; remaining: number }[];
}

const SprintsPage = () => {
  const { user } = useUser();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Sample sprints data
  useEffect(() => {
    const sampleSprints: Sprint[] = [
      {
        id: '1',
        name: 'Sprint 3 - Employee Management',
        description: 'Complete employee CRUD operations and department management features',
        projectName: 'Employee Management System',
        status: 'active',
        startDate: '2024-01-31',
        endDate: '2024-02-14',
        goals: [
          'Complete employee CRUD operations',
          'Implement department management',
          'Add employee search and filtering',
          'Setup role-based permissions'
        ],
        progress: 70,
        teamMembers: ['John Doe', 'Jane Smith', 'Alex Johnson'],
        scrumMaster: 'Mike Brown',
        totalStoryPoints: 34,
        completedStoryPoints: 24,
        velocity: 28,
        tasks: [
          {
            id: 't1',
            title: 'Employee Creation Form',
            status: 'done',
            assignee: 'John Doe',
            storyPoints: 5,
            priority: 'high'
          },
          {
            id: 't2',
            title: 'Employee List View',
            status: 'done',
            assignee: 'Jane Smith',
            storyPoints: 8,
            priority: 'high'
          },
          {
            id: 't3',
            title: 'Department Management',
            status: 'in-progress',
            assignee: 'Alex Johnson',
            storyPoints: 13,
            priority: 'medium'
          },
          {
            id: 't4',
            title: 'Role-based Permissions',
            status: 'todo',
            assignee: 'John Doe',
            storyPoints: 8,
            priority: 'medium'
          }
        ],
        burndownData: [
          { date: '2024-01-31', remaining: 34 },
          { date: '2024-02-02', remaining: 29 },
          { date: '2024-02-05', remaining: 24 },
          { date: '2024-02-07', remaining: 18 },
          { date: '2024-02-09', remaining: 12 },
          { date: '2024-02-12', remaining: 10 }
        ]
      },
      {
        id: '2',
        name: 'Sprint 1 - UI Design',
        description: 'Mobile UI design and user flow mapping for time tracking app',
        projectName: 'Mobile Time Tracking App',
        status: 'planning',
        startDate: '2024-03-01',
        endDate: '2024-03-15',
        goals: [
          'Create mobile UI wireframes',
          'Design user flow diagrams',
          'Setup design system',
          'Create interactive prototypes'
        ],
        progress: 20,
        teamMembers: ['David Chen', 'Lisa Park', 'Aisha Patel'],
        scrumMaster: 'Sarah Johnson',
        totalStoryPoints: 25,
        completedStoryPoints: 5,
        velocity: 22,
        tasks: [
          {
            id: 't5',
            title: 'Mobile Wireframes',
            status: 'in-progress',
            assignee: 'Aisha Patel',
            storyPoints: 8,
            priority: 'high'
          },
          {
            id: 't6',
            title: 'User Flow Diagrams',
            status: 'todo',
            assignee: 'Lisa Park',
            storyPoints: 5,
            priority: 'medium'
          },
          {
            id: 't7',
            title: 'Design System',
            status: 'todo',
            assignee: 'Aisha Patel',
            storyPoints: 8,
            priority: 'high'
          },
          {
            id: 't8',
            title: 'Interactive Prototypes',
            status: 'todo',
            assignee: 'David Chen',
            storyPoints: 4,
            priority: 'low'
          }
        ],
        burndownData: [
          { date: '2024-03-01', remaining: 25 },
          { date: '2024-03-03', remaining: 20 },
          { date: '2024-03-05', remaining: 20 }
        ]
      },
      {
        id: '3',
        name: 'Sprint 2 - Visualization',
        description: 'Charts, graphs and interactive dashboards for analytics platform',
        projectName: 'Analytics Dashboard',
        status: 'completed',
        startDate: '2023-09-16',
        endDate: '2023-09-30',
        goals: [
          'Implement chart components',
          'Create interactive dashboards',
          'Add data filtering',
          'Performance optimization'
        ],
        progress: 100,
        teamMembers: ['Emma Davis', 'James Lee', 'Tom Wilson'],
        scrumMaster: 'Robert Kim',
        totalStoryPoints: 42,
        completedStoryPoints: 42,
        velocity: 42,
        tasks: [
          {
            id: 't9',
            title: 'Chart Components',
            status: 'done',
            assignee: 'Emma Davis',
            storyPoints: 13,
            priority: 'high'
          },
          {
            id: 't10',
            title: 'Interactive Dashboards',
            status: 'done',
            assignee: 'James Lee',
            storyPoints: 21,
            priority: 'critical'
          },
          {
            id: 't11',
            title: 'Data Filtering',
            status: 'done',
            assignee: 'Tom Wilson',
            storyPoints: 5,
            priority: 'medium'
          },
          {
            id: 't12',
            title: 'Performance Optimization',
            status: 'done',
            assignee: 'Emma Davis',
            storyPoints: 3,
            priority: 'low'
          }
        ],
        burndownData: [
          { date: '2023-09-16', remaining: 42 },
          { date: '2023-09-18', remaining: 37 },
          { date: '2023-09-20', remaining: 29 },
          { date: '2023-09-22', remaining: 21 },
          { date: '2023-09-25', remaining: 13 },
          { date: '2023-09-28', remaining: 5 },
          { date: '2023-09-30', remaining: 0 }
        ]
      },
      {
        id: '4',
        name: 'Sprint 1 - Security Audit',
        description: 'Comprehensive security assessment and vulnerability testing',
        projectName: 'Security Assessment',
        status: 'active',
        startDate: '2024-02-01',
        endDate: '2024-02-15',
        goals: [
          'Network security assessment',
          'Penetration testing',
          'Vulnerability scanning',
          'Security report generation'
        ],
        progress: 45,
        teamMembers: ['David Park', 'Lisa Chen', 'Marcus Johnson'],
        scrumMaster: 'Sarah Wilson',
        totalStoryPoints: 29,
        completedStoryPoints: 13,
        velocity: 25,
        tasks: [
          {
            id: 't13',
            title: 'Network Assessment',
            status: 'done',
            assignee: 'David Park',
            storyPoints: 8,
            priority: 'critical'
          },
          {
            id: 't14',
            title: 'Penetration Testing',
            status: 'in-progress',
            assignee: 'Lisa Chen',
            storyPoints: 13,
            priority: 'critical'
          },
          {
            id: 't15',
            title: 'Vulnerability Scanning',
            status: 'todo',
            assignee: 'Marcus Johnson',
            storyPoints: 5,
            priority: 'high'
          },
          {
            id: 't16',
            title: 'Security Report',
            status: 'todo',
            assignee: 'David Park',
            storyPoints: 3,
            priority: 'medium'
          }
        ],
        burndownData: [
          { date: '2024-02-01', remaining: 29 },
          { date: '2024-02-03', remaining: 24 },
          { date: '2024-02-05', remaining: 21 },
          { date: '2024-02-07', remaining: 16 },
          { date: '2024-02-09', remaining: 16 }
        ]
      }
    ];

    setTimeout(() => {
      setSprints(sampleSprints);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'planning':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'completed':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getTaskStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'todo':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'in-progress':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'review':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'done':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (priority) {
      case 'critical':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'high':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'medium':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const projects = [...new Set(sprints.map(sprint => sprint.projectName))];

  const filteredSprints = sprints.filter(sprint => {
    const matchesSearch = sprint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sprint.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sprint.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sprint.status === statusFilter;
    const matchesProject = projectFilter === 'all' || sprint.projectName === projectFilter;
    return matchesSearch && matchesStatus && matchesProject;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <GitBranch className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sprint Management</h1>
            <p className="text-gray-600">Manage agile sprints and track development progress</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Sprint</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded">
              <GitBranch className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Sprints</p>
              <p className="text-2xl font-bold text-gray-900">{sprints.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded">
              <Play className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Sprints</p>
              <p className="text-2xl font-bold text-gray-900">
                {sprints.filter(s => s.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Velocity</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(sprints.reduce((acc, s) => acc + s.velocity, 0) / sprints.length)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-2 rounded">
              <Target className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Story Points</p>
              <p className="text-2xl font-bold text-gray-900">
                {sprints.reduce((acc, s) => acc + s.totalStoryPoints, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search sprints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sprints Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSprints.map((sprint) => (
          <div
            key={sprint.id}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => setSelectedSprint(sprint)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {sprint.name}
                  </h3>
                  <p className="text-sm text-blue-600 mb-2">{sprint.projectName}</p>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {sprint.description}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={getStatusBadge(sprint.status)}>
                    {sprint.status}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{sprint.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${sprint.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{sprint.completedStoryPoints}</p>
                  <p className="text-xs text-gray-600">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{sprint.totalStoryPoints}</p>
                  <p className="text-xs text-gray-600">Total Points</p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{sprint.teamMembers.length} team members</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Velocity: {sprint.velocity} points</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>{sprint.tasks.length} tasks</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Scrum Master:</span>
                  <span className="text-sm font-medium">{sprint.scrumMaster}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSprints.length === 0 && (
        <div className="text-center py-8">
          <GitBranch className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No sprints found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' || projectFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating a new sprint'}
          </p>
        </div>
      )}

      {/* Sprint Detail Modal */}
      {selectedSprint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{selectedSprint.name}</h2>
                  <p className="text-blue-600">{selectedSprint.projectName}</p>
                </div>
                <button
                  onClick={() => setSelectedSprint(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex space-x-6 mt-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-2 border-b-2 ${
                    activeTab === 'overview'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`pb-2 border-b-2 ${
                    activeTab === 'tasks'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600'
                  }`}
                >
                  Tasks
                </button>
                <button
                  onClick={() => setActiveTab('burndown')}
                  className={`pb-2 border-b-2 ${
                    activeTab === 'burndown'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600'
                  }`}
                >
                  Burndown
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Sprint Details</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-600">Description:</span>
                        <p className="text-gray-900">{selectedSprint.description}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Scrum Master:</span>
                        <p className="text-gray-900">{selectedSprint.scrumMaster}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <p className="text-gray-900">
                          {new Date(selectedSprint.startDate).toLocaleDateString()} - {new Date(selectedSprint.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <span className={`ml-2 ${getStatusBadge(selectedSprint.status)}`}>
                          {selectedSprint.status}
                        </span>
                      </div>
                    </div>
                    
                    <h4 className="text-md font-semibold mt-6 mb-3">Sprint Goals</h4>
                    <ul className="space-y-2">
                      {selectedSprint.goals.map((goal, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-900">{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Team Members</h3>
                    <div className="space-y-3">
                      {selectedSprint.teamMembers.map((member, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-sm font-medium">
                              {member.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span>{member}</span>
                        </div>
                      ))}
                    </div>
                    
                    <h4 className="text-md font-semibold mt-6 mb-3">Sprint Metrics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Total Story Points</p>
                        <p className="text-xl font-bold">{selectedSprint.totalStoryPoints}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Completed Points</p>
                        <p className="text-xl font-bold text-green-600">{selectedSprint.completedStoryPoints}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Velocity</p>
                        <p className="text-xl font-bold text-blue-600">{selectedSprint.velocity}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Progress</p>
                        <p className="text-xl font-bold text-purple-600">{selectedSprint.progress}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'tasks' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Sprint Tasks</h3>
                  <div className="space-y-3">
                    {selectedSprint.tasks.map((task) => (
                      <div key={task.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{task.title}</h4>
                          <div className="flex items-center space-x-2">
                            <span className={getTaskStatusBadge(task.status)}>
                              {task.status.replace('-', ' ')}
                            </span>
                            <span className={getPriorityBadge(task.priority)}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Assignee: {task.assignee}</span>
                          <span>{task.storyPoints} story points</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'burndown' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Burndown Chart</h3>
                  <div className="bg-gray-50 p-8 rounded-lg">
                    <div className="h-64 flex items-end justify-between space-x-2">
                      {selectedSprint.burndownData.map((point, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className="bg-blue-600 rounded-t"
                            style={{
                              height: `${(point.remaining / selectedSprint.totalStoryPoints) * 200}px`,
                              width: '20px'
                            }}
                          ></div>
                          <span className="text-xs text-gray-600 mt-2 transform -rotate-45">
                            {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">Story Points Remaining Over Time</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Sprint Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Create New Sprint</h3>
            <p className="text-gray-600 mb-4">Sprint creation form would go here...</p>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Create Sprint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintsPage;
