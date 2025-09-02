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
  Settings,
  UserPlus,
  DollarSign,
  TrendingUp,
  Award
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'away';
  tasksCompleted: number;
  hoursThisWeek: number;
  performance: number;
}

interface Task {
  id: string;
  title: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  dueDate: string;
  estimatedHours: number;
}

interface TimesheetApproval {
  id: string;
  employeeName: string;
  date: string;
  hoursWorked: number;
  description: string;
  project: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Budget {
  allocated: number;
  spent: number;
  remaining: number;
  category: string;
}

export default function ManagerDashboard() {
  const { user } = useUser();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pendingTimesheets, setPendingTimesheets] = useState<TimesheetApproval[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadManagerData();
  }, []);

  const loadManagerData = async () => {
    try {
      setLoading(true);
      
      // Mock data for manager dashboard
      setTeamMembers([
        {
          id: '1',
          name: 'Alice Johnson',
          role: 'Senior Employee',
          status: 'online',
          tasksCompleted: 23,
          hoursThisWeek: 38,
          performance: 92
        },
        {
          id: '2',
          name: 'Bob Wilson',
          role: 'Employee',
          status: 'online',
          tasksCompleted: 18,
          hoursThisWeek: 40,
          performance: 87
        },
        {
          id: '3',
          name: 'Carol Davis',
          role: 'Employee',
          status: 'away',
          tasksCompleted: 15,
          hoursThisWeek: 35,
          performance: 78
        },
        {
          id: '4',
          name: 'David Brown',
          role: 'Intern',
          status: 'online',
          tasksCompleted: 8,
          hoursThisWeek: 32,
          performance: 85
        },
        {
          id: '5',
          name: 'Emma Smith',
          role: 'Intern',
          status: 'offline',
          tasksCompleted: 6,
          hoursThisWeek: 28,
          performance: 82
        }
      ]);

      setTasks([
        {
          id: '1',
          title: 'API Integration Testing',
          assignee: 'Alice Johnson',
          priority: 'high',
          status: 'in_progress',
          dueDate: '2025-09-10',
          estimatedHours: 12
        },
        {
          id: '2',
          title: 'Database Optimization',
          assignee: 'Bob Wilson',
          priority: 'medium',
          status: 'assigned',
          dueDate: '2025-09-15',
          estimatedHours: 16
        },
        {
          id: '3',
          title: 'User Interface Redesign',
          assignee: 'Carol Davis',
          priority: 'low',
          status: 'overdue',
          dueDate: '2025-09-01',
          estimatedHours: 20
        },
        {
          id: '4',
          title: 'Documentation Update',
          assignee: 'David Brown',
          priority: 'medium',
          status: 'completed',
          dueDate: '2025-09-05',
          estimatedHours: 8
        }
      ]);

      setPendingTimesheets([
        {
          id: '1',
          employeeName: 'Alice Johnson',
          date: '2025-09-01',
          hoursWorked: 8,
          description: 'API integration and testing work',
          project: 'Payment System',
          status: 'pending'
        },
        {
          id: '2',
          employeeName: 'Bob Wilson',
          date: '2025-09-01',
          hoursWorked: 7.5,
          description: 'Database queries optimization',
          project: 'Performance Improvement',
          status: 'pending'
        },
        {
          id: '3',
          employeeName: 'Carol Davis',
          date: '2025-08-31',
          hoursWorked: 8,
          description: 'UI component development',
          project: 'Frontend Redesign',
          status: 'pending'
        }
      ]);

      setBudgets([
        {
          allocated: 50000,
          spent: 32000,
          remaining: 18000,
          category: 'Development'
        },
        {
          allocated: 20000,
          spent: 15000,
          remaining: 5000,
          category: 'Training'
        },
        {
          allocated: 15000,
          spent: 8000,
          remaining: 7000,
          category: 'Equipment'
        }
      ]);

      setNotifications([
        {
          id: '1',
          type: 'timesheet',
          message: '3 timesheets pending approval',
          time: '30 minutes ago',
          read: false
        },
        {
          id: '2',
          type: 'task',
          message: 'Task "User Interface Redesign" is overdue',
          time: '2 hours ago',
          read: false
        },
        {
          id: '3',
          type: 'budget',
          message: 'Development budget 64% utilized',
          time: '1 day ago',
          read: true
        },
        {
          id: '4',
          type: 'promotion',
          message: 'Alice Johnson eligible for promotion review',
          time: '2 days ago',
          read: false
        }
      ]);

    } catch (error) {
      console.error('Error loading manager data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromotionRequest = () => {
    alert('Promotion request feature coming soon!');
  };

  const approveTimesheet = (timesheetId: string) => {
    setPendingTimesheets(prev =>
      prev.map(timesheet =>
        timesheet.id === timesheetId
          ? { ...timesheet, status: 'approved' as const }
          : timesheet
      )
    );
  };

  const rejectTimesheet = (timesheetId: string) => {
    setPendingTimesheets(prev =>
      prev.map(timesheet =>
        timesheet.id === timesheetId
          ? { ...timesheet, status: 'rejected' as const }
          : timesheet
      )
    );
  };

  const assignTask = () => {
    alert('Task assignment feature coming soon!');
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
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
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
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-purple-100 text-purple-800 text-sm px-3 py-1">
            🟣 Manager Level 3
          </Badge>
          <Button onClick={handlePromotionRequest} variant="outline" size="sm">
            <ArrowUp className="w-4 h-4 mr-2" />
            Request Promotion
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-2xl font-bold">{teamMembers.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Target className="h-8 w-8 text-green-600" />
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
            <Clock className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold">
                {pendingTimesheets.filter(t => t.status === 'pending').length}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSign className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Budget Used</p>
              <p className="text-2xl font-bold">64%</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Team Performance</p>
              <p className="text-2xl font-bold">85%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Overview */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Overview
              </CardTitle>
              <Button size="sm" onClick={assignTask}>
                <UserPlus className="w-4 h-4 mr-1" />
                Assign Task
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
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
                    <Badge className={`${member.performance >= 90 ? 'bg-green-100 text-green-800' : 
                      member.performance >= 80 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {member.performance}%
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Tasks: </span>
                      <span className="font-medium">{member.tasksCompleted}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Hours: </span>
                      <span className="font-medium">{member.hoursThisWeek}h</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Chat
                    </Button>
                    <Button size="sm" variant="outline">
                      <Award className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Task Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Task Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.map((task) => (
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
                  
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                    <span>Assigned to: <strong>{task.assignee}</strong></span>
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {task.estimatedHours}h estimated
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      {task.status === 'overdue' && (
                        <Button size="sm" variant="destructive">
                          Follow Up
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full">
                <Target className="w-4 h-4 mr-2" />
                Create New Task
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timesheet Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Timesheet Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTimesheets.filter(t => t.status === 'pending').map((timesheet) => (
                <div key={timesheet.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{timesheet.employeeName}</h3>
                      <p className="text-sm text-gray-600">{timesheet.project}</p>
                    </div>
                    <Badge className={getStatusColor(timesheet.status)}>
                      {timesheet.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {timesheet.description}
                  </p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm">
                      <strong>{timesheet.hoursWorked}h</strong> on {new Date(timesheet.date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => approveTimesheet(timesheet.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => rejectTimesheet(timesheet.id)}
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
              
              {pendingTimesheets.filter(t => t.status === 'pending').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No pending timesheets to review
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Budget Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Budget Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {budgets.map((budget, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{budget.category}</span>
                    <span className="text-sm text-gray-600">
                      ${budget.spent.toLocaleString()} / ${budget.allocated.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        (budget.spent / budget.allocated) > 0.8 ? 'bg-red-600' :
                        (budget.spent / budget.allocated) > 0.6 ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${(budget.spent / budget.allocated) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-1 text-sm text-gray-600">
                    <span>{Math.round((budget.spent / budget.allocated) * 100)}% used</span>
                    <span>${budget.remaining.toLocaleString()} remaining</span>
                  </div>
                </div>
              ))}
              
              <Alert>
                <DollarSign className="h-4 w-4" />
                <AlertDescription>
                  Development budget is 64% utilized. Monitor spending to stay within limits.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Team Performance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">85%</div>
              <div className="text-sm text-gray-600">Average Performance</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">92%</div>
              <div className="text-sm text-gray-600">Task Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">167h</div>
              <div className="text-sm text-gray-600">Total Hours This Week</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">2</div>
              <div className="text-sm text-gray-600">Promotion Candidates</div>
            </div>
          </div>
          
          <div className="mt-6">
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                Team performance has improved by 12% this quarter. Alice Johnson and Bob Wilson are eligible for promotion reviews.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
