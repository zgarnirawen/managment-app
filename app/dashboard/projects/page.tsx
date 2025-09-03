'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { 
  FolderOpen, 
  Plus, 
  Calendar,
  Users,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Star,
  GitBranch,
  Target,
  Filter,
  Search
} from 'lucide-react';

interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed';
  goals: string[];
  progress: number;
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
}

const ProjectsPage = () => {
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Sample projects data
  useEffect(() => {
    const sampleProjects: Project[] = [
      {
        id: '1',
        name: 'Employee Management System',
        description: 'Complete overhaul of the employee management platform with new features',
        status: 'active',
        priority: 'high',
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        progress: 65,
        teamMembers: ['John Doe', 'Jane Smith', 'Alex Johnson', 'Sarah Wilson'],
        projectManager: 'Mike Brown',
        client: 'Internal',
        budget: 150000,
        sprints: [
          {
            id: 's1',
            name: 'Sprint 1 - Authentication',
            startDate: '2024-01-01',
            endDate: '2024-01-15',
            status: 'completed',
            goals: ['User authentication', 'Role-based access'],
            progress: 100
          },
          {
            id: 's2',
            name: 'Sprint 2 - Dashboard',
            startDate: '2024-01-16',
            endDate: '2024-01-30',
            status: 'completed',
            goals: ['Main dashboard', 'User profiles'],
            progress: 100
          },
          {
            id: 's3',
            name: 'Sprint 3 - Employee Management',
            startDate: '2024-01-31',
            endDate: '2024-02-14',
            status: 'active',
            goals: ['Employee CRUD', 'Department management'],
            progress: 70
          }
        ],
        tags: ['web-app', 'react', 'typescript']
      },
      {
        id: '2',
        name: 'Mobile Time Tracking App',
        description: 'Native mobile application for time tracking and attendance',
        status: 'planning',
        priority: 'medium',
        startDate: '2024-03-01',
        endDate: '2024-08-31',
        progress: 15,
        teamMembers: ['David Chen', 'Lisa Park', 'Tom Wilson'],
        projectManager: 'Sarah Johnson',
        client: 'TimeTrack Corp',
        budget: 80000,
        sprints: [
          {
            id: 's4',
            name: 'Sprint 1 - UI Design',
            startDate: '2024-03-01',
            endDate: '2024-03-15',
            status: 'planning',
            goals: ['Mobile UI design', 'User flow mapping'],
            progress: 20
          }
        ],
        tags: ['mobile', 'react-native', 'ios', 'android']
      },
      {
        id: '3',
        name: 'Analytics Dashboard',
        description: 'Business intelligence dashboard with real-time analytics',
        status: 'completed',
        priority: 'low',
        startDate: '2023-09-01',
        endDate: '2023-12-31',
        progress: 100,
        teamMembers: ['Emma Davis', 'James Lee'],
        projectManager: 'Robert Kim',
        client: 'Analytics Pro',
        budget: 60000,
        sprints: [
          {
            id: 's5',
            name: 'Sprint 1 - Data Integration',
            startDate: '2023-09-01',
            endDate: '2023-09-15',
            status: 'completed',
            goals: ['Database setup', 'API integration'],
            progress: 100
          },
          {
            id: 's6',
            name: 'Sprint 2 - Visualization',
            startDate: '2023-09-16',
            endDate: '2023-09-30',
            status: 'completed',
            goals: ['Charts and graphs', 'Interactive dashboards'],
            progress: 100
          }
        ],
        tags: ['analytics', 'dashboard', 'charts']
      }
    ];

    setTimeout(() => {
      setProjects(sampleProjects);
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

  const getSprintStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'planning':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'completed':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
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
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600">Manage projects and sprints</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
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
              <Target className="w-6 h-6 text-green-600" />
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
            <div className="bg-yellow-100 p-2 rounded">
              <GitBranch className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Sprints</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.reduce((acc, p) => acc + p.sprints.length, 0)}
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
      </div>

      {/* Filters and Search */}
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
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
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
                  <button className="text-gray-400 hover:text-gray-600">
                    <Star className="w-4 h-4" />
                  </button>
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

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{project.teamMembers.length} team members</span>
                </div>
                <div className="flex items-center space-x-2">
                  <GitBranch className="w-4 h-4" />
                  <span>{project.sprints.length} sprints</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(project.endDate).toLocaleDateString()}</span>
                </div>
                {project.budget && (
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 font-semibold">
                      ${project.budget.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-1">
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

      {filteredProjects.length === 0 && (
        <div className="text-center py-8">
          <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating a new project'}
          </p>
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
            </div>
            
            <div className="p-6">
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
                      <p className="text-gray-900">{selectedProject.projectManager}</p>
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
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Team Members</h3>
                  <div className="space-y-2">
                    {selectedProject.teamMembers.map((member, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-sm font-medium">
                            {member.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span>{member}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Sprints ({selectedProject.sprints.length})</h3>
                <div className="space-y-4">
                  {selectedProject.sprints.map((sprint) => (
                    <div key={sprint.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{sprint.name}</h4>
                        <span className={getSprintStatusBadge(sprint.status)}>
                          {sprint.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                      </div>
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{sprint.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-blue-600 h-1 rounded-full"
                            style={{ width: `${sprint.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Goals:</span>
                        <ul className="list-disc list-inside text-sm text-gray-900">
                          {sprint.goals.map((goal, index) => (
                            <li key={index}>{goal}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Create New Project</h3>
            <p className="text-gray-600 mb-4">Project creation form would go here...</p>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
