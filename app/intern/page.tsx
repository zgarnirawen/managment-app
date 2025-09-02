'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Target, 
  Trophy, 
  Calendar, 
  Bell, 
  Settings,
  LogOut,
  Clock,
  TrendingUp,
  CheckCircle,
  Star,
  Award,
  User,
  ChevronRight,
  Play,
  FileText,
  Users
} from 'lucide-react';
import GamificationSystem from '../components/GamificationSystem';

interface DashboardStats {
  coursesCompleted: number;
  tasksAssigned: number;
  hoursLearned: number;
  mentorMeetings: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedBy: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  category: string;
}

export default function InternDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    coursesCompleted: 3,
    tasksAssigned: 8,
    hoursLearned: 24,
    mentorMeetings: 5
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (isLoaded && user) {
      const userRole = user.unsafeMetadata?.role;
      if (userRole !== 'intern') {
        router.push('/dashboard');
        return;
      }
      fetchDashboardData();
    }
  }, [isLoaded, user, router]);

  const fetchDashboardData = async () => {
    try {
      // Mock data - in real app, fetch from API
      setTasks([
        {
          id: '1',
          title: 'Complete React Basics Course',
          description: 'Finish all modules in the React fundamentals course',
          priority: 'high',
          dueDate: '2025-09-05',
          status: 'in-progress',
          assignedBy: 'Sarah Johnson (Mentor)'
        },
        {
          id: '2',
          title: 'Submit Project Documentation',
          description: 'Document the learning management system project',
          priority: 'medium',
          dueDate: '2025-09-10',
          status: 'pending',
          assignedBy: 'Mike Chen (Manager)'
        },
        {
          id: '3',
          title: 'Attend Team Standup',
          description: 'Join daily standup meeting at 9 AM',
          priority: 'low',
          dueDate: '2025-09-03',
          status: 'completed',
          assignedBy: 'Team Lead'
        }
      ]);

      setCourses([
        {
          id: '1',
          title: 'JavaScript Fundamentals',
          description: 'Learn the basics of JavaScript programming',
          progress: 100,
          totalLessons: 12,
          completedLessons: 12,
          category: 'Programming'
        },
        {
          id: '2',
          title: 'React Development',
          description: 'Build modern web applications with React',
          progress: 65,
          totalLessons: 15,
          completedLessons: 10,
          category: 'Frontend'
        },
        {
          id: '3',
          title: 'Team Collaboration',
          description: 'Effective communication and teamwork skills',
          progress: 30,
          totalLessons: 8,
          completedLessons: 2,
          category: 'Soft Skills'
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'learning', label: 'Learning', icon: BookOpen },
    { id: 'tasks', label: 'Tasks', icon: Target },
    { id: 'gamification', label: 'Progress', icon: Trophy }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">🎓</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Intern Learning Dashboard</h1>
                  <p className="text-green-200">Welcome to your learning journey, {user?.firstName}!</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-green-500/20 border border-green-400/30 rounded-lg px-3 py-2">
                <p className="text-green-100 text-sm font-medium">🎓 Intern</p>
              </div>
              <button className="relative p-2 text-green-200 hover:text-white hover:bg-green-600 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button 
                onClick={() => router.push('/settings')}
                className="p-2 text-green-200 hover:text-white hover:bg-green-600 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={() => router.push('/sign-out')}
                className="p-2 text-green-200 hover:text-white hover:bg-green-600 rounded-lg transition-colors"
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
                      ? 'border-green-500 text-green-600'
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
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Courses Completed"
                value={stats.coursesCompleted}
                subtitle="This month"
                icon={BookOpen}
                color="bg-green-500"
              />
              <StatCard
                title="Tasks Assigned"
                value={stats.tasksAssigned}
                subtitle="Active tasks"
                icon={Target}
                color="bg-blue-500"
              />
              <StatCard
                title="Learning Hours"
                value={stats.hoursLearned}
                subtitle="Total this month"
                icon={Clock}
                color="bg-purple-500"
              />
              <StatCard
                title="Mentor Meetings"
                value={stats.mentorMeetings}
                subtitle="This month"
                icon={Users}
                color="bg-orange-500"
              />
            </div>

            {/* Welcome Message */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Star className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Welcome to Your Internship!</h3>
              </div>
              <p className="text-gray-700 mb-4">
                As an intern, you have access to learning courses, task assignments, and mentorship opportunities. 
                Complete your learning goals to progress toward promotion to employee status.
              </p>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Your Path to Promotion:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Complete assigned learning courses
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Finish all assigned tasks on time
                  </li>
                  <li className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    Demonstrate collaboration skills
                  </li>
                  <li className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-500" />
                    Get positive mentor feedback
                  </li>
                </ul>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tasks</h3>
                <div className="space-y-3">
                  {tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${
                        task.status === 'completed' ? 'bg-green-500' :
                        task.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                        <p className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress</h3>
                <div className="space-y-4">
                  {courses.slice(0, 3).map((course) => (
                    <div key={course.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{course.title}</p>
                        <span className="text-xs text-gray-500">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-green-500 transition-all duration-300"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'learning' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">My Learning Courses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {course.category}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {course.completedLessons}/{course.totalLessons}
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-2">{course.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                    
                    <div className="space-y-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-green-500 transition-all duration-300"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <Play className="w-4 h-4" />
                        {course.progress === 100 ? 'Review Course' : 'Continue Learning'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Tasks</h3>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        <p className="text-xs text-gray-500">Assigned by: {task.assignedBy}</p>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority} priority
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                          {task.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                        View Details <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gamification' && <GamificationSystem />}
      </div>
    </div>
  );
}
