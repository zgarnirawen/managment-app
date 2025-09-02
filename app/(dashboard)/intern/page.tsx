'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { 
  GraduationCap, 
  Clock, 
  FileText, 
  ArrowUp, 
  Bell,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Target,
  Calendar
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'assigned' | 'in_progress' | 'completed';
  dueDate: string;
  estimatedHours: number;
}

interface Timesheet {
  id: string;
  date: string;
  hoursWorked: number;
  description: string;
  status: 'draft' | 'submitted' | 'approved';
}

interface TrainingResource {
  id: string;
  title: string;
  type: 'video' | 'document' | 'course';
  progress: number;
  duration: string;
}

export default function InternDashboard() {
  const { user } = useUser();
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [trainingResources, setTrainingResources] = useState<TrainingResource[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load intern-specific data
    loadInternData();
  }, []);

  const loadInternData = async () => {
    try {
      setLoading(true);
      
      // Mock data for intern dashboard
      setAssignedTasks([
        {
          id: '1',
          title: 'Complete React Tutorial',
          description: 'Finish the React fundamentals course and submit practice project',
          priority: 'high',
          status: 'in_progress',
          dueDate: '2025-09-10',
          estimatedHours: 8
        },
        {
          id: '2',
          title: 'Shadow Senior Developer',
          description: 'Attend daily standup meetings and observe code reviews',
          priority: 'medium',
          status: 'assigned',
          dueDate: '2025-09-15',
          estimatedHours: 4
        },
        {
          id: '3',
          title: 'Documentation Review',
          description: 'Review and update team documentation for new features',
          priority: 'low',
          status: 'assigned',
          dueDate: '2025-09-20',
          estimatedHours: 2
        }
      ]);

      setTimesheets([
        {
          id: '1',
          date: '2025-09-01',
          hoursWorked: 6,
          description: 'Worked on React tutorial and attended team meeting',
          status: 'submitted'
        },
        {
          id: '2',
          date: '2025-08-31',
          hoursWorked: 8,
          description: 'Completed onboarding tasks and setup development environment',
          status: 'approved'
        }
      ]);

      setTrainingResources([
        {
          id: '1',
          title: 'JavaScript Fundamentals',
          type: 'course',
          progress: 100,
          duration: '4 hours'
        },
        {
          id: '2',
          title: 'React Basics',
          type: 'course',
          progress: 75,
          duration: '6 hours'
        },
        {
          id: '3',
          title: 'Git Workflow Guide',
          type: 'document',
          progress: 50,
          duration: '1 hour'
        },
        {
          id: '4',
          title: 'Company Policies',
          type: 'document',
          progress: 100,
          duration: '30 minutes'
        }
      ]);

      setNotifications([
        {
          id: '1',
          type: 'task',
          message: 'New task assigned: React Tutorial',
          time: '2 hours ago',
          read: false
        },
        {
          id: '2',
          type: 'deadline',
          message: 'Task "Complete React Tutorial" due in 3 days',
          time: '1 day ago',
          read: false
        },
        {
          id: '3',
          type: 'promotion',
          message: 'Promotion eligibility review scheduled for next month',
          time: '3 days ago',
          read: true
        }
      ]);

    } catch (error) {
      console.error('Error loading intern data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromotionRequest = () => {
    // TODO: Implement promotion request functionality
    alert('Promotion request feature coming soon!');
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

  const markTaskInProgress = (taskId: string) => {
    setAssignedTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, status: 'in_progress' as const }
          : task
      )
    );
  };

  const markTaskCompleted = (taskId: string) => {
    setAssignedTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, status: 'completed' as const }
          : task
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
          <h1 className="text-3xl font-bold">Intern Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">
            🟢 Intern Level 1
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
              <p className="text-sm font-medium text-gray-600">Assigned Tasks</p>
              <p className="text-2xl font-bold">{assignedTasks.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hours This Week</p>
              <p className="text-2xl font-bold">32</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <GraduationCap className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Training Progress</p>
              <p className="text-2xl font-bold">81%</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Bell className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Notifications</p>
              <p className="text-2xl font-bold">
                {notifications.filter(n => !n.read).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Assigned Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignedTasks.map((task) => (
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
                  
                  <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    <span>{task.estimatedHours}h estimated</span>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
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
            </div>
          </CardContent>
        </Card>

        {/* Training Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Training Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trainingResources.map((resource) => (
                <div key={resource.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{resource.title}</h3>
                    <Badge variant="secondary">
                      {resource.type}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">{resource.duration}</span>
                    <span className="text-sm font-medium">{resource.progress}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${resource.progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="mt-3">
                    <Button size="sm" variant="outline" className="w-full">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Continue Learning
                    </Button>
                  </div>
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
                    <span className="font-semibold">
                      {new Date(timesheet.date).toLocaleDateString()}
                    </span>
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

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className={`border rounded-lg p-4 ${
                  !notification.read ? 'bg-blue-50 border-blue-200' : ''
                }`}>
                  <div className="flex items-start gap-3">
                    {notification.type === 'task' && <Target className="w-5 h-5 text-blue-600 mt-0.5" />}
                    {notification.type === 'deadline' && <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />}
                    {notification.type === 'promotion' && <ArrowUp className="w-5 h-5 text-green-600 mt-0.5" />}
                    
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
      </div>

      {/* Promotion Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUp className="w-5 h-5" />
            Promotion Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <GraduationCap className="h-4 w-4" />
            <AlertDescription>
              You're making great progress! Complete your assigned tasks and training to be eligible for promotion to Employee level.
              Current progress: <strong>75% complete</strong>
            </AlertDescription>
          </Alert>
          
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-600 h-3 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Complete 2 more tasks and finish React training to reach 100%
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
