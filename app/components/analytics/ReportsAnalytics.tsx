'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Users, 
  Download,
  Filter,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react'

interface AnalyticsData {
  summary?: any
  charts?: any
  velocityTrend?: any[]
  statusBreakdown?: any
  employees?: any[]
  departments?: any[]
  // Add missing properties from analytics API
  sprints?: any[]
  tasks?: {
    total: number
    completed: number
    inProgress: number
    pending: number
    blocked: number
  }
  completionRate?: number
  priorityBreakdown?: {
    HIGH: number
    MEDIUM: number
    LOW: number
  }
  averageVelocity?: number
  averageCompletionRate?: number
  averageProductivity?: number
  totalSprints?: number
  period?: {
    startDate: Date
    endDate: Date
  }
}

interface ReportsAnalyticsProps {
  department?: string
  employee?: string
  className?: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({ 
  department, 
  employee, 
  className = '' 
}) => {
  const [data, setData] = useState<AnalyticsData>({})
  const [loading, setLoading] = useState(true)
  const [reportType, setReportType] = useState('dashboard')
  const [dateRange, setDateRange] = useState('30d')
  const [selectedDepartment, setSelectedDepartment] = useState(department || 'all')
  const [selectedEmployee, setSelectedEmployee] = useState(employee || 'all')

  useEffect(() => {
    fetchAnalytics()
  }, [reportType, dateRange, selectedDepartment, selectedEmployee])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        type: reportType,
        dateRange: dateRange,
        ...(selectedDepartment !== 'all' && { department: selectedDepartment }),
        ...(selectedEmployee !== 'all' && { employee: selectedEmployee })
      })

      const response = await fetch(`/api/analytics?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async () => {
    try {
      // Use the real export utilities
      const { exportToExcel, exportToPDF } = await import('../../lib/exportUtils');
      
      let exportData: any[] = [];
      let filename = `analytics-report-${reportType}`;
      
      switch (reportType) {
        case 'sprint-velocity':
          exportData = data.velocityTrend?.map((sprint: any) => ({
            'Sprint Name': sprint.sprintName,
            'Planned Points': sprint.plannedPoints,
            'Completed Points': sprint.completedPoints,
            'Velocity %': sprint.velocity,
            'Completion Rate %': sprint.completionRate
          })) || [];
          break;
        
        case 'employee-productivity':
          exportData = data.employees?.map((emp: any) => ({
            'Employee': emp.name,
            'Department': emp.department,
            'Completed Tasks': emp.completed,
            'In Progress': emp.inProgress,
            'Pending': emp.pending,
            'Productivity %': emp.productivity
          })) || [];
          break;
        
        default:
          if (data.summary) {
            exportData = Object.entries(data.summary).map(([key, value]) => ({
              'Metric': key,
              'Value': value
            }));
          }
          break;
      }
      
      if (exportData.length > 0) {
        exportToExcel(exportData, filename, Object.keys(exportData[0]));
      }
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  const generateCSVData = () => {
    let csv = ''
    
    switch (reportType) {
      case 'sprint-velocity':
        csv = 'Sprint Name,Planned Points,Completed Points,Velocity,Completion Rate\n'
        data.velocityTrend?.forEach((sprint: any) => {
          csv += `${sprint.sprintName},${sprint.plannedPoints},${sprint.completedPoints},${sprint.velocity},${sprint.completionRate}%\n`
        })
        break
      
      case 'employee-productivity':
        csv = 'Employee,Department,Completed Tasks,In Progress,Pending,Productivity\n'
        data.employees?.forEach((emp: any) => {
          csv += `${emp.name},${emp.department},${emp.completed},${emp.inProgress},${emp.pending},${emp.productivity}%\n`
        })
        break
      
      default:
        csv = 'Metric,Value\n'
        if (data.summary) {
          Object.entries(data.summary).forEach(([key, value]) => {
            csv += `${key},${value}\n`
          })
        }
        break
    }
    
    return csv
  }

  if (loading) {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Reports & Analytics
              </CardTitle>
              <CardDescription>
                Track performance, productivity, and project metrics
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dashboard">Dashboard Overview</SelectItem>
                  <SelectItem value="sprint-velocity">Sprint Velocity</SelectItem>
                  <SelectItem value="task-completion">Task Completion</SelectItem>
                  <SelectItem value="employee-productivity">Employee Productivity</SelectItem>
                  <SelectItem value="department-overview">Department Overview</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 3 months</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="DevOps">DevOps</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={exportReport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      {data.summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                  <p className="text-3xl font-bold">{data.summary.totalTasks}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{data.summary.completedTasks}</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Sprints</p>
                  <p className="text-3xl font-bold text-orange-600">{data.summary.activeSprints}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Velocity</p>
                  <p className="text-3xl font-bold text-purple-600">{data.summary.avgVelocity}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sprint Velocity Chart */}
      {reportType === 'sprint-velocity' && data.velocityTrend && (
        <Card>
          <CardHeader>
            <CardTitle>Sprint Velocity Trend</CardTitle>
            <CardDescription>
              Track sprint velocity and completion rates over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.velocityTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sprintName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="plannedPoints" fill="#8884d8" name="Planned Points" />
                  <Bar dataKey="completedPoints" fill="#82ca9d" name="Completed Points" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{data.averageVelocity}</p>
                <p className="text-sm text-gray-600">Average Velocity</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{data.averageCompletionRate}%</p>
                <p className="text-sm text-gray-600">Avg Completion Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{data.totalSprints}</p>
                <p className="text-sm text-gray-600">Total Sprints</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Completion Chart */}
      {reportType === 'task-completion' && data.statusBreakdown && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(data.statusBreakdown).map(([key, value]) => ({
                        name: key.charAt(0).toUpperCase() + key.slice(1),
                        value
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(data.statusBreakdown).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Priority Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.priorityBreakdown && Object.entries(data.priorityBreakdown).map(([priority, count]: [string, any]) => (
                  <div key={priority} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={priority === 'high' ? 'destructive' : priority === 'medium' ? 'default' : 'secondary'}
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </Badge>
                    </div>
                    <span className="text-2xl font-bold">{count}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{data.completionRate}%</p>
                  <p className="text-sm text-gray-600">Overall Completion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Employee Productivity */}
      {reportType === 'employee-productivity' && data.employees && (
        <Card>
          <CardHeader>
            <CardTitle>Employee Productivity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Employee</th>
                    <th className="text-left p-4">Department</th>
                    <th className="text-left p-4">Completed</th>
                    <th className="text-left p-4">In Progress</th>
                    <th className="text-left p-4">Pending</th>
                    <th className="text-left p-4">Productivity</th>
                  </tr>
                </thead>
                <tbody>
                  {data.employees.map((employee: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{employee.name}</td>
                      <td className="p-4">{employee.department}</td>
                      <td className="p-4">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {employee.completed}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {employee.inProgress}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="bg-orange-50 text-orange-700">
                          {employee.pending}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-green-500 rounded-full"
                              style={{ width: `${employee.productivity}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{employee.productivity}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {data.averageProductivity && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{data.averageProductivity}%</p>
                  <p className="text-sm text-gray-600">Average Team Productivity</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Department Overview */}
      {reportType === 'department-overview' && data.departments && (
        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.departments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalTasks" fill="#8884d8" name="Total Tasks" />
                  <Bar dataKey="completedTasks" fill="#82ca9d" name="Completed Tasks" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Overview Charts */}
      {reportType === 'dashboard' && data.charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.charts.sprintVelocity && (
            <Card>
              <CardHeader>
                <CardTitle>Sprint Velocity Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.charts.sprintVelocity.velocityTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="sprintName" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="velocity" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {data.charts.taskCompletion && (
            <Card>
              <CardHeader>
                <CardTitle>Task Completion Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.charts.taskCompletion.tasksOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="completed" stroke="#82ca9d" fill="#82ca9d" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
