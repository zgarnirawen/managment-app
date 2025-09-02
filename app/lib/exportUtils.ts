import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

// PDF Export functionality
export const exportToPDF = (data: any, title: string, type: 'report' | 'payslip' | 'analytics') => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.text(title, 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
  
  let yPosition = 50;
  
  switch (type) {
    case 'report':
      exportReportToPDF(doc, data, yPosition);
      break;
    case 'payslip':
      exportPayslipToPDF(doc, data, yPosition);
      break;
    case 'analytics':
      exportAnalyticsToPDF(doc, data, yPosition);
      break;
  }
  
  // Save the PDF
  doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
};

// Excel Export functionality
export const exportToExcel = (data: any[], title: string, columns: string[]) => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Convert data to worksheet format
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, title);
  
  // Save the Excel file
  XLSX.writeFile(wb, `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Report PDF export helper
const exportReportToPDF = (doc: jsPDF, data: any, startY: number) => {
  let yPos = startY;
  
  if (data.summary) {
    doc.setFontSize(14);
    doc.text('Summary', 20, yPos);
    yPos += 15;
    
    doc.setFontSize(10);
    Object.entries(data.summary).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 25, yPos);
      yPos += 8;
    });
    yPos += 10;
  }
  
  if (data.productivity) {
    doc.setFontSize(14);
    doc.text('Productivity Data', 20, yPos);
    yPos += 15;
    
    doc.setFontSize(10);
    data.productivity.slice(0, 10).forEach((item: any) => {
      doc.text(`${item.date}: ${item.hoursWorked}h, ${item.tasksCompleted} tasks`, 25, yPos);
      yPos += 8;
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });
  }
};

// Payslip PDF export helper
const exportPayslipToPDF = (doc: jsPDF, data: any, startY: number) => {
  let yPos = startY;
  
  // Employee info
  doc.setFontSize(14);
  doc.text('Employee Information', 20, yPos);
  yPos += 15;
  
  doc.setFontSize(10);
  doc.text(`Name: ${data.employeeName || 'N/A'}`, 25, yPos);
  yPos += 8;
  doc.text(`Employee ID: ${data.employeeId || 'N/A'}`, 25, yPos);
  yPos += 8;
  doc.text(`Department: ${data.department || 'N/A'}`, 25, yPos);
  yPos += 15;
  
  // Salary breakdown
  doc.setFontSize(14);
  doc.text('Salary Breakdown', 20, yPos);
  yPos += 15;
  
  doc.setFontSize(10);
  doc.text(`Base Salary: $${data.baseSalary || '0.00'}`, 25, yPos);
  yPos += 8;
  doc.text(`Overtime: $${data.overtime || '0.00'}`, 25, yPos);
  yPos += 8;
  doc.text(`Bonuses: $${data.bonuses || '0.00'}`, 25, yPos);
  yPos += 8;
  doc.text(`Deductions: -$${data.deductions || '0.00'}`, 25, yPos);
  yPos += 8;
  
  doc.setFontSize(12);
  doc.text(`Net Pay: $${data.netPay || '0.00'}`, 25, yPos + 10);
};

// Analytics PDF export helper
const exportAnalyticsToPDF = (doc: jsPDF, data: any, startY: number) => {
  let yPos = startY;
  
  if (data.velocityTrend) {
    doc.setFontSize(14);
    doc.text('Sprint Velocity Trend', 20, yPos);
    yPos += 15;
    
    doc.setFontSize(10);
    data.velocityTrend.slice(0, 8).forEach((sprint: any) => {
      doc.text(`${sprint.sprintName}: ${sprint.velocity}% velocity, ${sprint.completedPoints}/${sprint.plannedPoints} points`, 25, yPos);
      yPos += 8;
    });
    yPos += 10;
  }
  
  if (data.employees) {
    doc.setFontSize(14);
    doc.text('Employee Productivity', 20, yPos);
    yPos += 15;
    
    doc.setFontSize(10);
    data.employees.slice(0, 10).forEach((emp: any) => {
      doc.text(`${emp.name}: ${emp.productivity}% productivity, ${emp.completed} tasks completed`, 25, yPos);
      yPos += 8;
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });
  }
};

// CSV Export for simple data
export const exportToCSV = (data: any[], filename: string) => {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};
