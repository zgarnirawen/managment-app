'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { 
  DollarSign, 
  Calendar, 
  Users, 
  Calculator,
  FileText,
  Download,
  Upload,
  TrendingUp,
  PieChart,
  BarChart3,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

// Mock payroll data
const mockPayrollData = {
  currentPeriod: {
    startDate: '2024-12-01',
    endDate: '2024-12-15',
    status: 'processing',
    totalEmployees: 156,
    totalGrossPay: 245680.50,
    totalDeductions: 68950.25,
    totalNetPay: 176730.25,
    totalTaxes: 52840.15
  },
  recentPayrolls: [
    {
      id: 1,
      period: 'Nov 16 - Nov 30, 2024',
      processedDate: '2024-11-30',
      employees: 152,
      grossPay: 238420.75,
      netPay: 172150.30,
      status: 'completed'
    },
    {
      id: 2,
      period: 'Nov 1 - Nov 15, 2024',
      processedDate: '2024-11-15',
      employees: 150,
      grossPay: 235890.25,
      netPay: 170245.80,
      status: 'completed'
    },
    {
      id: 3,
      period: 'Oct 16 - Oct 31, 2024',
      processedDate: '2024-10-31',
      employees: 148,
      grossPay: 232760.50,
      netPay: 168920.40,
      status: 'completed'
    }
  ],
  employeePayroll: [
    {
      id: 1,
      employeeName: 'John Smith',
      employeeId: 'EMP001',
      department: 'Engineering',
      grossPay: 6500.00,
      regularHours: 80,
      overtimeHours: 8,
      deductions: 1820.00,
      taxes: 1450.00,
      netPay: 3230.00,
      status: 'pending'
    },
    {
      id: 2,
      employeeName: 'Sarah Johnson',
      employeeId: 'EMP002',
      department: 'Marketing',
      grossPay: 5200.00,
      regularHours: 80,
      overtimeHours: 0,
      deductions: 1456.00,
      taxes: 1160.00,
      netPay: 2584.00,
      status: 'approved'
    },
    {
      id: 3,
      employeeName: 'Mike Davis',
      employeeId: 'EMP003',
      department: 'Sales',
      grossPay: 4800.00,
      regularHours: 80,
      overtimeHours: 4,
      deductions: 1344.00,
      taxes: 1072.00,
      netPay: 2384.00,
      status: 'processing'
    }
  ],
  taxSummary: {
    federalTax: 32450.75,
    stateTax: 12680.25,
    socialSecurity: 15240.80,
    medicare: 3568.90,
    unemployment: 1840.25
  },
  deductionSummary: {
    healthInsurance: 28650.00,
    dentalInsurance: 4580.50,
    visionInsurance: 1240.75,
    retirement401k: 24680.00,
    lifeInsurance: 890.25,
    other: 8908.75
  }
}

export default function PayrollPage() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('overview')
  const [payrollData] = useState(mockPayrollData)
  const [selectedPeriod, setSelectedPeriod] = useState('current')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleProcessPayroll = async () => {
    setLoading(true)
    // Simulate payroll processing
    await new Promise(resolve => setTimeout(resolve, 3000))
    setLoading(false)
    alert('Payroll processed successfully!')
  }

  const handleExportPayroll = (format: 'excel' | 'pdf') => {
    // Simulate export functionality
    alert(`Exporting payroll data as ${format.toUpperCase()}...`)
  }

  const filteredEmployees = payrollData.employeePayroll.filter(emp => 
    emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
            <p className="text-gray-600 mt-1">Process payroll, manage deductions, and generate reports</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              <Calendar className="h-4 w-4 mr-1" />
              {payrollData.currentPeriod.startDate} - {payrollData.currentPeriod.endDate}
            </Badge>
            <Button onClick={() => handleProcessPayroll()} disabled={loading}>
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Calculator className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Processing...' : 'Process Payroll'}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="deductions">Deductions</TabsTrigger>
            <TabsTrigger value="taxes">Taxes</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Current Period Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Current Payroll Period</CardTitle>
                <CardDescription>
                  {payrollData.currentPeriod.startDate} - {payrollData.currentPeriod.endDate}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {payrollData.currentPeriod.totalEmployees}
                    </div>
                    <div className="text-sm text-gray-600">Total Employees</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {formatCurrency(payrollData.currentPeriod.totalGrossPay)}
                    </div>
                    <div className="text-sm text-gray-600">Gross Pay</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {formatCurrency(payrollData.currentPeriod.totalDeductions)}
                    </div>
                    <div className="text-sm text-gray-600">Total Deductions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {formatCurrency(payrollData.currentPeriod.totalNetPay)}
                    </div>
                    <div className="text-sm text-gray-600">Net Pay</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button className="h-20 flex-col">
                    <Plus className="h-6 w-6 mb-2" />
                    Add Bonus
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Edit className="h-6 w-6 mb-2" />
                    Edit Deductions
                  </Button>
                  <Button variant="outline" className="h-20 flex-col" onClick={() => handleExportPayroll('excel')}>
                    <Download className="h-6 w-6 mb-2" />
                    Export Excel
                  </Button>
                  <Button variant="outline" className="h-20 flex-col" onClick={() => handleExportPayroll('pdf')}>
                    <FileText className="h-6 w-6 mb-2" />
                    Export PDF
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Payrolls */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Payroll Periods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payrollData.recentPayrolls.map((payroll) => (
                    <div key={payroll.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="font-medium">{payroll.period}</div>
                          <div className="text-sm text-gray-600">{payroll.employees} employees</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(payroll.grossPay)}</div>
                          <div className="text-sm text-gray-600">Gross Pay</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(payroll.netPay)}</div>
                          <div className="text-sm text-gray-600">Net Pay</div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          {payroll.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Employee Payroll Details</CardTitle>
                    <CardDescription>Current payroll period employee breakdown</CardDescription>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Employee</th>
                        <th className="text-left p-4">Department</th>
                        <th className="text-left p-4">Hours</th>
                        <th className="text-left p-4">Gross Pay</th>
                        <th className="text-left p-4">Deductions</th>
                        <th className="text-left p-4">Net Pay</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map((employee) => (
                        <tr key={employee.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{employee.employeeName}</div>
                              <div className="text-sm text-gray-600">{employee.employeeId}</div>
                            </div>
                          </td>
                          <td className="p-4">{employee.department}</td>
                          <td className="p-4">
                            <div>
                              <div>{employee.regularHours}h regular</div>
                              {employee.overtimeHours > 0 && (
                                <div className="text-sm text-orange-600">{employee.overtimeHours}h overtime</div>
                              )}
                            </div>
                          </td>
                          <td className="p-4 font-medium">{formatCurrency(employee.grossPay)}</td>
                          <td className="p-4 text-red-600">{formatCurrency(employee.deductions)}</td>
                          <td className="p-4 font-bold text-green-600">{formatCurrency(employee.netPay)}</td>
                          <td className="p-4">
                            <Badge 
                              variant={
                                employee.status === 'approved' ? 'default' :
                                employee.status === 'pending' ? 'secondary' : 'outline'
                              }
                              className={
                                employee.status === 'approved' ? 'bg-green-100 text-green-800' :
                                employee.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }
                            >
                              {employee.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deductions Tab */}
          <TabsContent value="deductions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Deduction Summary</CardTitle>
                  <CardDescription>Current period deduction breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(payrollData.deductionSummary).map(([type, amount]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="capitalize text-sm">{type.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="font-medium">{formatCurrency(amount)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center font-bold">
                        <span>Total Deductions</span>
                        <span>{formatCurrency(Object.values(payrollData.deductionSummary).reduce((a, b) => a + b, 0))}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Deduction Management</CardTitle>
                  <CardDescription>Add or modify employee deductions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Deduction Type</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select deduction type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="health">Health Insurance</SelectItem>
                        <SelectItem value="dental">Dental Insurance</SelectItem>
                        <SelectItem value="vision">Vision Insurance</SelectItem>
                        <SelectItem value="401k">401(k) Contribution</SelectItem>
                        <SelectItem value="life">Life Insurance</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount</label>
                    <Input type="number" placeholder="0.00" step="0.01" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Employee</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {payrollData.employeePayroll.map((emp) => (
                          <SelectItem key={emp.id} value={emp.employeeId}>
                            {emp.employeeName} ({emp.employeeId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Deduction
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Taxes Tab */}
          <TabsContent value="taxes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tax Summary</CardTitle>
                <CardDescription>Current period tax breakdown and calculations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Tax Breakdown</h3>
                    {Object.entries(payrollData.taxSummary).map(([type, amount]) => (
                      <div key={type} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="capitalize text-sm">{type.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="font-medium">{formatCurrency(amount)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center font-bold">
                        <span>Total Taxes</span>
                        <span className="text-lg">{formatCurrency(Object.values(payrollData.taxSummary).reduce((a, b) => a + b, 0))}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Tax Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Federal Tax Rate (%)</label>
                        <Input type="number" placeholder="22.0" step="0.1" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">State Tax Rate (%)</label>
                        <Input type="number" placeholder="8.5" step="0.1" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Social Security Rate (%)</label>
                        <Input type="number" placeholder="6.2" step="0.1" disabled />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Medicare Rate (%)</label>
                        <Input type="number" placeholder="1.45" step="0.01" disabled />
                      </div>
                      <Button variant="outline" className="w-full">
                        Update Tax Settings
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Reports</CardTitle>
                  <CardDescription>Create and download payroll reports</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Report Type</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="payroll-summary">Payroll Summary</SelectItem>
                        <SelectItem value="tax-report">Tax Report</SelectItem>
                        <SelectItem value="deduction-report">Deduction Report</SelectItem>
                        <SelectItem value="employee-detail">Employee Detail</SelectItem>
                        <SelectItem value="year-end">Year-End Summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Period</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">Current Period</SelectItem>
                        <SelectItem value="last-month">Last Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={() => handleExportPayroll('excel')} className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                    <Button onClick={() => handleExportPayroll('pdf')} variant="outline" className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Report History</CardTitle>
                  <CardDescription>Previously generated reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Payroll Summary - November 2024</div>
                        <div className="text-sm text-gray-600">Generated on Dec 1, 2024</div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Tax Report - Q3 2024</div>
                        <div className="text-sm text-gray-600">Generated on Oct 1, 2024</div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Employee Detail - October 2024</div>
                        <div className="text-sm text-gray-600">Generated on Nov 1, 2024</div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
