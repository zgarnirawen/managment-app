'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { useToast } from '@/app/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import { 
  DollarSign, 
  Download, 
  FileText, 
  Calculator,
  CreditCard,
  Users,
  Calendar,
  TrendingUp,
  Settings,
  Building,
  Receipt,
  AlertCircle
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  baseSalary: number;
  hourlyRate?: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  netPay: number;
  bankAccount: string;
  paymentStatus: 'pending' | 'processed' | 'failed';
  lastPaid: string;
}

interface PayrollSummary {
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  employeeCount: number;
  avgSalary: number;
  pendingPayments: number;
}

interface PaySlip {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  baseSalary: number;
  overtime: number;
  bonuses: number;
  grossPay: number;
  taxDeductions: number;
  otherDeductions: number;
  netPay: number;
  generatedAt: string;
  status: 'draft' | 'finalized' | 'sent';
}

export default function PayrollPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollSummary, setPayrollSummary] = useState<PayrollSummary | null>(null);
  const [paySlips, setPaySlips] = useState<PaySlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('2025-08');
  const [processingPayroll, setProcessingPayroll] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPayrollData();
  }, [selectedPeriod]);

  const loadPayrollData = async () => {
    setLoading(true);
    try {
      // Mock data - in real implementation, fetch from API
      const mockEmployees: Employee[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@company.com',
          department: 'Engineering',
          position: 'Senior Developer',
          baseSalary: 85000,
          overtime: 1200,
          bonuses: 500,
          deductions: 1850,
          netPay: 84850,
          bankAccount: '****1234',
          paymentStatus: 'processed',
          lastPaid: '2025-08-01',
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@company.com',
          department: 'Design',
          position: 'UX Designer',
          baseSalary: 75000,
          overtime: 800,
          bonuses: 300,
          deductions: 1625,
          netPay: 74475,
          bankAccount: '****5678',
          paymentStatus: 'pending',
          lastPaid: '2025-07-01',
        },
        {
          id: '3',
          name: 'Bob Johnson',
          email: 'bob@company.com',
          department: 'Marketing',
          position: 'Marketing Manager',
          baseSalary: 70000,
          overtime: 400,
          bonuses: 1000,
          deductions: 1540,
          netPay: 69860,
          bankAccount: '****9012',
          paymentStatus: 'processed',
          lastPaid: '2025-08-01',
        },
      ];

      const mockSummary: PayrollSummary = {
        totalGrossPay: 235200,
        totalDeductions: 5015,
        totalNetPay: 230185,
        employeeCount: 3,
        avgSalary: 76733,
        pendingPayments: 1,
      };

      const mockPaySlips: PaySlip[] = [
        {
          id: '1',
          employeeId: '1',
          employeeName: 'John Doe',
          period: '2025-08',
          baseSalary: 85000,
          overtime: 1200,
          bonuses: 500,
          grossPay: 86700,
          taxDeductions: 1500,
          otherDeductions: 350,
          netPay: 84850,
          generatedAt: '2025-08-29',
          status: 'finalized',
        },
      ];

      setEmployees(mockEmployees);
      setPayrollSummary(mockSummary);
      setPaySlips(mockPaySlips);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load payroll data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processPayroll = async () => {
    setProcessingPayroll(true);
    try {
      // Simulate payroll processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update employee payment statuses
      setEmployees(prev => prev.map(emp => ({
        ...emp,
        paymentStatus: 'processed' as const,
        lastPaid: new Date().toISOString().split('T')[0],
      })));

      toast({
        title: "Payroll Processed",
        description: "All payments have been successfully processed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payroll",
        variant: "destructive",
      });
    } finally {
      setProcessingPayroll(false);
    }
  };

  const generatePaySlip = async (employeeId: string) => {
    try {
      const employee = employees.find(emp => emp.id === employeeId);
      if (!employee) return;

      const newPaySlip: PaySlip = {
        id: Date.now().toString(),
        employeeId: employee.id,
        employeeName: employee.name,
        period: selectedPeriod,
        baseSalary: employee.baseSalary,
        overtime: employee.overtime,
        bonuses: employee.bonuses,
        grossPay: employee.baseSalary + employee.overtime + employee.bonuses,
        taxDeductions: Math.round(employee.deductions * 0.8),
        otherDeductions: Math.round(employee.deductions * 0.2),
        netPay: employee.netPay,
        generatedAt: new Date().toISOString().split('T')[0],
        status: 'draft',
      };

      setPaySlips(prev => [...prev, newPaySlip]);

      toast({
        title: "Pay Slip Generated",
        description: `Pay slip created for ${employee.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate pay slip",
        variant: "destructive",
      });
    }
  };

  const downloadPaySlip = (paySlip: PaySlip) => {
    // In a real implementation, this would generate and download a PDF
    const content = `
PAY SLIP - ${paySlip.period}
Employee: ${paySlip.employeeName}
Base Salary: $${paySlip.baseSalary.toLocaleString()}
Overtime: $${paySlip.overtime.toLocaleString()}
Bonuses: $${paySlip.bonuses.toLocaleString()}
Gross Pay: $${paySlip.grossPay.toLocaleString()}
Tax Deductions: $${paySlip.taxDeductions.toLocaleString()}
Other Deductions: $${paySlip.otherDeductions.toLocaleString()}
NET PAY: $${paySlip.netPay.toLocaleString()}
Generated: ${paySlip.generatedAt}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip_${paySlip.employeeName.replace(' ', '_')}_${paySlip.period}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Pay Slip Downloaded",
      description: `Pay slip for ${paySlip.employeeName} downloaded`,
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading payroll data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-green-600" />
            Payroll Management
          </h1>
          <p className="text-muted-foreground">Manage employee salaries, bonuses, and payments</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-08">August 2025</SelectItem>
              <SelectItem value="2025-07">July 2025</SelectItem>
              <SelectItem value="2025-06">June 2025</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={processPayroll} disabled={processingPayroll}>
            {processingPayroll ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Process Payroll
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {payrollSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gross Pay</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${payrollSummary.totalGrossPay.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Net Pay</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${payrollSummary.totalNetPay.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">After deductions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payrollSummary.employeeCount}</div>
              <p className="text-xs text-muted-foreground">Active employees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{payrollSummary.pendingPayments}</div>
              <p className="text-xs text-muted-foreground">Require processing</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="payslips">Pay Slips</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Payroll</CardTitle>
              <CardDescription>Manage individual employee payments and details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <h4 className="font-semibold">{employee.name}</h4>
                          <p className="text-sm text-muted-foreground">{employee.position} • {employee.department}</p>
                        </div>
                        <Badge 
                          variant={
                            employee.paymentStatus === 'processed' ? 'default' :
                            employee.paymentStatus === 'pending' ? 'secondary' : 'destructive'
                          }
                        >
                          {employee.paymentStatus}
                        </Badge>
                      </div>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Base: </span>
                          <span className="font-medium">${employee.baseSalary.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Overtime: </span>
                          <span className="font-medium">${employee.overtime.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Bonuses: </span>
                          <span className="font-medium">${employee.bonuses.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Net Pay: </span>
                          <span className="font-bold text-green-600">${employee.netPay.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => generatePaySlip(employee.id)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Pay Slip
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedEmployee(employee)}>
                            <Settings className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Employee Payroll</DialogTitle>
                            <DialogDescription>
                              Update payroll information for {selectedEmployee?.name}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedEmployee && (
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="baseSalary" className="text-right">
                                  Base Salary
                                </Label>
                                <Input
                                  id="baseSalary"
                                  type="number"
                                  defaultValue={selectedEmployee.baseSalary}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="overtime" className="text-right">
                                  Overtime
                                </Label>
                                <Input
                                  id="overtime"
                                  type="number"
                                  defaultValue={selectedEmployee.overtime}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="bonuses" className="text-right">
                                  Bonuses
                                </Label>
                                <Input
                                  id="bonuses"
                                  type="number"
                                  defaultValue={selectedEmployee.bonuses}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="deductions" className="text-right">
                                  Deductions
                                </Label>
                                <Input
                                  id="deductions"
                                  type="number"
                                  defaultValue={selectedEmployee.deductions}
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button onClick={() => toast({ title: "Updated", description: "Payroll information updated" })}>
                              Save Changes
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payslips" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pay Slips</CardTitle>
              <CardDescription>Generated pay slips for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paySlips.map((paySlip) => (
                  <div key={paySlip.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <h4 className="font-semibold">{paySlip.employeeName}</h4>
                          <p className="text-sm text-muted-foreground">Period: {paySlip.period}</p>
                        </div>
                        <Badge variant={paySlip.status === 'finalized' ? 'default' : 'secondary'}>
                          {paySlip.status}
                        </Badge>
                      </div>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Gross Pay: </span>
                          <span className="font-medium">${paySlip.grossPay.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Deductions: </span>
                          <span className="font-medium">${(paySlip.taxDeductions + paySlip.otherDeductions).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Net Pay: </span>
                          <span className="font-bold text-green-600">${paySlip.netPay.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadPaySlip(paySlip)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
                {paySlips.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No pay slips generated for this period
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Settings</CardTitle>
              <CardDescription>Configure payroll processing and bank integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="payPeriod">Pay Period</Label>
                  <Select defaultValue="monthly">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="bankIntegration">Bank Integration</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Building className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium">Local Bank Connection</p>
                      <p className="text-sm text-muted-foreground">Connected to Local Development Bank</p>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>

                <div>
                  <Label>Tax Configuration</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="federalTax" className="text-sm">Federal Tax Rate (%)</Label>
                      <Input id="federalTax" type="number" defaultValue="15" />
                    </div>
                    <div>
                      <Label htmlFor="stateTax" className="text-sm">State Tax Rate (%)</Label>
                      <Input id="stateTax" type="number" defaultValue="5" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button>Save Settings</Button>
                <Button variant="outline">Bank Connection</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
