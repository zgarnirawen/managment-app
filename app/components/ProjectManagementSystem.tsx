// Project and Task Management System
// Implements sprint management, task CRUD, Kanban board, and assignment functionality

'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Calendar, Users, Clock, Flag, CheckCircle, Circle, Pause, Play, MoreHorizontal, Filter, Search } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo: string
  assignedToName: string
  dueDate: string
  estimatedHours: number
  actualHours: number
  sprintId: string
  projectId: string
  createdAt: string
  updatedAt: string
  comments: number
  attachments: number
}

interface Sprint {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  status: 'planning' | 'active' | 'completed'
  projectId: string
  tasks: Task[]
  progress: number
}

interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'on_hold' | 'completed'
  startDate: string
  endDate: string
  teamMembers: string[]
  sprints: Sprint[]
  totalTasks: number
  completedTasks: number
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Employee Management System',
    description: 'Complete overhaul of the employee management platform',
    status: 'active',
    startDate: '2024-09-01',
    endDate: '2024-12-31',
    teamMembers: ['1', '2', '3', '4'],
    sprints: [],
    totalTasks: 24,
    completedTasks: 8
  },
  {
    id: '2', 
    name: 'Mobile App Development',
    description: 'Cross-platform mobile application for time tracking',
    status: 'active',
    startDate: '2024-10-01',
    endDate: '2025-03-31',
    teamMembers: ['2', '4'],
    sprints: [],
    totalTasks: 16,
    completedTasks: 3
  }
]

const mockSprints: Sprint[] = [
  {
    id: '1',
    name: 'Sprint 1 - Foundation',
    description: 'Set up basic infrastructure and authentication',
    startDate: '2024-09-01',
    endDate: '2024-09-15',
    status: 'completed',
    projectId: '1',
    tasks: [],
    progress: 100
  },
  {
    id: '2',
    name: 'Sprint 2 - Core Features',
    description: 'Implement time tracking and employee management',
    startDate: '2024-09-16',
    endDate: '2024-09-30',
    status: 'active',
    projectId: '1',
    tasks: [],
    progress: 65
  }
]

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design Time Tracking Interface',
    description: 'Create wireframes and mockups for the time tracking dashboard',
    status: 'done',
    priority: 'high',
    assignedTo: '2',
    assignedToName: 'Sarah Wilson',
    dueDate: '2024-09-20',
    estimatedHours: 8,
    actualHours: 6,
    sprintId: '2',
    projectId: '1',
    createdAt: '2024-09-10',
    updatedAt: '2024-09-18',
    comments: 3,
    attachments: 2
  },
  {
    id: '2',
    title: 'Implement Clock-in/Clock-out API',
    description: 'Build backend API endpoints for time tracking functionality',
    status: 'in_progress',
    priority: 'high',
    assignedTo: '1',
    assignedToName: 'John Smith',
    dueDate: '2024-09-25',
    estimatedHours: 12,
    actualHours: 8,
    sprintId: '2',
    projectId: '1',
    createdAt: '2024-09-12',
    updatedAt: '2024-09-22',
    comments: 5,
    attachments: 1
  },
  {
    id: '3',
    title: 'Employee Directory Frontend',
    description: 'Create responsive employee directory with search and filters',
    status: 'todo',
    priority: 'medium',
    assignedTo: '4',
    assignedToName: 'Emma Davis',
    dueDate: '2024-09-28',
    estimatedHours: 10,
    actualHours: 0,
    sprintId: '2',
    projectId: '1',
    createdAt: '2024-09-15',
    updatedAt: '2024-09-15',
    comments: 1,
    attachments: 0
  },
  {
    id: '4',
    title: 'Database Schema Optimization',
    description: 'Optimize database queries and add necessary indexes',
    status: 'review',
    priority: 'medium',
    assignedTo: '3',
    assignedToName: 'Mike Brown',
    dueDate: '2024-09-24',
    estimatedHours: 6,
    actualHours: 7,
    sprintId: '2',
    projectId: '1',
    createdAt: '2024-09-08',
    updatedAt: '2024-09-21',
    comments: 2,
    attachments: 0
  }
]

const mockTeamMembers = [
  { id: '1', name: 'John Smith', role: 'Manager', avatar: 'JS' },
  { id: '2', name: 'Sarah Wilson', role: 'Employee', avatar: 'SW' },
  { id: '3', name: 'Mike Brown', role: 'Employee', avatar: 'MB' },
  { id: '4', name: 'Emma Davis', role: 'Intern', avatar: 'ED' }
]

interface ProjectManagementSystemProps {
  userRole: string
  currentUserId: string
}

export default function ProjectManagementSystem({ userRole, currentUserId }: ProjectManagementSystemProps) {
  const [activeTab, setActiveTab] = useState('projects')
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [sprints, setSprints] = useState<Sprint[]>(mockSprints)
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [selectedProject, setSelectedProject] = useState<string>('1')
  const [selectedSprint, setSelectedSprint] = useState<string>('2')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterAssignee, setFilterAssignee] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Permission checks
  const canCreateProjects = ['manager', 'admin', 'super_admin'].includes(userRole.toLowerCase())
  const canAssignTasks = ['manager', 'admin', 'super_admin'].includes(userRole.toLowerCase())
  const canEditAllTasks = ['manager', 'admin', 'super_admin'].includes(userRole.toLowerCase())

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo':
        return <Circle className="w-4 h-4" />
      case 'in_progress':
        return <Play className="w-4 h-4" />
      case 'review':
        return <Pause className="w-4 h-4" />
      case 'done':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Circle className="w-4 h-4" />
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesProject = task.projectId === selectedProject
    const matchesSprint = selectedSprint === 'all' || task.sprintId === selectedSprint
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus
    const matchesAssignee = filterAssignee === 'all' || task.assignedTo === filterAssignee
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesProject && matchesSprint && matchesStatus && matchesAssignee && matchesSearch
  })

  const groupedTasks = {
    todo: filteredTasks.filter(t => t.status === 'todo'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    review: filteredTasks.filter(t => t.status === 'review'),
    done: filteredTasks.filter(t => t.status === 'done')
  }

  const handleTaskStatusChange = (taskId: string, newStatus: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus as Task['status'], updatedAt: new Date().toISOString() }
        : task
    ))
  }

  const tabs = [
    { id: 'projects', label: 'Projects', icon: Flag },
    { id: 'kanban', label: 'Kanban Board', icon: CheckCircle },
    { id: 'calendar', label: 'Calendar', icon: Calendar }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Management</h2>
            <p className="text-gray-600">Manage projects, sprints, and tasks efficiently</p>
          </div>
          {canCreateProjects && (
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Project
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Sprint
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">{projects.filter(p => p.status === 'active').length}</p>
            </div>
            <Flag className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{tasks.filter(t => t.status === 'in_progress').length}</p>
            </div>
            <Play className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{tasks.filter(t => t.status === 'done').length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              {/* Project Selector */}
              <div className="flex items-center gap-4">
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
                <select
                  value={selectedSprint}
                  onChange={(e) => setSelectedSprint(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">All Sprints</option>
                  {sprints.filter(s => s.projectId === selectedProject).map(sprint => (
                    <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
                  ))}
                </select>
              </div>

              {/* Project Overview */}
              {projects.filter(p => p.id === selectedProject).map(project => (
                <div key={project.id} className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
                      <p className="text-gray-600 mt-1">{project.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      project.status === 'active' ? 'bg-green-100 text-green-800' :
                      project.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Progress</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(project.completedTasks / project.totalTasks) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round((project.completedTasks / project.totalTasks) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Timeline</div>
                      <div className="text-sm font-medium mt-1">
                        {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Team</div>
                      <div className="flex -space-x-2 mt-1">
                        {mockTeamMembers.filter(member => project.teamMembers.includes(member.id)).map(member => (
                          <div
                            key={member.id}
                            className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                            title={member.name}
                          >
                            {member.avatar}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Sprints */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Project Sprints</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sprints.filter(s => s.projectId === selectedProject).map(sprint => (
                    <div key={sprint.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h5 className="font-medium text-gray-900">{sprint.name}</h5>
                          <p className="text-sm text-gray-600 mt-1">{sprint.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          sprint.status === 'active' ? 'bg-green-100 text-green-800' :
                          sprint.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {sprint.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{sprint.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${sprint.progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{new Date(sprint.startDate).toLocaleDateString()}</span>
                          <span>{new Date(sprint.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Kanban Board Tab */}
          {activeTab === 'kanban' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <select
                  value={filterAssignee}
                  onChange={(e) => setFilterAssignee(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">All Assignees</option>
                  {mockTeamMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
                {canAssignTasks && (
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4" />
                    Add Task
                  </button>
                )}
              </div>

              {/* Kanban Columns */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {Object.entries(groupedTasks).map(([status, statusTasks]) => (
                  <div key={status} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900 capitalize flex items-center gap-2">
                        {getStatusIcon(status)}
                        {status.replace('_', ' ')}
                      </h4>
                      <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                        {statusTasks.length}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {statusTasks.map(task => (
                        <div key={task.id} className="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-gray-900 text-sm">{task.title}</h5>
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                          
                          <div className="flex items-center justify-between mb-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {task.estimatedHours}h
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                {task.assignedToName.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          </div>
                          
                          {(canEditAllTasks || task.assignedTo === currentUserId) && (
                            <div className="mt-3 pt-3 border-t">
                              <select
                                value={task.status}
                                onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="review">Review</option>
                                <option value="done">Done</option>
                              </select>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar Integration</h3>
                <p className="text-gray-600 mb-4">
                  View all your tasks, deadlines, and sprint milestones in a calendar format.
                </p>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Coming Soon - FullCalendar Integration
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
