'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Calendar, 
  Users, 
  FileText, 
  Download, 
  TrendingUp, 
  Calculator,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  Printer,
  Mail,
  Filter,
  Search
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
// import * as XLSX from 'xlsx';
// import jsPDF from 'jspdf';

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  employeeId: string;
  hireDate: string;
  salary: {
    baseSalary: number;
    hourlyRate?: number;
    salaryType: 'monthly' | 'hourly';
  };
  benefits: {
    healthInsurance: number;
    retirement401k: number;
    lifeInsurance: number;
    overtime: number;
  };
  deductions: {
    tax: number;
    socialSecurity: number;
    medicare: number;
    other: number;
  };
  bankDetails: {
    accountNumber: string;
    routingNumber: string;
    bankName: string;
  };
}

interface PayrollEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  payPeriod: {
    startDate: string;
    endDate: string;
  };
  hoursWorked: {
    regular: number;
    overtime: number;
    vacation: number;
    sick: number;
  };
  earnings: {
    basePay: number;
    overtimePay: number;
    bonuses: number;
    commissions: number;
    allowances: number;
    total: number;
  };
  deductions: {
    tax: number;
    socialSecurity: number;
    medicare: number;
    healthInsurance: number;
    retirement401k: number;
    other: number;
    total: number;
  };
  netPay: number;
  status: 'draft' | 'approved' | 'paid' | 'cancelled';
  processedBy: string;
  processedDate?: string;
  paymentMethod: 'direct_deposit' | 'check' | 'cash';
}

interface PayrollSystemProps {
  userRole: string;
  userId: string;
  userName: string;
}

const PayrollSystem: React.FC<PayrollSystemProps> = ({ userRole, userId, userName }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollEntry | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('current');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const mockEmployees: Employee[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@company.com',
      department: 'Engineering',
      position: 'Senior Developer',
      employeeId: 'EMP001',
      hireDate: '2023-01-15',
      salary: {
        baseSalary: 85000,
        salaryType: 'monthly'
      },
      benefits: {
        healthInsurance: 450,
        retirement401k: 850,
        lifeInsurance: 50,
        overtime: 0
      },
      deductions: {
        tax: 1530,
        socialSecurity: 527,
        medicare: 123,
        other: 100
      },
      bankDetails: {
        accountNumber: '****1234',
        routingNumber: '123456789',
        bankName: 'Chase Bank'
      }
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      department: 'Marketing',
      position: 'Marketing Manager',
      employeeId: 'EMP002',
      hireDate: '2022-06-01',
      salary: {
        baseSalary: 75000,
        salaryType: 'monthly'
      },
      benefits: {
        healthInsurance: 450,
        retirement401k: 750,
        lifeInsurance: 50,
        overtime: 0
      },
      deductions: {
        tax: 1350,
        socialSecurity: 465,
        medicare: 109,
        other: 75
      },
      bankDetails: {
        accountNumber: '****5678',
        routingNumber: '987654321',
        bankName: 'Bank of America'
      }
    }
  ];

  const mockPayrollEntries: PayrollEntry[] = [
    {
      id: '1',
      employeeId: '1',
      employeeName: 'John Doe',
      payPeriod: {
        startDate: '2024-12-01',
        endDate: '2024-12-15'
      },
      hoursWorked: {
        regular: 80,
        overtime: 5,
        vacation: 0,
        sick: 0
      },
      earnings: {
        basePay: 3541.67,
        overtimePay: 271.87,
        bonuses: 500,
        commissions: 0,
        allowances: 100,
        total: 4413.54
      },
      deductions: {
        tax: 1530,
        socialSecurity: 273.64,
        medicare: 64.00,
        healthInsurance: 225,
        retirement401k: 441.35,
        other: 50,
        total: 2583.99
      },
      netPay: 1829.55,
      status: 'paid',
      processedBy: 'HR Manager',
      processedDate: '2024-12-16',
      paymentMethod: 'direct_deposit'
    },
    {
      id: '2',
      employeeId: '2',
      employeeName: 'Jane Smith',
      payPeriod: {
        startDate: '2024-12-01',
        endDate: '2024-12-15'
      },
      hoursWorked: {
        regular: 80,
        overtime: 2,
        vacation: 0,
        sick: 8
      },
      earnings: {
        basePay: 3125.00,
        overtimePay: 117.19,
        bonuses: 0,
        commissions: 200,
        allowances: 75,
        total: 3517.19
      },
      deductions: {
        tax: 1350,
        socialSecurity: 218.07,
        medicare: 51.00,
        healthInsurance: 225,
        retirement401k: 351.72,
        other: 37.50,
        total: 2233.29
      },
      netPay: 1283.90,
      status: 'approved',
      processedBy: 'HR Manager',
      paymentMethod: 'direct_deposit'
    }
  ];

  useEffect(() => {
    setEmployees(mockEmployees);
    setPayrollEntries(mockPayrollEntries);
  }, []);

  const calculatePayrollStats = () => {
    const currentPeriodEntries = payrollEntries.filter(entry => 
      entry.payPeriod.endDate >= '2024-12-01' && entry.payPeriod.endDate <= '2024-12-31'
    );

    const totalGrossPay = currentPeriodEntries.reduce((sum, entry) => sum + entry.earnings.total, 0);
    const totalNetPay = currentPeriodEntries.reduce((sum, entry) => sum + entry.netPay, 0);
    const totalDeductions = currentPeriodEntries.reduce((sum, entry) => sum + entry.deductions.total, 0);
    const totalEmployees = currentPeriodEntries.length;

    return {
      totalGrossPay,
      totalNetPay,
      totalDeductions,
      totalEmployees,
      averageGrossPay: totalEmployees ? totalGrossPay / totalEmployees : 0,
      averageNetPay: totalEmployees ? totalNetPay / totalEmployees : 0
    };
  };

  const stats = calculatePayrollStats();

  const chartData = payrollEntries.map(entry => ({
    name: entry.employeeName,
    grossPay: entry.earnings.total,
    netPay: entry.netPay,
    deductions: entry.deductions.total
  }));

  const departmentData = employees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(departmentData).map(([dept, count], index) => ({
    name: dept,
    value: count,
    fill: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'][index % 5]
  }));

  const processPayroll = (employeeId: string, payrollData: Partial<PayrollEntry>) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    const newPayroll: PayrollEntry = {
      id: Date.now().toString(),
      employeeId: employee.id,
      employeeName: employee.name,
      payPeriod: payrollData.payPeriod || {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      hoursWorked: payrollData.hoursWorked || {
        regular: 80,
        overtime: 0,
        vacation: 0,
        sick: 0
      },
      earnings: payrollData.earnings || {
        basePay: 0,
        overtimePay: 0,
        bonuses: 0,
        commissions: 0,
        allowances: 0,
        total: 0
      },
      deductions: payrollData.deductions || {
        tax: 0,
        socialSecurity: 0,
        medicare: 0,
        healthInsurance: 0,
        retirement401k: 0,
        other: 0,
        total: 0
      },
      netPay: (payrollData.earnings?.total || 0) - (payrollData.deductions?.total || 0),
      status: 'draft',
      processedBy: userName,
      paymentMethod: 'direct_deposit'
    };

    setPayrollEntries([...payrollEntries, newPayroll]);
    setIsPayrollModalOpen(false);
  };

  const exportToExcel = () => {
    try {
      // Use real XLSX export
      import('xlsx').then((XLSX) => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(payrollEntries.map(entry => ({
          'Employee Name': entry.employeeName,
          'Employee ID': entry.employeeId,
          'Base Pay': entry.earnings.basePay,
          'Overtime Pay': entry.earnings.overtimePay,
          'Bonuses': entry.earnings.bonuses,
          'Total Earnings': entry.earnings.total,
          'Total Deductions': entry.deductions.total,
          'Net Pay': entry.netPay,
          'Pay Period Start': entry.payPeriod.startDate,
          'Pay Period End': entry.payPeriod.endDate,
          'Status': entry.status
        })));
        
        XLSX.utils.book_append_sheet(wb, ws, 'Payroll Report');
        XLSX.writeFile(wb, `payroll-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
  };

  const generatePayslip = (payrollEntry: PayrollEntry) => {
    try {
      // Use real jsPDF export
      import('jspdf').then(({ default: jsPDF }) => {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(18);
        doc.text('PAYSLIP', 20, 20);
        
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
        
        // Employee details
        doc.setFontSize(14);
        doc.text('Employee Information', 20, 55);
        doc.setFontSize(10);
        doc.text(`Name: ${payrollEntry.employeeName}`, 25, 70);
        doc.text(`Employee ID: ${payrollEntry.employeeId}`, 25, 80);
        doc.text(`Pay Period: ${payrollEntry.payPeriod.startDate} - ${payrollEntry.payPeriod.endDate}`, 25, 90);
        
        // Earnings breakdown
        doc.setFontSize(14);
        doc.text('Earnings Breakdown', 20, 110);
        doc.setFontSize(10);
        doc.text(`Base Pay: $${payrollEntry.earnings.basePay.toFixed(2)}`, 25, 125);
        doc.text(`Overtime Pay: $${payrollEntry.earnings.overtimePay.toFixed(2)}`, 25, 135);
        doc.text(`Bonuses: $${payrollEntry.earnings.bonuses.toFixed(2)}`, 25, 145);
        doc.text(`Total Earnings: $${payrollEntry.earnings.total.toFixed(2)}`, 25, 155);
        
        // Deductions breakdown
        doc.setFontSize(14);
        doc.text('Deductions', 20, 175);
        doc.setFontSize(10);
        doc.text(`Tax: $${payrollEntry.deductions.tax.toFixed(2)}`, 25, 190);
        doc.text(`Social Security: $${payrollEntry.deductions.socialSecurity.toFixed(2)}`, 25, 200);
        doc.text(`Medicare: $${payrollEntry.deductions.medicare.toFixed(2)}`, 25, 210);
        doc.text(`Health Insurance: $${payrollEntry.deductions.healthInsurance.toFixed(2)}`, 25, 220);
        doc.text(`Total Deductions: $${payrollEntry.deductions.total.toFixed(2)}`, 25, 230);
        
        doc.setFontSize(12);
        doc.text(`Net Pay: $${payrollEntry.netPay.toFixed(2)}`, 25, 250);
        
        doc.save(`payslip-${payrollEntry.employeeName.replace(' ', '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
      });
    } catch (error) {
      console.error('Error generating payslip:', error);
    }
  };

  const PayrollModal = ({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: any) => void }) => {
    const [formData, setFormData] = useState({
      employeeId: '',
      payPeriod: {
        startDate: '',
        endDate: ''
      },
      hoursWorked: {
        regular: 80,
        overtime: 0,
        vacation: 0,
        sick: 0
      },
      bonuses: 0,
      commissions: 0,
      allowances: 0
    });

    const selectedEmp = employees.find(emp => emp.id === formData.employeeId);

    const calculateEarnings = () => {
      if (!selectedEmp) return { basePay: 0, overtimePay: 0, total: 0 };

      const basePay = selectedEmp.salary.salaryType === 'monthly' 
        ? (selectedEmp.salary.baseSalary / 2) // Bi-weekly
        : (selectedEmp.salary.hourlyRate || 0) * formData.hoursWorked.regular;

      const overtimePay = selectedEmp.salary.salaryType === 'hourly'
        ? (selectedEmp.salary.hourlyRate || 0) * 1.5 * formData.hoursWorked.overtime
        : 0;

      const total = basePay + overtimePay + formData.bonuses + formData.commissions + formData.allowances;

      return { basePay, overtimePay, total };
    };

    const calculateDeductions = (grossPay: number) => {
      if (!selectedEmp) return { tax: 0, socialSecurity: 0, medicare: 0, total: 0 };

      const tax = grossPay * 0.22; // Simplified tax calculation
      const socialSecurity = grossPay * 0.062;
      const medicare = grossPay * 0.0145;
      const healthInsurance = selectedEmp.benefits.healthInsurance / 2; // Bi-weekly
      const retirement401k = grossPay * 0.1; // 10% contribution
      const other = 50; // Other deductions

      const total = tax + socialSecurity + medicare + healthInsurance + retirement401k + other;

      return { tax, socialSecurity, medicare, healthInsurance, retirement401k, other, total };
    };

    const earnings = calculateEarnings();
    const deductions = calculateDeductions(earnings.total);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit({
        employeeId: formData.employeeId,
        payPeriod: formData.payPeriod,
        hoursWorked: formData.hoursWorked,
        earnings: {
          ...earnings,
          bonuses: formData.bonuses,
          commissions: formData.commissions,
          allowances: formData.allowances
        },
        deductions
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Process Payroll</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <select
                value={formData.employeeId}
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} - {emp.employeeId}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pay Period Start</label>
                <input
                  type="date"
                  value={formData.payPeriod.startDate}
                  onChange={(e) => setFormData({
                    ...formData,
                    payPeriod: {...formData.payPeriod, startDate: e.target.value}
                  })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pay Period End</label>
                <input
                  type="date"
                  value={formData.payPeriod.endDate}
                  onChange={(e) => setFormData({
                    ...formData,
                    payPeriod: {...formData.payPeriod, endDate: e.target.value}
                  })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Hours Worked</h4>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Regular</label>
                  <input
                    type="number"
                    value={formData.hoursWorked.regular}
                    onChange={(e) => setFormData({
                      ...formData,
                      hoursWorked: {...formData.hoursWorked, regular: Number(e.target.value)}
                    })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Overtime</label>
                  <input
                    type="number"
                    value={formData.hoursWorked.overtime}
                    onChange={(e) => setFormData({
                      ...formData,
                      hoursWorked: {...formData.hoursWorked, overtime: Number(e.target.value)}
                    })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Vacation</label>
                  <input
                    type="number"
                    value={formData.hoursWorked.vacation}
                    onChange={(e) => setFormData({
                      ...formData,
                      hoursWorked: {...formData.hoursWorked, vacation: Number(e.target.value)}
                    })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Sick</label>
                  <input
                    type="number"
                    value={formData.hoursWorked.sick}
                    onChange={(e) => setFormData({
                      ...formData,
                      hoursWorked: {...formData.hoursWorked, sick: Number(e.target.value)}
                    })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Earnings</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Bonuses</label>
                  <input
                    type="number"
                    value={formData.bonuses}
                    onChange={(e) => setFormData({...formData, bonuses: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Commissions</label>
                  <input
                    type="number"
                    value={formData.commissions}
                    onChange={(e) => setFormData({...formData, commissions: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Allowances</label>
                  <input
                    type="number"
                    value={formData.allowances}
                    onChange={(e) => setFormData({...formData, allowances: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {selectedEmp && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Payroll Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Gross Pay: <span className="font-medium">${earnings.total.toFixed(2)}</span></p>
                    <p className="text-gray-600">Total Deductions: <span className="font-medium">${deductions.total.toFixed(2)}</span></p>
                  </div>
                  <div>
                    <p className="text-green-600 font-medium">Net Pay: ${(earnings.total - deductions.total).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.employeeId}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                Process Payroll
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Payroll Management</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </button>
          {(userRole === 'admin' || userRole === 'super_admin') && (
            <button
              onClick={() => setIsPayrollModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Process Payroll
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Gross Pay</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalGrossPay.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Net Pay</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalNetPay.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Deductions</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalDeductions.toFixed(2)}</p>
            </div>
            <Calculator className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Employees Processed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'payroll', 'employees', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payroll Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="grossPay" fill="#3b82f6" name="Gross Pay" />
                  <Bar dataKey="netPay" fill="#10b981" name="Net Pay" />
                  <Bar dataKey="deductions" fill="#ef4444" name="Deductions" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Payroll Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Payroll Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {payrollEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        entry.status === 'paid' ? 'bg-green-100' :
                        entry.status === 'approved' ? 'bg-blue-100' :
                        entry.status === 'draft' ? 'bg-yellow-100' :
                        'bg-red-100'
                      }`}>
                        {entry.status === 'paid' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                         entry.status === 'approved' ? <Clock className="w-5 h-5 text-blue-600" /> :
                         <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{entry.employeeName}</p>
                        <p className="text-sm text-gray-500">
                          {entry.payPeriod.startDate} - {entry.payPeriod.endDate}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${entry.netPay.toFixed(2)}</p>
                      <p className={`text-xs capitalize ${
                        entry.status === 'paid' ? 'text-green-600' :
                        entry.status === 'approved' ? 'text-blue-600' :
                        entry.status === 'draft' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {entry.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payroll' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="current">Current Period</option>
                <option value="last">Last Period</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Payroll Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pay Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Pay</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payrollEntries
                  .filter(entry => entry.employeeName.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{entry.employeeName}</div>
                      <div className="text-sm text-gray-500">{entry.paymentMethod}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{entry.payPeriod.startDate}</div>
                      <div className="text-gray-500">to {entry.payPeriod.endDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${entry.earnings.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${entry.deductions.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ${entry.netPay.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        entry.status === 'paid' ? 'bg-green-100 text-green-800' :
                        entry.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        entry.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedPayroll(entry);
                            // Show payroll details modal
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => generatePayslip(entry)}
                          className="text-green-600 hover:text-green-900"
                          title="Generate Payslip"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {entry.status === 'draft' && (
                          <button
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'employees' && (
        <div className="space-y-6">
          {/* Employee Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Account</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.department}</div>
                      <div className="text-sm text-gray-500">{employee.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${employee.salary.baseSalary.toLocaleString()}/{employee.salary.salaryType}
                      </div>
                      <div className="text-sm text-gray-500">
                        Since {new Date(employee.hireDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.bankDetails.bankName}</div>
                      <div className="text-sm text-gray-500">{employee.bankDetails.accountNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setIsEmployeeModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View/Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setIsPayrollModalOpen(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Process Payroll"
                        >
                          <Calculator className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {isPayrollModalOpen && (
        <PayrollModal
          onClose={() => setIsPayrollModalOpen(false)}
          onSubmit={(data) => processPayroll(data.employeeId, data)}
        />
      )}
    </div>
  );
};

export default PayrollSystem;
