'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { 
  FolderOpen,
  Users,
  Target,
  Calendar,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  GitBranch,
  Clock,
  DollarSign,
  MoreVertical,
  Search,
  Filter,
  Award,
  TrendingUp
} from 'lucide-react';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  skills: string[];
  status: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string[];
  estimatedHours: number;
  completedHours: number;
  dueDate: string;
}

interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed';
  goals: string[];
  progress: number;
  tasks: Task[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: string;
  endDate: string;
  progress: number;
  teamMembers: string[];
  projectManager: string;
  client?: string;
  budget?: number;
  sprints: Sprint[];
  tags: string[];
  tasks: Task[];
}

const ProjectManagementPage = () => {
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Check if user has management permissions
  const canManage = user?.publicMetadata?.role === 'admin' || 
                   user?.publicMetadata?.role === 'super_admin' || 
                   user?.publicMetadata?.role === 'manager';

  useEffect(() => {
    loadProjects();
    loadEmployees();
  }, []);

  const loadProjects = async () => {
    // Enhanced sample projects with comprehensive data
    const sampleProjects: Project[] = [
      {
        id: '1',
        name: 'Employee Management System',
        description: 'Complete overhaul of the employee management platform with new features including role-based access, performance tracking, and advanced reporting.',
        status: 'active',
        priority: 'high',
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        progress: 65,
        teamMembers: ['1', '2', '3', '5'], // Employee IDs
        projectManager: '3', // Mike Brown
        client: 'Internal',
        budget: 150000,
        tags: ['web-app', 'react', 'typescript', 'database'],
        sprints: [
          {
            id: 's1',
            name: 'Sprint 1 - Authentication & Setup',
            startDate: '2024-01-01',
            endDate: '2024-01-15',
            status: 'completed',
            goals: ['User authentication', 'Role-based access', 'Database setup'],
            progress: 100,
            tasks: [
              {
                id: 't1',
                title: 'Implement Clerk Authentication',
                description: 'Set up Clerk authentication with role-based access control',
                status: 'done',
                priority: 'high',
                assignedTo: ['1'], // John Doe
                estimatedHours: 16,
                completedHours: 18,
                dueDate: '2024-01-05'
              },
              {
                id: 't2',
                title: 'Database Schema Design',
                description: 'Design and implement Prisma database schema',
                status: 'done',
                priority: 'high',
                assignedTo: ['1'],
                estimatedHours: 12,
                completedHours: 14,
                dueDate: '2024-01-08'
              }
            ]
          },
          {
            id: 's2',
            name: 'Sprint 2 - Core Features',
            startDate: '2024-01-16',
            endDate: '2024-01-30',
            status: 'completed',
            goals: ['Employee CRUD', 'Dashboard UI', 'Basic reporting'],
            progress: 100,
            tasks: [
              {
                id: 't3',
                title: 'Employee Management Interface',
                description: 'Create comprehensive employee management UI',
                status: 'done',
                priority: 'high',
                assignedTo: ['2'], // Jane Smith
                estimatedHours: 24,
                completedHours: 28,
                dueDate: '2024-01-25'
              }
            ]
          },
          {
            id: 's3',
            name: 'Sprint 3 - Advanced Features',
            startDate: '2024-01-31',
            endDate: '2024-02-14',
            status: 'active',
            goals: ['Project assignment', 'Task management', 'Performance tracking'],
            progress: 70,
            tasks: [
              {
                id: 't4',
                title: 'Project Assignment System',
                description: 'Build project and task assignment functionality',
                status: 'in-progress',
                priority: 'high',
                assignedTo: ['1', '5'], // John Doe, Emily Chen
                estimatedHours: 32,
                completedHours: 20,
                dueDate: '2024-02-10'
              }
            ]
          }
        ],
        tasks: [] // Tasks are within sprints
      },
      {
        id: '2',
        name: 'Data Analytics Platform',
        description: 'Business intelligence dashboard with real-time analytics, predictive modeling, and comprehensive reporting capabilities.',
        status: 'active',
        priority: 'medium',
        startDate: '2024-02-01',
        endDate: '2024-07-31',
        progress: 35,
        teamMembers: ['1', '4'], // John Doe, Sarah Wilson
        projectManager: '3', // Mike Brown
        client: 'Analytics Corp',
        budget: 120000,
        tags: ['analytics', 'dashboard', 'python', 'machine-learning'],
        sprints: [
          {
            id: 's4',
            name: 'Sprint 1 - Data Pipeline',
            startDate: '2024-02-01',
            endDate: '2024-02-15',
            status: 'completed',
            goals: ['Data ingestion', 'ETL pipeline', 'Database optimization'],
            progress: 100,
            tasks: [
              {
                id: 't5',
                title: 'Data Pipeline Architecture',
                description: 'Design and implement data ingestion pipeline',
                status: 'done',
                priority: 'critical',
                assignedTo: ['4'], // Sarah Wilson
                estimatedHours: 40,
                completedHours: 45,
                dueDate: '2024-02-12'
              }
            ]
          },
          {
            id: 's5',
            name: 'Sprint 2 - Analytics Engine',
            startDate: '2024-02-16',
            endDate: '2024-03-01',
            status: 'active',
            goals: ['Machine learning models', 'Real-time processing', 'API development'],
            progress: 60,
            tasks: [
              {
                id: 't6',
                title: 'ML Model Development',
                description: 'Develop predictive analytics models',
                status: 'in-progress',
                priority: 'high',
                assignedTo: ['4'],
                estimatedHours: 50,
                completedHours: 30,
                dueDate: '2024-02-28'
              },
              {
                id: 't7',
                title: 'Analytics API',
                description: 'Create RESTful API for analytics data',
                status: 'todo',
                priority: 'medium',
                assignedTo: ['1'],
                estimatedHours: 20,
                completedHours: 0,
                dueDate: '2024-03-01'
              }
            ]
          }
        ],
        tasks: []
      },
      {
        id: '3',
        name: 'Mobile Time Tracking App',
        description: 'Cross-platform mobile application for time tracking, attendance management, and productivity analytics.',
        status: 'planning',
        priority: 'medium',
        startDate: '2024-03-01',
        endDate: '2024-08-31',
        progress: 15,
        teamMembers: ['2', '5'], // Jane Smith, Emily Chen
        projectManager: '3', // Mike Brown
        client: 'TimeTrack Solutions',
        budget: 80000,
        tags: ['mobile', 'react-native', 'ios', 'android'],
        sprints: [
          {
            id: 's6',
            name: 'Sprint 1 - UI/UX Design',
            startDate: '2024-03-01',
            endDate: '2024-03-15',
            status: 'planning',
            goals: ['Mobile wireframes', 'Design system', 'User flow mapping'],
            progress: 20,
            tasks: [
              {
                id: 't8',
                title: 'Mobile UI Wireframes',
                description: 'Create comprehensive mobile app wireframes',
                status: 'todo',
                priority: 'high',
                assignedTo: ['5'], // Emily Chen
                estimatedHours: 30,
                completedHours: 5,
                dueDate: '2024-03-10'
              }
            ]
          }
        ],
        tasks: []
      }
    ];

    setTimeout(() => {
      setProjects(sampleProjects);
      setLoading(false);
    }, 1000);
  };

  const loadEmployees = async () => {
    const sampleEmployees: Employee[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@company.com',
        role: 'employee',
        department: 'Engineering',
        skills: ['React', 'TypeScript', 'Node.js', 'Python'],
        status: 'active'
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@company.com',
        role: 'employee',
        department: 'Engineering',
        skills: ['React', 'CSS', 'JavaScript', 'UI/UX'],
        status: 'active'
      },
      {
        id: '3',
        firstName: 'Mike',
        lastName: 'Brown',
        email: 'mike.brown@company.com',
        role: 'manager',
        department: 'Engineering',
        skills: ['Team Leadership', 'Project Management', 'Architecture'],
        status: 'active'
      },
      {
        id: '4',
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.wilson@company.com',
        role: 'employee',
        department: 'Data Analytics',
        skills: ['Python', 'SQL', 'Machine Learning', 'Tableau'],
        status: 'active'
      },
      {
        id: '5',
        firstName: 'Emily',
        lastName: 'Chen',
        email: 'emily.chen@university.edu',
        role: 'intern',
        department: 'Engineering',
        skills: ['React', 'TypeScript', 'Node.js', 'Python'],
        status: 'active'
      }
    ];
    setEmployees(sampleEmployees);
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'planning':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'on-hold':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'completed':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
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

  const assignEmployeeToProject = (projectId: string, employeeId: string) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, teamMembers: [...project.teamMembers, employeeId] }
        : project
    ));
  };

  const assignTaskToEmployee = (projectId: string, sprintId: string, taskId: string, employeeId: string) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? {
            ...project,
            sprints: project.sprints.map(sprint =>
              sprint.id === sprintId
                ? {
                    ...sprint,
                    tasks: sprint.tasks.map(task =>
                      task.id === taskId
                        ? { ...task, assignedTo: [...task.assignedTo, employeeId] }
                        : task
                    )
                  }
                : sprint
            )
          }
        : project
    ));
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
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
          <FolderOpen className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
            <p className="text-gray-600">Manage projects, teams, and task assignments</p>
          </div>
        </div>
        {canManage && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded">
              <FolderOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.filter(p => p.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(projects.flatMap(p => p.teamMembers)).size}
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
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.reduce((acc, p) => acc + p.sprints.reduce((sprintAcc, s) => sprintAcc + s.tasks.length, 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects..."
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
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => setSelectedProject(project)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {project.description}
                  </p>
                </div>
                <div className="flex space-x-1">
                  {canManage && (
                    <>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(project);
                          setShowAssignModal(true);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                        title="Assign Team Member"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Edit className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <span className={getStatusBadge(project.status)}>
                  {project.status.replace('-', ' ')}
                </span>
                <span className={getPriorityBadge(project.priority)}>
                  {project.priority}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{project.teamMembers.length} team members</span>
                </div>
                <div className="flex items-center space-x-2">
                  <GitBranch className="w-4 h-4" />
                  <span>{project.sprints.length} sprints</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>
                    {project.sprints.reduce((acc, s) => acc + s.tasks.length, 0)} tasks
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(project.endDate).toLocaleDateString()}</span>
                </div>
                {project.budget && (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-green-600 font-semibold">
                      ${project.budget.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1">
                {project.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
                {project.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{project.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && !showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{selectedProject.name}</h2>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex space-x-6 mt-4">
                {['overview', 'team', 'sprints', 'tasks'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 border-b-2 capitalize ${
                      activeTab === tab
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Project Details</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-600">Description:</span>
                        <p className="text-gray-900">{selectedProject.description}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Project Manager:</span>
                        <p className="text-gray-900">
                          {employees.find(e => e.id === selectedProject.projectManager)?.firstName} {employees.find(e => e.id === selectedProject.projectManager)?.lastName}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Client:</span>
                        <p className="text-gray-900">{selectedProject.client || 'Internal'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Budget:</span>
                        <p className="text-gray-900">
                          {selectedProject.budget ? `$${selectedProject.budget.toLocaleString()}` : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <p className="text-gray-900">
                          {new Date(selectedProject.startDate).toLocaleDateString()} - {new Date(selectedProject.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Project Metrics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Progress</p>
                        <p className="text-2xl font-bold text-blue-600">{selectedProject.progress}%</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Team Size</p>
                        <p className="text-2xl font-bold text-green-600">{selectedProject.teamMembers.length}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Sprints</p>
                        <p className="text-2xl font-bold text-purple-600">{selectedProject.sprints.length}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Total Tasks</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {selectedProject.sprints.reduce((acc, s) => acc + s.tasks.length, 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'team' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Team Members ({selectedProject.teamMembers.length})</h3>
                    {canManage && (
                      <button
                        onClick={() => setShowAssignModal(true)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Add Member
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedProject.teamMembers.map(memberId => {
                      const employee = employees.find(e => e.id === memberId);
                      return employee ? (
                        <div key={memberId} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {employee.firstName[0]}{employee.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium">{employee.firstName} {employee.lastName}</h4>
                              <p className="text-sm text-gray-600">{employee.role}</p>
                              <p className="text-sm text-gray-500">{employee.department}</p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-1">
                              {employee.skills.slice(0, 2).map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                                  {skill}
                                </span>
                              ))}
                              {employee.skills.length > 2 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                  +{employee.skills.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              
              {activeTab === 'sprints' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Sprints ({selectedProject.sprints.length})</h3>
                  <div className="space-y-4">
                    {selectedProject.sprints.map((sprint) => (
                      <div key={sprint.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-lg">{sprint.name}</h4>
                          <div className="flex items-center space-x-2">
                            <span className={getStatusBadge(sprint.status)}>
                              {sprint.status}
                            </span>
                            <span className="text-sm text-gray-600">
                              {sprint.progress}% complete
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Duration</p>
                            <p className="font-medium">
                              {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Tasks</p>
                            <p className="font-medium">{sprint.tasks.length} tasks</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${sprint.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Sprint Goals</p>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {sprint.goals.map((goal, index) => (
                              <li key={index} className="text-gray-700">{goal}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'tasks' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">All Tasks</h3>
                  <div className="space-y-6">
                    {selectedProject.sprints.map((sprint) => (
                      <div key={sprint.id}>
                        <h4 className="font-medium text-gray-900 mb-3">{sprint.name}</h4>
                        <div className="space-y-3">
                          {sprint.tasks.map((task) => (
                            <div key={task.id} className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900">{task.title}</h5>
                                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                </div>
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
                                <div className="flex items-center space-x-4">
                                  <span>Assigned to: {task.assignedTo.map(id => {
                                    const emp = employees.find(e => e.id === id);
                                    return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
                                  }).join(', ')}</span>
                                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{task.completedHours}/{task.estimatedHours}h</span>
                                </div>
                              </div>
                              
                              <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-1">
                                  <div
                                    className="bg-green-600 h-1 rounded-full"
                                    style={{ width: `${Math.min((task.completedHours / task.estimatedHours) * 100, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Team Assignment Modal */}
      {showAssignModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Add Team Member to {selectedProject.name}</h3>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                {employees
                  .filter(emp => !selectedProject.teamMembers.includes(emp.id))
                  .map(employee => (
                    <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-sm font-medium">
                            {employee.firstName[0]}{employee.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{employee.firstName} {employee.lastName}</h4>
                          <p className="text-sm text-gray-600">{employee.department} - {employee.role}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          assignEmployeeToProject(selectedProject.id, employee.id);
                          setShowAssignModal(false);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  ))}
              </div>
            </div>
            
            <div className="p-6 border-t">
              <button
                onClick={() => setShowAssignModal(false)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagementPage;
