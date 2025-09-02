'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { 
  Users, 
  Clock, 
  FileText, 
  ArrowUp, 
  Bell,
  CheckCircle,
  AlertCircle,
  Calendar,
  Target,
  MessageSquare,
  BarChart3,
  Settings
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'assigned' | 'in_progress' | 'completed';
  dueDate: string;
  estimatedHours: number;
  assignedBy: string;
}

interface Timesheet {
  id: string;
  date: string;
  hoursWorked: number;
  description: string;
  status: 'draft' | 'submitted' | 'approved';
  project: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'away';
  avatar?: string;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  attendees: number;
  type: 'team' | 'one-on-one' | 'project';
}

export default function EmployeeDashboard() {
  const { user } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployeeData();
  }, []);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);
      
      // Mock data for employee dashboard
      setTasks([
        {
          id: '1',
          title: 'Implement User Authentication',
          description: 'Build login/signup functionality with JWT tokens',
          priority: 'high',
          status: 'in_progress',
          dueDate: '2025-09-12',
          estimatedHours: 16,
          assignedBy: 'Manager Smith'
        },
        {
          id: '2',
          title: 'Code Review - Payment Module',
          description: 'Review and test the new payment processing module',
          priority: 'medium',
          status: 'assigned',
          dueDate: '2025-09-15',
          estimatedHours: 4,
          assignedBy: 'Senior Dev Johnson'
        },
        {
          id: '3',
          title: 'Update Documentation',
          description: 'Update API documentation for new endpoints',
          priority: 'low',
          status: 'assigned',
          dueDate: '2025-09-18',
          estimatedHours: 3,
          assignedBy: 'Tech Lead Davis'
        },
        {
          id: '4',
          title: 'Bug Fix - User Profile',
          description: 'Fix profile picture upload issue',
          priority: 'medium',
          status: 'completed',
          dueDate: '2025-09-08',
          estimatedHours: 2,
          assignedBy: 'Manager Smith'
        }
      ]);

      setTimesheets([
        {
          id: '1',
          date: '2025-09-01',
          hoursWorked: 8,
          description: 'Worked on authentication module and attended sprint planning',
          status: 'submitted',
          project: 'User Management System'
        },
        {
          id: '2',
          date: '2025-08-31',
          hoursWorked: 7.5,
          description: 'Bug fixes and code reviews',
          status: 'approved',
          project: 'Main Application'
        },
        {
          id: '3',
          date: '2025-08-30',
          hoursWorked: 8,
          description: 'Feature development and testing',
          status: 'approved',
          project: 'User Management System'
        }
      ]);

      setTeamMembers([
        {
          id: '1',
          name: 'Alice Johnson',
          role: 'Senior Developer',
          status: 'online'
        },
        {
          id: '2',
          name: 'Bob Smith',
          role: 'Manager',
          status: 'online'
        },
        {
          id: '3',
          name: 'Carol Davis',
          role: 'Tech Lead',
          status: 'away'
        },
        {
          id: '4',
          name: 'David Wilson',
          role: 'Employee',
          status: 'offline'
        },
        {
          id: '5',
          name: 'Emma Brown',
          role: 'Intern',
          status: 'online'
        }
      ]);

      setUpcomingMeetings([
        {
          id: '1',
          title: 'Sprint Planning',
          date: '2025-09-03',
          time: '09:00 AM',
          attendees: 8,
          type: 'team'
        },
        {
          id: '2',
          title: 'One-on-One with Manager',
          date: '2025-09-04',
          time: '02:00 PM',
          attendees: 2,
          type: 'one-on-one'
        },
        {
          id: '3',
          title: 'Code Review Session',
          date: '2025-09-05',
          time: '10:30 AM',
          attendees: 4,
          type: 'project'
        }
      ]);

      setNotifications([
        {
          id: '1',
          type: 'task',
          message: 'New task assigned: Code Review - Payment Module',
          time: '1 hour ago',
          read: false
        },
        {
          id: '2',
          type: 'meeting',
          message: 'Sprint Planning meeting tomorrow at 9:00 AM',
          time: '3 hours ago',
          read: false
        },
        {
          id: '3',
          type: 'timesheet',
          message: 'Timesheet for August 31st approved',
          time: '1 day ago',
          read: true
        },
        {
          id: '4',
          type: 'promotion',
          message: 'Promotion review scheduled for next quarter',
          time: '2 days ago',
          read: true
        }
      ]);

    } catch (error) {
      console.error('Error loading employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromotionRequest = () => {
    alert('Promotion request feature coming soon!');
  };

  const markTaskInProgress = (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, status: 'in_progress' as const }
          : task
      )
    );
  };

  const markTaskCompleted = (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, status: 'completed' as const }
          : task
      )
    );
  };

  const submitTimesheet = (timesheetId: string) => {
    setTimesheets(prev => 
      prev.map(t => 
        t.id === timesheetId 
          ? { ...t, status: 'submitted' as const }
          : t
      )
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTeamStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nextgen-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Employee Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-1">
            🔵 Employee Level 2
          </Badge>
          <Button onClick={handlePromotionRequest} variant="outline" size="sm">
            <ArrowUp className="w-4 h-4 mr-2" />
            Request Promotion
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Target className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Tasks</p>
              <p className="text-2xl font-bold">
                {tasks.filter(t => t.status !== 'completed').length}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hours This Week</p>
              <p className="text-2xl font-bold">38</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-2xl font-bold">{teamMembers.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Meetings This Week</p>
              <p className="text-2xl font-bold">{upcomingMeetings.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              My Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.slice(0, 3).map((task) => (
                <div key={task.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{task.title}</h3>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    <span>By: {task.assignedBy}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    {task.status === 'assigned' && (
                      <Button
                        size="sm"
                        onClick={() => markTaskInProgress(task.id)}
                      >
                        Start Task
                      </Button>
                    )}
                    {task.status === 'in_progress' && (
                      <Button
                        size="sm"
                        onClick={() => markTaskCompleted(task.id)}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full">
                View All Tasks ({tasks.length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getTeamStatusColor(member.status)}`}></div>
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                  </div>
                  
                  <Button size="sm" variant="outline">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Chat
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Timesheets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Timesheets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timesheets.map((timesheet) => (
                <div key={timesheet.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-semibold">
                        {new Date(timesheet.date).toLocaleDateString()}
                      </span>
                      <p className="text-sm text-gray-600">{timesheet.project}</p>
                    </div>
                    <Badge className={getStatusColor(timesheet.status)}>
                      {timesheet.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {timesheet.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      <strong>{timesheet.hoursWorked}h</strong> worked
                    </span>
                    {timesheet.status === 'draft' && (
                      <Button 
                        size="sm"
                        onClick={() => submitTimesheet(timesheet.id)}
                      >
                        Submit
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                New Timesheet Entry
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Meetings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Meetings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{meeting.title}</h3>
                    <Badge variant="secondary" className="capitalize">
                      {meeting.type.replace('-', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>
                      {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
                    </span>
                    <span>{meeting.attendees} attendees</span>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">
                      <Calendar className="w-4 h-4 mr-1" />
                      Join
                    </Button>
                    <Button size="sm" variant="outline">
                      Details
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full">
                View All Meetings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.slice(0, 4).map((notification) => (
                <div key={notification.id} className={`border rounded-lg p-4 ${
                  !notification.read ? 'bg-blue-50 border-blue-200' : ''
                }`}>
                  <div className="flex items-start gap-3">
                    {notification.type === 'task' && <Target className="w-5 h-5 text-blue-600 mt-0.5" />}
                    {notification.type === 'meeting' && <Calendar className="w-5 h-5 text-green-600 mt-0.5" />}
                    {notification.type === 'timesheet' && <Clock className="w-5 h-5 text-purple-600 mt-0.5" />}
                    {notification.type === 'promotion' && <ArrowUp className="w-5 h-5 text-orange-600 mt-0.5" />}
                    
                    <div className="flex-1">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                    
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Task Completion Rate</span>
                  <span className="text-sm text-gray-600">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Code Quality Score</span>
                  <span className="text-sm text-gray-600">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Meeting Attendance</span>
                  <span className="text-sm text-gray-600">95%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
              
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Great performance! You're on track for promotion to Manager level.
                  Keep up the excellent work!
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}