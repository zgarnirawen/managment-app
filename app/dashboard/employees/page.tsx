'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone,
  MapPin,
  Calendar,
  Badge,
  UserCheck,
  UserX,
  Briefcase,
  Target,
  FolderOpen,
  Settings,
  Award,
  Clock,
  DollarSign,
  MoreVertical
} from 'lucide-react';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  role: 'intern' | 'employee' | 'manager' | 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'pending' | 'on-leave';
  startDate: string;
  profileImage?: string;
  salary?: number;
  skills: string[];
  assignedProjects: string[];
  assignedTasks: string[];
  performanceRating: number;
  manager?: string;
  location: string;
}

interface Project {
  id: string;
  name: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed';
  teamMembers: string[];
}

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  assignedTo: string[];
  projectId?: string;
}

export default function EmployeesPage() {
  const { user, isLoaded } = useUser();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignmentType, setAssignmentType] = useState<'project' | 'task'>('project');
  const [activeTab, setActiveTab] = useState('overview');

  // Check if user has management permissions
  const canManage = user?.publicMetadata?.role === 'admin' || 
                   user?.publicMetadata?.role === 'super_admin' || 
                   user?.publicMetadata?.role === 'manager';

  useEffect(() => {
    if (isLoaded && user) {
      loadEmployees();
      loadProjects();
      loadTasks();
    }
  }, [isLoaded, user]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        // Transform API data to match component interface
        const transformedEmployees: Employee[] = data.map((emp: any) => ({
          id: emp.id,
          firstName: emp.firstName || emp.name?.split(' ')[0] || 'Unknown',
          lastName: emp.lastName || emp.name?.split(' ').slice(1).join(' ') || '',
          email: emp.email,
          phone: emp.phone || '',
          department: emp.department?.name || emp.department || 'Not Assigned',
          position: emp.position || emp.role || 'Not Assigned',
          role: emp.role,
          status: emp.status || 'active',
          startDate: emp.startDate ? new Date(emp.startDate).toISOString().split('T')[0] : '',
          salary: emp.salary || 0,
          skills: emp.skills || [],
          assignedProjects: emp.assignedProjects || [],
          assignedTasks: emp.assignedTasks || [],
          performanceRating: emp.performanceRating || 0,
          manager: emp.manager || '',
          location: emp.location || ''
        }));
        setEmployees(transformedEmployees);
        setFilteredEmployees(transformedEmployees);
      } else {
        console.error('Failed to fetch employees');
        setEmployees([]);
        setFilteredEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    const sampleProjects: Project[] = [
      {
        id: '1',
        name: 'Employee Management System',
        status: 'active',
        teamMembers: ['1', '2', '5']
      },
      {
        id: '2',
        name: 'Analytics Dashboard',
        status: 'active',
        teamMembers: ['1', '4']
      },
      {
        id: '3',
        name: 'Mobile App Development',
        status: 'planning',
        teamMembers: ['3']
      }
    ];
    setProjects(sampleProjects);
  };

  const loadTasks = async () => {
    const sampleTasks: Task[] = [
      {
        id: '1',
        title: 'Implement user authentication',
        status: 'done',
        assignedTo: ['1'],
        projectId: '1'
      },
      {
        id: '2',
        title: 'Create dashboard UI',
        status: 'in-progress',
        assignedTo: ['1'],
        projectId: '1'
      },
      {
        id: '3',
        title: 'API integration',
        status: 'todo',
        assignedTo: ['1'],
        projectId: '1'
      },
      {
        id: '4',
        title: 'Frontend components',
        status: 'in-progress',
        assignedTo: ['2'],
        projectId: '1'
      },
      {
        id: '5',
        title: 'UI/UX improvements',
        status: 'review',
        assignedTo: ['2'],
        projectId: '1'
      },
      {
        id: '6',
        title: 'Data analysis',
        status: 'in-progress',
        assignedTo: ['4'],
        projectId: '2'
      },
      {
        id: '7',
        title: 'Report generation',
        status: 'todo',
        assignedTo: ['4'],
        projectId: '2'
      },
      {
        id: '8',
        title: 'Code review tasks',
        status: 'todo',
        assignedTo: ['5'],
        projectId: '1'
      }
    ];
    setTasks(sampleTasks);
  };

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, departmentFilter, roleFilter, statusFilter]);

  // Assignment functions for admin/manager users
  const assignToProject = async (employeeId: string, projectId: string) => {
    if (!canManage) return;
    
    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId 
        ? { ...emp, assignedProjects: [...emp.assignedProjects, projectId] }
        : emp
    ));
  };

  const assignTask = async (employeeId: string, taskId: string) => {
    if (!canManage) return;
    
    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId 
        ? { ...emp, assignedTasks: [...emp.assignedTasks, taskId] }
        : emp
    ));
  };

  const updateEmployeeRole = async (employeeId: string, newRole: string) => {
    if (!canManage) return;
    
    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId 
        ? { ...emp, role: newRole as any }
        : emp
    ));
  };

  const filterEmployees = () => {
    let filtered = employees;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(emp => 
        emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(emp => emp.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(emp => emp.status === statusFilter);
    }

    setFilteredEmployees(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'manager':
        return 'bg-indigo-100 text-indigo-800';
      case 'employee':
        return 'bg-green-100 text-green-800';
      case 'intern':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const departments = [...new Set(employees.map(emp => emp.department))];
  const roles = [...new Set(employees.map(emp => emp.role))];

  if (loading) {
    return (
      <div className="min-h-screen bg-nextgen-dark-blue p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-nextgen-medium-gray rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-nextgen-medium-gray rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nextgen-dark-blue text-nextgen-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-nextgen-teal" />
            <h1 className="text-3xl font-bold text-white">Employee Management</h1>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-nextgen-teal text-nextgen-dark-gray rounded-lg hover:bg-cyan-400 transition-colors">
            <Plus className="w-5 h-5" />
            Add Employee
          </button>
        </div>

        {/* Filters */}
        <div className="bg-nextgen-medium-gray rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-nextgen-light-gray" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-nextgen-dark-blue border border-nextgen-light-gray rounded-lg text-white placeholder-nextgen-light-gray focus:ring-2 focus:ring-nextgen-teal focus:border-transparent"
                />
              </div>
            </div>

            {/* Department Filter */}
            <div>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 bg-nextgen-dark-blue border border-nextgen-light-gray rounded-lg text-white focus:ring-2 focus:ring-nextgen-teal focus:border-transparent"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 bg-nextgen-dark-blue border border-nextgen-light-gray rounded-lg text-white focus:ring-2 focus:ring-nextgen-teal focus:border-transparent"
              >
                <option value="all">All Roles</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-nextgen-dark-blue border border-nextgen-light-gray rounded-lg text-white focus:ring-2 focus:ring-nextgen-teal focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-nextgen-light-gray">
            Showing {filteredEmployees.length} of {employees.length} employees
          </p>
        </div>

        {/* Employee Grid */}
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-nextgen-light-gray mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No employees found</h3>
            <p className="text-nextgen-light-gray">
              {searchTerm || departmentFilter !== 'all' || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by adding your first employee'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((employee) => (
              <div key={employee.id} className="bg-nextgen-medium-gray rounded-lg p-6 hover:bg-opacity-80 transition-colors">
                {/* Employee Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-nextgen-teal rounded-full flex items-center justify-center text-nextgen-dark-gray font-semibold">
                      {employee.firstName[0]}{employee.lastName[0]}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">
                        {employee.firstName} {employee.lastName}
                      </h3>
                      <p className="text-nextgen-light-gray text-sm">{employee.position}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {canManage && (
                      <>
                        <button 
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setAssignmentType('project');
                            setShowAssignModal(true);
                          }}
                          className="p-2 hover:bg-nextgen-dark-blue rounded-lg transition-colors"
                          title="Assign Project"
                        >
                          <FolderOpen className="w-4 h-4 text-nextgen-light-gray hover:text-white" />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setAssignmentType('task');
                            setShowAssignModal(true);
                          }}
                          className="p-2 hover:bg-nextgen-dark-blue rounded-lg transition-colors"
                          title="Assign Task"
                        >
                          <Target className="w-4 h-4 text-nextgen-light-gray hover:text-white" />
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => setSelectedEmployee(employee)}
                      className="p-2 hover:bg-nextgen-dark-blue rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-nextgen-light-gray hover:text-white" />
                    </button>
                    <button className="p-2 hover:bg-nextgen-dark-blue rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-nextgen-light-gray hover:text-white" />
                    </button>
                  </div>
                </div>

                {/* Employee Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-nextgen-light-gray" />
                    <span className="text-sm text-nextgen-light-gray">{employee.email}</span>
                  </div>
                  
                  {employee.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-nextgen-light-gray" />
                      <span className="text-sm text-nextgen-light-gray">{employee.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-nextgen-light-gray" />
                    <span className="text-sm text-nextgen-light-gray">{employee.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-nextgen-light-gray" />
                    <span className="text-sm text-nextgen-light-gray">
                      Started {new Date(employee.startDate).toLocaleDateString()}
                    </span>
                  </div>

                  {employee.salary && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-nextgen-light-gray" />
                      <span className="text-sm text-nextgen-light-gray">
                        ${employee.salary.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Project and Task Assignments */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-nextgen-light-gray" />
                    <span className="text-sm text-nextgen-light-gray">
                      {employee.assignedProjects.length} projects
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-nextgen-light-gray" />
                    <span className="text-sm text-nextgen-light-gray">
                      {employee.assignedTasks.length} tasks
                    </span>
                  </div>
                  {employee.performanceRating && (
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-nextgen-light-gray" />
                      <span className="text-sm text-nextgen-light-gray">
                        Rating: {employee.performanceRating}/5
                      </span>
                    </div>
                  )}
                </div>

                {/* Skills Tags */}
                <div className="mt-4">
                  <div className="flex flex-wrap gap-1">
                    {employee.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-nextgen-dark-blue text-nextgen-teal text-xs rounded">
                        {skill}
                      </span>
                    ))}
                    {employee.skills.length > 3 && (
                      <span className="px-2 py-1 bg-nextgen-dark-blue text-nextgen-light-gray text-xs rounded">
                        +{employee.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status and Role Badges */}
                <div className="flex gap-2 mt-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                    {employee.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(employee.role)}`}>
                    {employee.role.replace('_', ' ')}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-nextgen-light-gray border-opacity-20">
                  <button 
                    onClick={() => setSelectedEmployee(employee)}
                    className="flex-1 px-3 py-2 bg-nextgen-teal text-nextgen-dark-gray rounded-lg hover:bg-cyan-400 transition-colors text-sm"
                  >
                    View Details
                  </button>
                  {canManage && (
                    <button className="px-3 py-2 border border-nextgen-light-gray text-nextgen-light-gray rounded-lg hover:bg-nextgen-dark-blue hover:text-white transition-colors text-sm">
                      Manage
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Assignment Modal */}
        {showAssignModal && selectedEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-nextgen-medium-gray rounded-lg max-w-md w-full mx-4">
              <div className="p-6 border-b border-nextgen-light-gray border-opacity-20">
                <h3 className="text-lg font-semibold text-white">
                  Assign {assignmentType === 'project' ? 'Project' : 'Task'} to {selectedEmployee.firstName} {selectedEmployee.lastName}
                </h3>
              </div>
              
              <div className="p-6">
                {assignmentType === 'project' ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-nextgen-light-gray">Select Project</label>
                    {projects.map(project => (
                      <div key={project.id} className="flex items-center justify-between p-3 bg-nextgen-dark-blue rounded-lg">
                        <div>
                          <h4 className="text-white font-medium">{project.name}</h4>
                          <p className="text-sm text-nextgen-light-gray">Status: {project.status}</p>
                        </div>
                        <button
                          onClick={() => {
                            assignToProject(selectedEmployee.id, project.id);
                            setShowAssignModal(false);
                          }}
                          className="px-3 py-1 bg-nextgen-teal text-nextgen-dark-gray rounded hover:bg-cyan-400 transition-colors"
                          disabled={selectedEmployee.assignedProjects.includes(project.id)}
                        >
                          {selectedEmployee.assignedProjects.includes(project.id) ? 'Assigned' : 'Assign'}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-nextgen-light-gray">Select Task</label>
                    {tasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-nextgen-dark-blue rounded-lg">
                        <div>
                          <h4 className="text-white font-medium">{task.title}</h4>
                          <p className="text-sm text-nextgen-light-gray">Status: {task.status}</p>
                        </div>
                        <button
                          onClick={() => {
                            assignTask(selectedEmployee.id, task.id);
                            setShowAssignModal(false);
                          }}
                          className="px-3 py-1 bg-nextgen-teal text-nextgen-dark-gray rounded hover:bg-cyan-400 transition-colors"
                          disabled={selectedEmployee.assignedTasks.includes(task.id)}
                        >
                          {selectedEmployee.assignedTasks.includes(task.id) ? 'Assigned' : 'Assign'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-nextgen-light-gray border-opacity-20">
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="flex-1 px-4 py-2 border border-nextgen-light-gray text-nextgen-light-gray rounded-lg hover:bg-nextgen-dark-blue transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Employee Detail Modal */}
        {selectedEmployee && !showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-nextgen-medium-gray rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-nextgen-light-gray border-opacity-20">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h2>
                  <button
                    onClick={() => setSelectedEmployee(null)}
                    className="text-nextgen-light-gray hover:text-white"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex space-x-6 px-6 pt-4">
                {['overview', 'projects', 'tasks', 'performance'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 border-b-2 capitalize ${
                      activeTab === tab
                        ? 'border-nextgen-teal text-nextgen-teal'
                        : 'border-transparent text-nextgen-light-gray hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-nextgen-light-gray" />
                          <span className="text-nextgen-light-gray">{selectedEmployee.email}</span>
                        </div>
                        {selectedEmployee.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-nextgen-light-gray" />
                            <span className="text-nextgen-light-gray">{selectedEmployee.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-nextgen-light-gray" />
                          <span className="text-nextgen-light-gray">{selectedEmployee.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-nextgen-light-gray" />
                          <span className="text-nextgen-light-gray">
                            Started {new Date(selectedEmployee.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        {selectedEmployee.salary && (
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-nextgen-light-gray" />
                            <span className="text-nextgen-light-gray">
                              ${selectedEmployee.salary.toLocaleString()}/year
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Work Information</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-nextgen-light-gray">Department:</span>
                          <span className="ml-2 text-white">{selectedEmployee.department}</span>
                        </div>
                        <div>
                          <span className="text-nextgen-light-gray">Position:</span>
                          <span className="ml-2 text-white">{selectedEmployee.position}</span>
                        </div>
                        <div>
                          <span className="text-nextgen-light-gray">Role:</span>
                          <span className="ml-2 text-white">{selectedEmployee.role.replace('_', ' ')}</span>
                        </div>
                        {selectedEmployee.manager && (
                          <div>
                            <span className="text-nextgen-light-gray">Manager:</span>
                            <span className="ml-2 text-white">{selectedEmployee.manager}</span>
                          </div>
                        )}
                        {selectedEmployee.performanceRating && (
                          <div>
                            <span className="text-nextgen-light-gray">Performance:</span>
                            <span className="ml-2 text-white">{selectedEmployee.performanceRating}/5</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'projects' && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Assigned Projects</h3>
                    <div className="space-y-3">
                      {selectedEmployee.assignedProjects.map(projectId => {
                        const project = projects.find(p => p.id === projectId);
                        return project ? (
                          <div key={projectId} className="bg-nextgen-dark-blue p-4 rounded-lg">
                            <h4 className="text-white font-medium">{project.name}</h4>
                            <p className="text-nextgen-light-gray text-sm">Status: {project.status}</p>
                            <p className="text-nextgen-light-gray text-sm">
                              Team: {project.teamMembers.length} members
                            </p>
                          </div>
                        ) : null;
                      })}
                      {selectedEmployee.assignedProjects.length === 0 && (
                        <p className="text-nextgen-light-gray">No projects assigned</p>
                      )}
                    </div>
                  </div>
                )}
                
                {activeTab === 'tasks' && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Assigned Tasks</h3>
                    <div className="space-y-3">
                      {selectedEmployee.assignedTasks.map(taskId => {
                        const task = tasks.find(t => t.id === taskId);
                        return task ? (
                          <div key={taskId} className="bg-nextgen-dark-blue p-4 rounded-lg">
                            <h4 className="text-white font-medium">{task.title}</h4>
                            <p className="text-nextgen-light-gray text-sm">Status: {task.status}</p>
                            {task.projectId && (
                              <p className="text-nextgen-light-gray text-sm">
                                Project: {projects.find(p => p.id === task.projectId)?.name}
                              </p>
                            )}
                          </div>
                        ) : null;
                      })}
                      {selectedEmployee.assignedTasks.length === 0 && (
                        <p className="text-nextgen-light-gray">No tasks assigned</p>
                      )}
                    </div>
                  </div>
                )}
                
                {activeTab === 'performance' && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Performance & Skills</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-white font-medium mb-3">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedEmployee.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-nextgen-teal text-nextgen-dark-gray text-sm rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {selectedEmployee.performanceRating && (
                        <div>
                          <h4 className="text-white font-medium mb-3">Performance Rating</h4>
                          <div className="flex items-center space-x-3">
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <div
                                  key={star}
                                  className={`w-6 h-6 ${
                                    star <= selectedEmployee.performanceRating!
                                      ? 'text-yellow-400'
                                      : 'text-nextgen-light-gray'
                                  }`}
                                >
                                  ★
                                </div>
                              ))}
                            </div>
                            <span className="text-white">
                              {selectedEmployee.performanceRating}/5
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
