import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'excel';
    const type = searchParams.get('type') || 'productivity';
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Sample data based on report type
    let reportData: any = {
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
      dateRange: `${from} to ${to}`,
      generatedAt: new Date().toISOString(),
    };

    // Generate realistic sample data based on report type
    switch (type) {
      case 'productivity':
        reportData.data = [
          { Employee: 'John Doe', Department: 'Engineering', 'Tasks Completed': 15, 'Hours Worked': 40, 'Productivity %': 95 },
          { Employee: 'Jane Smith', Department: 'Design', 'Tasks Completed': 12, 'Hours Worked': 38, 'Productivity %': 88 },
          { Employee: 'Bob Johnson', Department: 'Marketing', 'Tasks Completed': 10, 'Hours Worked': 35, 'Productivity %': 82 },
          { Employee: 'Alice Brown', Department: 'Engineering', 'Tasks Completed': 18, 'Hours Worked': 42, 'Productivity %': 97 },
          { Employee: 'Mike Wilson', Department: 'Sales', 'Tasks Completed': 8, 'Hours Worked': 30, 'Productivity %': 75 },
        ];
        break;
      
      case 'timesheet':
        reportData.data = [
          { Employee: 'John Doe', Date: '2025-09-01', 'Clock In': '09:00', 'Clock Out': '17:00', 'Total Hours': 8, 'Overtime': 0 },
          { Employee: 'Jane Smith', Date: '2025-09-01', 'Clock In': '09:15', 'Clock Out': '17:30', 'Total Hours': 8.25, 'Overtime': 0.25 },
          { Employee: 'Bob Johnson', Date: '2025-09-01', 'Clock In': '08:45', 'Clock Out': '16:45', 'Total Hours': 8, 'Overtime': 0 },
        ];
        break;
      
      case 'attendance':
        reportData.data = [
          { Employee: 'John Doe', 'Days Present': 22, 'Days Absent': 0, 'Late Arrivals': 2, 'Attendance %': 100 },
          { Employee: 'Jane Smith', 'Days Present': 21, 'Days Absent': 1, 'Late Arrivals': 1, 'Attendance %': 95.5 },
          { Employee: 'Bob Johnson', 'Days Present': 20, 'Days Absent': 2, 'Late Arrivals': 3, 'Attendance %': 90.9 },
        ];
        break;
      
      default:
        reportData.data = [
          { Metric: 'Total Employees', Value: '25' },
          { Metric: 'Active Projects', Value: '8' },
          { Metric: 'Completed Tasks', Value: '156' },
          { Metric: 'Average Productivity', Value: '87%' },
        ];
    }

    if (format === 'excel') {
      // Create Excel workbook
      const wb = XLSX.utils.book_new();
      
      // Create worksheet from data
      const ws = XLSX.utils.json_to_sheet(reportData.data);
      
      // Add some styling (basic)
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      
      // Auto-width columns
      const colWidths: any[] = [];
      for (let C = range.s.c; C <= range.e.c; ++C) {
        let maxWidth = 10;
        for (let R = range.s.r; R <= range.e.r; ++R) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = ws[cellAddress];
          if (cell && cell.v) {
            maxWidth = Math.max(maxWidth, cell.v.toString().length);
          }
        }
        colWidths.push({ width: Math.min(maxWidth + 2, 50) });
      }
      ws['!cols'] = colWidths;
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, reportData.title);
      
      // Generate buffer
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      });
      
    } else if (format === 'pdf') {
      // Generate PDF content as text (placeholder)
      const pdfContent = `
${reportData.title}
Date Range: ${reportData.dateRange}
Generated: ${new Date().toLocaleString()}

Report Data:
${reportData.data.map((item: any, index: number) => 
  `${index + 1}. ${Object.entries(item).map(([key, value]) => `${key}: ${value}`).join(', ')}`
).join('\n')}

---
End of Report
      `;

      return new NextResponse(pdfContent, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf"`,
        },
      });
    } else {
      // CSV format
      const csvContent = [
        Object.keys(reportData.data[0]).join(','),
        ...reportData.data.map((item: any) => 
          Object.values(item).map(val => `"${val}"`).join(',')
        )
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

  } catch (error) {
    console.error('Error exporting report:', error);
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    );
  }
}
