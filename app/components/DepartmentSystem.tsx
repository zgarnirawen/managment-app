'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Input } from '@/app/components/ui/input'
import { Textarea } from '@/app/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog'
import { 
  Building2, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  UserPlus, 
  UserMinus, 
  BarChart3,
  TrendingUp,
  Target,
  Calendar,
  DollarSign,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  Mail,
  Phone
} from 'lucide-react'

// Mock data for departments
const mockDepartments = [
  {
    id: 1,
    name: 'Engineering',
    description: 'Software development and technical operations',
    head: 'John Smith',
    headId: 'user_1',
    employees: 25,
    budget: 750000,
    location: 'Building A, Floor 3',
    established: '2020-01-15',
    status: 'active',
    email: 'engineering@company.com',
    phone: '+1-555-0101',
    projects: 8,
    avgSalary: 85000,
    performance: 92
  },
  {
    id: 2,
    name: 'Marketing',
    description: 'Brand management and customer acquisition',
    head: 'Sarah Johnson',
    headId: 'user_2',
    employees: 12,
    budget: 350000,
    location: 'Building B, Floor 2',
    established: '2020-03-20',
    status: 'active',
    email: 'marketing@company.com',
    phone: '+1-555-0102',
    projects: 5,
    avgSalary: 65000,
    performance: 88
  },
  {
    id: 3,
    name: 'Sales',
    description: 'Revenue generation and client relationships',
    head: 'Mike Chen',
    headId: 'user_3',
    employees: 18,
    budget: 420000,
    location: 'Building A, Floor 1',
    established: '2019-11-10',
    status: 'active',
    email: 'sales@company.com',
    phone: '+1-555-0103',
    projects: 12,
    avgSalary: 72000,
    performance: 95
  },
  {
    id: 4,
    name: 'Human Resources',
    description: 'Employee relations and organizational development',
    head: 'Emily Davis',
    headId: 'user_4',
    employees: 8,
    budget: 180000,
    location: 'Building B, Floor 1',
    established: '2020-02-05',
    status: 'active',
    email: 'hr@company.com',
    phone: '+1-555-0104',
    projects: 3,
    avgSalary: 58000,
    performance: 90
  },
  {
    id: 5,
    name: 'Operations',
    description: 'Business operations and process optimization',
    head: 'David Wilson',
    headId: 'user_5',
    employees: 15,
    budget: 300000,
    location: 'Building A, Floor 2',
    established: '2020-05-12',
    status: 'active',
    email: 'operations@company.com',
    phone: '+1-555-0105',
    projects: 6,
    avgSalary: 62000,
    performance: 87
  },
  {
    id: 6,
    name: 'Finance',
    description: 'Financial planning and analysis',
    head: 'Lisa Anderson',
    headId: 'user_6',
    employees: 10,
    budget: 250000,
    location: 'Building B, Floor 3',
    established: '2019-12-01',
    status: 'active',
    email: 'finance@company.com',
    phone: '+1-555-0106',
    projects: 4,
    avgSalary: 75000,
    performance: 93
  }
]

const mockEmployees = [
  { id: 'emp_1', name: 'Alice Cooper', role: 'Senior Developer', departmentId: 1, email: 'alice@company.com', joinDate: '2021-03-15', salary: 95000, performance: 94 },
  { id: 'emp_2', name: 'Bob Johnson', role: 'Marketing Specialist', departmentId: 2, email: 'bob@company.com', joinDate: '2022-01-10', salary: 55000, performance: 87 },
  { id: 'emp_3', name: 'Carol Smith', role: 'Sales Manager', departmentId: 3, email: 'carol@company.com', joinDate: '2020-11-20', salary: 78000, performance: 96 },
  { id: 'emp_4', name: 'Daniel Brown', role: 'HR Coordinator', departmentId: 4, email: 'daniel@company.com', joinDate: '2021-08-05', salary: 52000, performance: 91 },
  { id: 'emp_5', name: 'Eva Martinez', role: 'Operations Analyst', departmentId: 5, email: 'eva@company.com', joinDate: '2022-03-12', salary: 58000, performance: 89 },
  { id: 'emp_6', name: 'Frank Wilson', role: 'Financial Analyst', departmentId: 6, email: 'frank@company.com', joinDate: '2021-06-08', salary: 68000, performance: 92 }
]

const mockUnassignedEmployees = [
  { id: 'emp_7', name: 'Grace Lee', role: 'Junior Developer', email: 'grace@company.com', joinDate: '2023-09-15', salary: 65000 },
  { id: 'emp_8', name: 'Henry Kim', role: 'Content Writer', email: 'henry@company.com', joinDate: '2023-10-01', salary: 48000 },
  { id: 'emp_9', name: 'Iris Chen', role: 'Data Analyst', email: 'iris@company.com', joinDate: '2023-11-12', salary: 62000 }
]

interface DepartmentFormData {
  name: string
  description: string
  budget: string
  location: string
  email: string
  phone: string
}

interface DepartmentSystemProps {
  userRole: string
}

export default function DepartmentSystem({ userRole }: DepartmentSystemProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [departments, setDepartments] = useState(mockDepartments)
  const [employees, setEmployees] = useState(mockEmployees)
  const [unassignedEmployees, setUnassignedEmployees] = useState(mockUnassignedEmployees)
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [departmentForm, setDepartmentForm] = useState<DepartmentFormData>({
    name: '',
    description: '',
    budget: '',
    location: '',
    email: '',
    phone: ''
  })

  // Permissions based on role
  const canManageDepartments = ['admin', 'super_admin'].includes(userRole.toLowerCase())
  const canViewFinancials = ['admin', 'super_admin'].includes(userRole.toLowerCase())
  const canAssignEmployees = ['admin', 'super_admin', 'manager'].includes(userRole.toLowerCase())

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || dept.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const totalEmployees = departments.reduce((sum, dept) => sum + dept.employees, 0)
  const totalBudget = departments.reduce((sum, dept) => sum + dept.budget, 0)
  const avgPerformance = departments.reduce((sum, dept) => sum + dept.performance, 0) / departments.length

  const handleCreateDepartment = () => {
    const newDepartment = {
      id: departments.length + 1,
      ...departmentForm,
      budget: parseInt(departmentForm.budget),
      head: 'Unassigned',
      headId: '',
      employees: 0,
      established: new Date().toISOString().split('T')[0],
      status: 'active' as const,
      projects: 0,
      avgSalary: 0,
      performance: 0
    }
    setDepartments([...departments, newDepartment])
    setDepartmentForm({
      name: '',
      description: '',
      budget: '',
      location: '',
      email: '',
      phone: ''
    })
    setShowCreateForm(false)
  }

  const handleEditDepartment = () => {
    if (editingDepartment) {
      setDepartments(departments.map(dept => 
        dept.id === editingDepartment.id 
          ? { ...dept, ...departmentForm, budget: parseInt(departmentForm.budget) }
          : dept
      ))
      setShowEditForm(false)
      setEditingDepartment(null)
      setDepartmentForm({
        name: '',
        description: '',
        budget: '',
        location: '',
        email: '',
        phone: ''
      })
    }
  }

  const handleDeleteDepartment = (id: number) => {
    if (confirm('Are you sure you want to delete this department? All employees will be unassigned.')) {
      // Move employees to unassigned
      const deptEmployees = employees.filter(emp => emp.departmentId === id)
      setUnassignedEmployees([...unassignedEmployees, ...deptEmployees.map(emp => ({
        id: emp.id,
        name: emp.name,
        role: emp.role,
        email: emp.email,
        joinDate: emp.joinDate,
        salary: emp.salary
      }))])
      
      // Remove department and its employees
      setDepartments(departments.filter(dept => dept.id !== id))
      setEmployees(employees.filter(emp => emp.departmentId !== id))
    }
  }

  const startEdit = (department: any) => {
    setEditingDepartment(department)
    setDepartmentForm({
      name: department.name,
      description: department.description,
      budget: department.budget.toString(),
      location: department.location,
      email: department.email,
      phone: department.phone
    })
    setShowEditForm(true)
  }

  const assignEmployee = (employeeId: string, departmentId: number) => {
    const employee = unassignedEmployees.find(emp => emp.id === employeeId)
    if (employee) {
      setEmployees([...employees, { ...employee, departmentId, performance: 85 }])
      setUnassignedEmployees(unassignedEmployees.filter(emp => emp.id !== employeeId))
      
      // Update department employee count
      setDepartments(departments.map(dept => 
        dept.id === departmentId 
          ? { ...dept, employees: dept.employees + 1 }
          : dept
      ))
    }
  }

  const unassignEmployee = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId)
    if (employee) {
      setUnassignedEmployees([...unassignedEmployees, {
        id: employee.id,
        name: employee.name,
        role: employee.role,
        email: employee.email,
        joinDate: employee.joinDate,
        salary: employee.salary
      }])
      
      // Update department employee count
      setDepartments(departments.map(dept => 
        dept.id === employee.departmentId 
          ? { ...dept, employees: dept.employees - 1 }
          : dept
      ))
      
      setEmployees(employees.filter(emp => emp.id !== employeeId))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Department Management</h2>
          <p className="text-gray-600 mt-1">Organize and manage company departments</p>
        </div>
        {canManageDepartments && (
          <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Department
          </Button>
        )}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Departments</p>
                <p className="text-2xl font-bold">{departments.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold">{totalEmployees}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold">${(totalBudget / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Performance</p>
                <p className="text-2xl font-bold">{avgPerformance.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="employees">Employee Assignment</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Department Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departments.slice(0, 5).map((dept) => (
                    <div key={dept.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{dept.name}</p>
                        <p className="text-sm text-gray-600">{dept.employees} employees</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={dept.performance >= 90 ? 'default' : 
                                  dept.performance >= 80 ? 'secondary' : 'destructive'}
                        >
                          {dept.performance}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Budget Allocation */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departments.map((dept) => (
                    <div key={dept.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{dept.name}</span>
                        <span>${(dept.budget / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(dept.budget / totalBudget) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepartments.map((department) => (
              <Card key={department.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{department.name}</CardTitle>
                    {canManageDepartments && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(department)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteDepartment(department.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <CardDescription>{department.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Department Head</p>
                        <p className="font-medium">{department.head}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Employees</p>
                        <p className="font-medium">{department.employees}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Location</p>
                        <p className="font-medium">{department.location}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Performance</p>
                        <Badge
                          variant={department.performance >= 90 ? 'default' : 
                                  department.performance >= 80 ? 'secondary' : 'destructive'}
                        >
                          {department.performance}%
                        </Badge>
                      </div>
                    </div>
                    
                    {canViewFinancials && (
                      <div className="border-t pt-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Budget</p>
                            <p className="font-medium">${(department.budget / 1000).toFixed(0)}K</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Avg Salary</p>
                            <p className="font-medium">${(department.avgSalary / 1000).toFixed(0)}K</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Projects: {department.projects}</span>
                      <span>Est. {department.established}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {department.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {department.phone}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Employee Assignment Tab */}
        <TabsContent value="employees" className="space-y-6">
          {canAssignEmployees ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Assigned Employees */}
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Employees</CardTitle>
                  <CardDescription>Employees currently assigned to departments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {employees.map((employee) => {
                      const department = departments.find(d => d.id === employee.departmentId)
                      return (
                        <div key={employee.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{employee.name}</p>
                            <p className="text-sm text-gray-600">{employee.role}</p>
                            <p className="text-sm text-blue-600">{department?.name}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => unassignEmployee(employee.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Unassigned Employees */}
              <Card>
                <CardHeader>
                  <CardTitle>Unassigned Employees</CardTitle>
                  <CardDescription>Employees waiting for department assignment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {unassignedEmployees.map((employee) => (
                      <div key={employee.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">{employee.name}</p>
                            <p className="text-sm text-gray-600">{employee.role}</p>
                          </div>
                        </div>
                        <Select onValueChange={(value) => assignEmployee(employee.id, parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Assign to department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id.toString()}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                    {unassignedEmployees.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>All employees are assigned to departments</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
                <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
                <p className="text-gray-600">You don't have permission to manage employee assignments.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance by Department */}
            <Card>
              <CardHeader>
                <CardTitle>Performance by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departments.map((dept) => (
                    <div key={dept.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{dept.name}</span>
                        <span>{dept.performance}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            dept.performance >= 90 ? 'bg-green-600' :
                            dept.performance >= 80 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${dept.performance}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Employee Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Employee Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departments.map((dept) => (
                    <div key={dept.id} className="flex items-center justify-between">
                      <span className="text-sm">{dept.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(dept.employees / totalEmployees) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{dept.employees}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Department Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Department</DialogTitle>
            <DialogDescription>
              Add a new department to your organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Department Name</label>
                <Input
                  value={departmentForm.name}
                  onChange={(e) => setDepartmentForm({...departmentForm, name: e.target.value})}
                  placeholder="e.g., Engineering"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Budget</label>
                <Input
                  type="number"
                  value={departmentForm.budget}
                  onChange={(e) => setDepartmentForm({...departmentForm, budget: e.target.value})}
                  placeholder="e.g., 500000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={departmentForm.description}
                onChange={(e) => setDepartmentForm({...departmentForm, description: e.target.value})}
                placeholder="Brief description of the department's role..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <Input
                  value={departmentForm.location}
                  onChange={(e) => setDepartmentForm({...departmentForm, location: e.target.value})}
                  placeholder="e.g., Building A, Floor 2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={departmentForm.email}
                  onChange={(e) => setDepartmentForm({...departmentForm, email: e.target.value})}
                  placeholder="e.g., dept@company.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <Input
                value={departmentForm.phone}
                onChange={(e) => setDepartmentForm({...departmentForm, phone: e.target.value})}
                placeholder="e.g., +1-555-0100"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateDepartment} className="bg-blue-600 hover:bg-blue-700">
                Create Department
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>
              Update department information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Department Name</label>
                <Input
                  value={departmentForm.name}
                  onChange={(e) => setDepartmentForm({...departmentForm, name: e.target.value})}
                  placeholder="e.g., Engineering"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Budget</label>
                <Input
                  type="number"
                  value={departmentForm.budget}
                  onChange={(e) => setDepartmentForm({...departmentForm, budget: e.target.value})}
                  placeholder="e.g., 500000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={departmentForm.description}
                onChange={(e) => setDepartmentForm({...departmentForm, description: e.target.value})}
                placeholder="Brief description of the department's role..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <Input
                  value={departmentForm.location}
                  onChange={(e) => setDepartmentForm({...departmentForm, location: e.target.value})}
                  placeholder="e.g., Building A, Floor 2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={departmentForm.email}
                  onChange={(e) => setDepartmentForm({...departmentForm, email: e.target.value})}
                  placeholder="e.g., dept@company.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <Input
                value={departmentForm.phone}
                onChange={(e) => setDepartmentForm({...departmentForm, phone: e.target.value})}
                placeholder="e.g., +1-555-0100"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowEditForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditDepartment} className="bg-blue-600 hover:bg-blue-700">
                Update Department
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
