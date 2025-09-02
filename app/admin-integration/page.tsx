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
  Settings, 
  Users, 
  Shield, 
  Database, 
  Mail,
  Bell,
  Palette,
  Globe,
  Lock,
  Server,
  Activity,
  FileText,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Save
} from 'lucide-react'

// Mock system settings
const mockSystemSettings = {
  general: {
    companyName: 'ZGARNI Tech Solutions',
    companyEmail: 'admin@zgarni.com',
    timezone: 'UTC-5',
    language: 'English',
    dateFormat: 'MM/DD/YYYY',
    workingHours: {
      start: '09:00',
      end: '17:00'
    }
  },
  security: {
    passwordPolicy: {
      minLength: 8,
      requireNumbers: true,
      requireSymbols: true,
      requireUppercase: true,
      maxAge: 90
    },
    sessionTimeout: 30,
    twoFactorEnabled: true,
    ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
    auditLogging: true
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    dailyDigest: true,
    weeklyReports: true,
    systemAlerts: true
  },
  integrations: {
    slack: { enabled: true, webhook: 'https://hooks.slack.com/...' },
    teams: { enabled: false, webhook: '' },
    googleWorkspace: { enabled: true, domain: 'zgarni.com' },
    office365: { enabled: false, tenant: '' }
  },
  backup: {
    autoBackup: true,
    frequency: 'daily',
    retention: 30,
    location: 'AWS S3',
    lastBackup: '2024-12-16 03:00:00',
    nextBackup: '2024-12-17 03:00:00'
  }
}

const mockSystemStats = {
  users: {
    total: 156,
    active: 142,
    inactive: 14,
    newThisMonth: 8
  },
  system: {
    uptime: '99.9%',
    responseTime: '245ms',
    cpuUsage: '34%',
    memoryUsage: '62%',
    diskUsage: '78%'
  },
  security: {
    totalLogins: 1247,
    failedAttempts: 23,
    suspiciousActivity: 2,
    blockedIPs: 5
  }
}

interface IntegrationConfig {
  enabled: boolean
  webhook?: string
  domain?: string
  tenant?: string
}

interface SystemSettings {
  general: any
  security: any
  notifications: any
  integrations: { [key: string]: IntegrationConfig }
  backup: any
}

export default function AdminIntegration() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('overview')
  const [settings, setSettings] = useState<SystemSettings>(mockSystemSettings)
  const [stats] = useState(mockSystemStats)
  const [loading, setLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const handleSaveSettings = async (category: string) => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    setSaveMessage(`${category} settings saved successfully!`)
    setTimeout(() => setSaveMessage(''), 3000)
  }

  const handleBackupNow = async () => {
    setLoading(true)
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 3000))
    setLoading(false)
    alert('Backup completed successfully!')
  }

  const handleTestIntegration = async (service: string) => {
    setLoading(true)
    // Simulate integration test
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoading(false)
    alert(`${service} integration test completed successfully!`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Integration Center</h1>
            <p className="text-gray-600 mt-1">Manage system settings, integrations, and configurations</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <Activity className="h-4 w-4 mr-1" />
              System Healthy
            </Badge>
          </div>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">{saveMessage}</span>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* System Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    User Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Users</span>
                      <span className="font-semibold">{stats.users.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Active Users</span>
                      <span className="font-semibold text-green-600">{stats.users.active}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">New This Month</span>
                      <span className="font-semibold text-blue-600">{stats.users.newThisMonth}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Server className="h-5 w-5 mr-2" />
                    System Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Uptime</span>
                      <span className="font-semibold text-green-600">{stats.system.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Response Time</span>
                      <span className="font-semibold">{stats.system.responseTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">CPU Usage</span>
                      <span className="font-semibold">{stats.system.cpuUsage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Memory Usage</span>
                      <span className="font-semibold">{stats.system.memoryUsage}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Security Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Logins</span>
                      <span className="font-semibold">{stats.security.totalLogins}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Failed Attempts</span>
                      <span className="font-semibold text-orange-600">{stats.security.failedAttempts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Blocked IPs</span>
                      <span className="font-semibold text-red-600">{stats.security.blockedIPs}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button onClick={() => handleBackupNow()} disabled={loading} className="h-20 flex-col">
                    <Database className="h-6 w-6 mb-2" />
                    Backup Now
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <RefreshCw className="h-6 w-6 mb-2" />
                    Refresh Cache
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    Export Logs
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <FileText className="h-6 w-6 mb-2" />
                    System Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure basic system settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name</label>
                    <Input
                      value={settings.general.companyName}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, companyName: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Email</label>
                    <Input
                      type="email"
                      value={settings.general.companyEmail}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, companyEmail: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Timezone</label>
                    <Select value={settings.general.timezone} onValueChange={(value) => 
                      setSettings({
                        ...settings,
                        general: { ...settings.general, timezone: value }
                      })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                        <SelectItem value="UTC-7">Mountain Time (UTC-7)</SelectItem>
                        <SelectItem value="UTC-6">Central Time (UTC-6)</SelectItem>
                        <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                        <SelectItem value="UTC+0">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Language</label>
                    <Select value={settings.general.language} onValueChange={(value) => 
                      setSettings({
                        ...settings,
                        general: { ...settings.general, language: value }
                      })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="German">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button onClick={() => handleSaveSettings('General')} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save General Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure security policies and access controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Minimum Password Length</label>
                    <Input
                      type="number"
                      value={settings.security.passwordPolicy.minLength}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          passwordPolicy: {
                            ...settings.security.passwordPolicy,
                            minLength: parseInt(e.target.value)
                          }
                        }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
                    <Input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Require 2FA for all users</p>
                    </div>
                    <Button
                      variant={settings.security.twoFactorEnabled ? "default" : "outline"}
                      onClick={() => setSettings({
                        ...settings,
                        security: { ...settings.security, twoFactorEnabled: !settings.security.twoFactorEnabled }
                      })}
                    >
                      {settings.security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Audit Logging</p>
                      <p className="text-sm text-gray-600">Log all user actions</p>
                    </div>
                    <Button
                      variant={settings.security.auditLogging ? "default" : "outline"}
                      onClick={() => setSettings({
                        ...settings,
                        security: { ...settings.security, auditLogging: !settings.security.auditLogging }
                      })}
                    >
                      {settings.security.auditLogging ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={() => handleSaveSettings('Security')} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(settings.integrations).map(([service, config]) => (
                <Card key={service}>
                  <CardHeader>
                    <CardTitle className="capitalize">{service} Integration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Status</span>
                      <Badge variant={config.enabled ? "default" : "secondary"}>
                        {config.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    
                    {service === 'slack' && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Webhook URL</label>
                        <Input
                          value={config.webhook}
                          onChange={(e) => setSettings({
                            ...settings,
                            integrations: {
                              ...settings.integrations,
                              [service]: { ...config, webhook: e.target.value }
                            }
                          })}
                          placeholder="https://hooks.slack.com/..."
                        />
                      </div>
                    )}

                    {service === 'googleWorkspace' && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Domain</label>
                        <Input
                          value={config.domain}
                          onChange={(e) => setSettings({
                            ...settings,
                            integrations: {
                              ...settings.integrations,
                              [service]: { ...config, domain: e.target.value }
                            }
                          })}
                          placeholder="company.com"
                        />
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setSettings({
                          ...settings,
                          integrations: {
                            ...settings.integrations,
                            [service]: { ...config, enabled: !config.enabled }
                          }
                        })}
                      >
                        {config.enabled ? 'Disable' : 'Enable'}
                      </Button>
                      {config.enabled && (
                        <Button
                          variant="outline"
                          onClick={() => handleTestIntegration(service)}
                          disabled={loading}
                        >
                          Test Connection
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Backup Tab */}
          <TabsContent value="backup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Backup Configuration</CardTitle>
                <CardDescription>Manage system backups and data retention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Backup Frequency</label>
                    <Select value={settings.backup.frequency} onValueChange={(value) => 
                      setSettings({
                        ...settings,
                        backup: { ...settings.backup, frequency: value }
                      })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Retention (days)</label>
                    <Input
                      type="number"
                      value={settings.backup.retention}
                      onChange={(e) => setSettings({
                        ...settings,
                        backup: { ...settings.backup, retention: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Last Backup</span>
                    <span className="font-medium">{settings.backup.lastBackup}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Backup</span>
                    <span className="font-medium">{settings.backup.nextBackup}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage Location</span>
                    <span className="font-medium">{settings.backup.location}</span>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button onClick={() => handleBackupNow()} disabled={loading}>
                    <Database className="h-4 w-4 mr-2" />
                    {loading ? 'Creating Backup...' : 'Backup Now'}
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Latest
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Database</span>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Web Server</span>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Cache</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Storage</span>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">High CPU Usage</p>
                        <p className="text-xs text-gray-600">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Backup Completed</p>
                        <p className="text-xs text-gray-600">6 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">System Update</p>
                        <p className="text-xs text-gray-600">1 day ago</p>
                      </div>
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
