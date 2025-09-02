'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '../components/ui/button';
import LoadingSpinner from '../components/LoadingSpinner';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export default function AuditLogsPage() {
  const { user, isLoaded } = useUser();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    userId: '',
    action: '',
    severity: '',
    resource: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Check if user is administrator or super administrator
  const userRole = user?.unsafeMetadata?.role as string || 
                   user?.publicMetadata?.role as string;
  const isAdmin = ['administrator', 'super_administrator'].includes(userRole?.toLowerCase() || '');

  useEffect(() => {
    if (isLoaded && isAdmin) {
      fetchAuditLogs();
    }
  }, [isLoaded, isAdmin, currentPage, filters]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });
      
      const response = await fetch(`/api/audit?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async () => {
    try {
      const params = new URLSearchParams({
        export: 'true',
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });
      
      const response = await fetch(`/api/audit?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/20';
      case 'low': return 'text-green-500 bg-green-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (!isLoaded) return <LoadingSpinner />;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-nextgen-dark-gray text-nextgen-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h1>
          <p className="text-nextgen-light-gray">Only administrators can access audit logs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nextgen-dark-gray text-nextgen-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-nextgen-teal mb-2">
            🔍 Audit Logs
          </h1>
          <p className="text-nextgen-light-gray">
            Complete system activity logs for security and compliance monitoring
          </p>
        </div>

        {/* Filters */}
        <div className="bg-nextgen-medium-gray rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-nextgen-teal mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-nextgen-light-gray mb-1">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full bg-nextgen-dark-blue border border-nextgen-light-gray rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-nextgen-light-gray mb-1">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full bg-nextgen-dark-blue border border-nextgen-light-gray rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-nextgen-light-gray mb-1">User ID</label>
              <input
                type="text"
                placeholder="Filter by user"
                value={filters.userId}
                onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
                className="w-full bg-nextgen-dark-blue border border-nextgen-light-gray rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-nextgen-light-gray mb-1">Action</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                className="w-full bg-nextgen-dark-blue border border-nextgen-light-gray rounded px-3 py-2"
              >
                <option value="">All Actions</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="view">View</option>
                <option value="export">Export</option>
              </select>
            </div>
            <div>
              <label className="block text-nextgen-light-gray mb-1">Severity</label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                className="w-full bg-nextgen-dark-blue border border-nextgen-light-gray rounded px-3 py-2"
              >
                <option value="">All Levels</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={fetchAuditLogs}
                className="w-full bg-nextgen-teal hover:bg-nextgen-teal-hover"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6 flex gap-4">
          <Button onClick={exportLogs} variant="outline">
            📥 Export CSV
          </Button>
          <Button onClick={() => setFilters({
            dateFrom: '', dateTo: '', userId: '', action: '', severity: '', resource: ''
          })} variant="outline">
            🔄 Clear Filters
          </Button>
        </div>

        {/* Logs Table */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-nextgen-medium-gray rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-nextgen-dark-blue">
                  <tr>
                    <th className="px-4 py-3 text-left text-nextgen-teal">Timestamp</th>
                    <th className="px-4 py-3 text-left text-nextgen-teal">User</th>
                    <th className="px-4 py-3 text-left text-nextgen-teal">Action</th>
                    <th className="px-4 py-3 text-left text-nextgen-teal">Resource</th>
                    <th className="px-4 py-3 text-left text-nextgen-teal">Details</th>
                    <th className="px-4 py-3 text-left text-nextgen-teal">Severity</th>
                    <th className="px-4 py-3 text-left text-nextgen-teal">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-nextgen-light-gray">
                        No audit logs found for the selected criteria
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="border-t border-nextgen-light-gray hover:bg-nextgen-dark-blue/30">
                        <td className="px-4 py-3 text-sm">
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-semibold">{log.userName}</div>
                            <div className="text-xs text-nextgen-light-gray">{log.userRole}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-nextgen-dark-blue rounded text-sm">
                            {log.action.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-semibold">{log.resource}</div>
                            {log.resourceId && (
                              <div className="text-xs text-nextgen-light-gray">ID: {log.resourceId}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate" title={log.details}>
                          {log.details}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-sm font-semibold ${getSeverityColor(log.severity)}`}>
                            {log.severity.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono">
                          {log.ipAddress}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center gap-4">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              variant="outline"
            >
              Previous
            </Button>
            <span className="text-nextgen-light-gray">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
