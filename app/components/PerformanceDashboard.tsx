'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Award,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface PerformanceData {
  employee: {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    imageUrl?: string;
  };
  period: {
    start: string;
    end: string;
    period: string;
  };
  performanceScore: number;
  taskMetrics: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    overdue: number;
    completionRate: number;
  };
  priorityDistribution: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    URGENT: number;
  };
  attendanceMetrics: {
    workDays: number;
    totalHours: number;
    avgHoursPerDay: number;
    lateArrivals: number;
    earlyDepartures: number;
  };
  projectMetrics: {
    totalProjects: number;
    managedProjects: number;
    completedProjects: number;
    tasksAcrossProjects: number;
  };
  dailyPerformance: Array<{
    date: string;
    tasksCompleted: number;
    hoursWorked: number;
    efficiency: number;
  }>;
  summary: {
    strengths: string[];
    improvements: string[];
    recommendations: string[];
  };
}

interface PerformanceDashboardProps {
  employeeId?: string;
  period?: string;
}

export default function PerformanceDashboard({ 
  employeeId, 
  period = 'month' 
}: PerformanceDashboardProps) {
  const { user } = useUser();
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPerformanceData();
    }
  }, [user, employeeId, selectedPeriod]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(employeeId && { employeeId })
      });

      const response = await fetch(`/api/performance?${params}`);
      const result = await response.json();

      if (response.ok) {
        setData(result);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch performance data');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Satisfactory';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {data.employee.imageUrl && (
            <img
              src={data.employee.imageUrl}
              alt={data.employee.name}
              className="w-12 h-12 rounded-full"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Performance Dashboard
            </h1>
            <p className="text-gray-600">
              {data.employee.name} • {data.employee.role} • {data.employee.department}
            </p>
          </div>
        </div>

        {/* Period Selector */}
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Performance Score */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Overall Performance Score
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900">
                {data.performanceScore}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(data.performanceScore)}`}>
                {getScoreLabel(data.performanceScore)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <Award className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              Based on tasks, attendance, and projects
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Task Completion */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-bold text-gray-900">
              {data.taskMetrics.completionRate}%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Task Completion</h3>
          <p className="text-xs text-gray-500">
            {data.taskMetrics.completed} of {data.taskMetrics.total} tasks completed
          </p>
        </div>

        {/* Work Hours */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-gray-900">
              {data.attendanceMetrics.avgHoursPerDay.toFixed(1)}h
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Avg Daily Hours</h3>
          <p className="text-xs text-gray-500">
            {data.attendanceMetrics.totalHours}h total this period
          </p>
        </div>

        {/* Projects */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold text-gray-900">
              {data.projectMetrics.totalProjects}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Active Projects</h3>
          <p className="text-xs text-gray-500">
            {data.projectMetrics.managedProjects} managed, {data.projectMetrics.completedProjects} completed
          </p>
        </div>

        {/* Punctuality */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold text-gray-900">
              {Math.max(0, data.attendanceMetrics.workDays - data.attendanceMetrics.lateArrivals)}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">On-Time Days</h3>
          <p className="text-xs text-gray-500">
            {data.attendanceMetrics.lateArrivals} late arrivals
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Task Status</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="text-sm font-medium text-green-600">
                {data.taskMetrics.completed}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">In Progress</span>
              <span className="text-sm font-medium text-blue-600">
                {data.taskMetrics.inProgress}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="text-sm font-medium text-yellow-600">
                {data.taskMetrics.pending}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Overdue</span>
              <span className="text-sm font-medium text-red-600">
                {data.taskMetrics.overdue}
              </span>
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Task Priority</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Urgent</span>
              <span className="text-sm font-medium text-red-600">
                {data.priorityDistribution.URGENT}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">High</span>
              <span className="text-sm font-medium text-orange-600">
                {data.priorityDistribution.HIGH}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Medium</span>
              <span className="text-sm font-medium text-yellow-600">
                {data.priorityDistribution.MEDIUM}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Low</span>
              <span className="text-sm font-medium text-green-600">
                {data.priorityDistribution.LOW}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strengths */}
        <div className="bg-green-50 rounded-lg border border-green-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">Strengths</h3>
          </div>
          
          {data.summary.strengths.length > 0 ? (
            <ul className="space-y-2">
              {data.summary.strengths.map((strength, index) => (
                <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  {strength}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-green-700">Keep up the good work!</p>
          )}
        </div>

        {/* Areas for Improvement */}
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-yellow-900">Improvements</h3>
          </div>
          
          {data.summary.improvements.length > 0 ? (
            <ul className="space-y-2">
              {data.summary.improvements.map((improvement, index) => (
                <li key={index} className="text-sm text-yellow-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  {improvement}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-yellow-700">Excellent performance across all areas!</p>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Recommendations</h3>
          </div>
          
          {data.summary.recommendations.length > 0 ? (
            <ul className="space-y-2">
              {data.summary.recommendations.map((recommendation, index) => (
                <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                  <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  {recommendation}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-blue-700">Continue current excellent practices!</p>
          )}
        </div>
      </div>

      {/* Recent Performance Trend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Performance (Last 14 Days)</h3>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {data.dailyPerformance.slice(-7).map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-500 mb-1">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`h-8 rounded flex items-center justify-center text-xs font-medium ${
                day.efficiency >= 80 ? 'bg-green-100 text-green-800' :
                day.efficiency >= 60 ? 'bg-yellow-100 text-yellow-800' :
                day.efficiency > 0 ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-500'
              }`}>
                {day.efficiency > 0 ? `${day.efficiency}%` : '-'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {day.hoursWorked}h
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
