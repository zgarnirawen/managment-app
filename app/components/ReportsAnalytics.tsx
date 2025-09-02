'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Input } from './ui/input'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Target,
  Clock,
  Users,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'

// Mock data for sprint velocity and analytics
const sprintVelocityData = [
  { sprint: 'Sprint 1', planned: 25, completed: 23, velocity: 92 },
  { sprint: 'Sprint 2', planned: 30, completed: 28, velocity: 93 },
  { sprint: 'Sprint 3', planned: 28, completed: 25, velocity: 89 },
  { sprint: 'Sprint 4', planned: 32, completed: 30, velocity: 94 },
  { sprint: 'Sprint 5', planned: 35, completed: 33, velocity: 94 },
  { sprint: 'Sprint 6', planned: 30, completed: 28, velocity: 93 }
]

const taskCompletionData = [
  { date: '2024-12-01', completed: 8, pending: 12, blocked: 2 },
  { date: '2024-12-02', completed: 12, pending: 8, blocked: 1 },
  { date: '2024-12-03', completed: 15, pending: 5, blocked: 3 },
  { date: '2024-12-04', completed: 18, pending: 7, blocked: 1 },
  { date: '2024-12-05', completed: 22, pending: 4, blocked: 2 },
  { date: '2024-12-06', completed: 25, pending: 6, blocked: 1 },
  { date: '2024-12-07', completed: 28, pending: 3, blocked: 2 }
]

const priorityDistribution = [
  { name: 'High', value: 35, color: '#ef4444' },
  { name: 'Medium', value: 45, color: '#f59e0b' },
  { name: 'Low', value: 20, color: '#10b981' }
]

const employeePerformance = [
  { name: 'John Smith', tasksCompleted: 45, velocity: 95, efficiency: 92 },
  { name: 'Sarah Johnson', tasksCompleted: 52, velocity: 98, efficiency: 96 },
  { name: 'Mike Davis', tasksCompleted: 38, velocity: 88, efficiency: 85 },
  { name: 'Emily Wilson', tasksCompleted: 41, velocity: 91, efficiency: 89 },
  { name: 'Alex Brown', tasksCompleted: 47, velocity: 94, efficiency: 93 }
]

const burndownData = [
  { day: 'Day 1', remaining: 100, ideal: 100 },
  { day: 'Day 2', remaining: 95, ideal: 90 },
  { day: 'Day 3', remaining: 88, ideal: 80 },
  { day: 'Day 4', remaining: 82, ideal: 70 },
  { day: 'Day 5', remaining: 75, ideal: 60 },
  { day: 'Day 6', remaining: 65, ideal: 50 },
  { day: 'Day 7', remaining: 58, ideal: 40 },
  { day: 'Day 8', remaining: 45, ideal: 30 },
  { day: 'Day 9', remaining: 32, ideal: 20 },
  { day: 'Day 10', remaining: 15, ideal: 10 },
  { day: 'Day 11', remaining: 5, ideal: 0 }
]

interface ReportsAnalyticsProps {
  className?: string
}

export default function ReportsAnalytics({ className }: ReportsAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('last-30-days')
  const [selectedTeam, setSelectedTeam] = useState('all')
  const [activeTab, setActiveTab] = useState('velocity')

  // Calculate key metrics
  const currentSprint = sprintVelocityData[sprintVelocityData.length - 1]
  const avgVelocity = sprintVelocityData.reduce((sum, sprint) => sum + sprint.velocity, 0) / sprintVelocityData.length
  const totalCompleted = taskCompletionData.reduce((sum, day) => sum + day.completed, 0)
  const totalPending = taskCompletionData.reduce((sum, day) => sum + day.pending, 0)
  const completionRate = (totalCompleted / (totalCompleted + totalPending)) * 100

  const handleExportReport = (type: string) => {
    // Simulate report export
    alert(`Exporting ${type} report...`)
  }

  const handleRefreshData = () => {
    // Simulate data refresh
    alert('Refreshing analytics data...')
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-gray-600">Sprint velocity, task completion, and team performance insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-7-days">Last 7 Days</SelectItem>
              <SelectItem value="last-30-days">Last 30 Days</SelectItem>
              <SelectItem value="last-quarter">Last Quarter</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => handleExportReport('complete')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Sprint Velocity</p>
                <p className="text-3xl font-bold text-blue-600">{currentSprint.velocity}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2.1%
              </span>
              <span className="text-gray-600 ml-2">from last sprint</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Velocity</p>
                <p className="text-3xl font-bold text-green-600">{avgVelocity.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">Across {sprintVelocityData.length} sprints</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                <p className="text-3xl font-bold text-purple-600">{totalCompleted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">{totalPending} pending</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-3xl font-bold text-orange-600">{completionRate.toFixed(1)}%</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5.2%
              </span>
              <span className="text-gray-600 ml-2">this period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="velocity">Sprint Velocity</TabsTrigger>
          <TabsTrigger value="completion">Task Completion</TabsTrigger>
          <TabsTrigger value="burndown">Burndown Chart</TabsTrigger>
          <TabsTrigger value="performance">Team Performance</TabsTrigger>
          <TabsTrigger value="distribution">Priority Distribution</TabsTrigger>
        </TabsList>

        {/* Sprint Velocity Tab */}
        <TabsContent value="velocity">
          <Card>
            <CardHeader>
              <CardTitle>Sprint Velocity Trend</CardTitle>
              <CardDescription>
                Track velocity across sprints to identify patterns and improvements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sprintVelocityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sprint" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="planned" fill="#e5e7eb" name="Planned Story Points" />
                    <Bar dataKey="completed" fill="#3b82f6" name="Completed Story Points" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{currentSprint.completed}</p>
                  <p className="text-sm text-gray-600">Points Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600">{currentSprint.planned}</p>
                  <p className="text-sm text-gray-600">Points Planned</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{currentSprint.velocity}%</p>
                  <p className="text-sm text-gray-600">Velocity Achievement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Task Completion Tab */}
        <TabsContent value="completion">
          <Card>
            <CardHeader>
              <CardTitle>Task Completion Trends</CardTitle>
              <CardDescription>
                Daily breakdown of completed vs pending tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={taskCompletionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                    <Legend />
                    <Area type="monotone" dataKey="completed" stackId="1" stroke="#10b981" fill="#10b981" name="Completed" />
                    <Area type="monotone" dataKey="pending" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Pending" />
                    <Area type="monotone" dataKey="blocked" stackId="1" stroke="#ef4444" fill="#ef4444" name="Blocked" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Burndown Chart Tab */}
        <TabsContent value="burndown">
          <Card>
            <CardHeader>
              <CardTitle>Sprint Burndown Chart</CardTitle>
              <CardDescription>
                Track progress against ideal burndown for current sprint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={burndownData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="ideal" stroke="#e5e7eb" strokeDasharray="5 5" name="Ideal Burndown" />
                    <Line type="monotone" dataKey="remaining" stroke="#3b82f6" strokeWidth={3} name="Actual Progress" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-0.5 bg-blue-600"></div>
                  <span className="text-sm text-gray-600">Actual Progress</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-0.5 bg-gray-400 border-dashed border-t"></div>
                  <span className="text-sm text-gray-600">Ideal Burndown</span>
                </div>
                <Badge className={burndownData[burndownData.length - 1].remaining <= 10 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {burndownData[burndownData.length - 1].remaining <= 10 ? 'On Track' : 'Behind Schedule'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Performance Tab */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance Analysis</CardTitle>
              <CardDescription>
                Individual and team productivity metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={employeePerformance} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="tasksCompleted" fill="#3b82f6" name="Tasks Completed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Employee</th>
                        <th className="text-left p-4">Tasks Completed</th>
                        <th className="text-left p-4">Velocity</th>
                        <th className="text-left p-4">Efficiency</th>
                        <th className="text-left p-4">Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeePerformance.map((employee, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-medium">{employee.name}</td>
                          <td className="p-4">{employee.tasksCompleted}</td>
                          <td className="p-4">{employee.velocity}%</td>
                          <td className="p-4">{employee.efficiency}%</td>
                          <td className="p-4">
                            <Badge className={
                              employee.efficiency >= 95 ? 'bg-green-100 text-green-800' :
                              employee.efficiency >= 90 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }>
                              {employee.efficiency >= 95 ? 'Excellent' : 
                               employee.efficiency >= 90 ? 'Good' : 'Needs Improvement'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Priority Distribution Tab */}
        <TabsContent value="distribution">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Priority Distribution</CardTitle>
                <CardDescription>
                  Breakdown of tasks by priority level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {priorityDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
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
                <CardTitle>Priority Metrics</CardTitle>
                <CardDescription>
                  Detailed breakdown and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {priorityDistribution.map((priority, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: priority.color }}
                        />
                        <span className="font-medium">{priority.name} Priority</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{priority.value}%</div>
                        <div className="text-sm text-gray-600">
                          {Math.round((priority.value / 100) * totalCompleted)} tasks
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Focus on reducing high priority backlog</li>
                    <li>• Maintain balanced priority distribution</li>
                    <li>• Consider sprint capacity for high priority items</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
