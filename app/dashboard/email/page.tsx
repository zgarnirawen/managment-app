'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { 
  Mail, 
  Send, 
  Inbox, 
  Star, 
  Archive,
  Trash2,
  Plus,
  Search,
  Filter,
  Paperclip,
  Reply,
  ReplyAll,
  Forward,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
  Flag
} from 'lucide-react'

// Mock email data
const mockEmails = [
  {
    id: 1,
    sender: 'sarah.johnson@company.com',
    senderName: 'Sarah Johnson',
    subject: 'Project Update - Q4 Deliverables',
    preview: 'Hi team, I wanted to provide an update on our Q4 deliverables and discuss the timeline for the upcoming milestones...',
    body: 'Hi team,\n\nI wanted to provide an update on our Q4 deliverables and discuss the timeline for the upcoming milestones. We have made significant progress on the core features and are on track to meet our December deadline.\n\nKey Updates:\n- User authentication system: 95% complete\n- Dashboard analytics: 80% complete\n- Mobile responsive design: 70% complete\n\nNext Steps:\n1. Complete remaining dashboard features\n2. Conduct user testing\n3. Prepare deployment documentation\n\nPlease let me know if you have any questions or concerns.\n\nBest regards,\nSarah',
    timestamp: '2024-12-16T09:30:00',
    read: false,
    starred: true,
    priority: 'high',
    folder: 'inbox',
    attachments: [
      { name: 'Q4_Project_Report.pdf', size: '2.4 MB' },
      { name: 'Timeline_Updated.xlsx', size: '856 KB' }
    ]
  },
  {
    id: 2,
    sender: 'hr@company.com',
    senderName: 'HR Department',
    subject: 'Employee Benefits Open Enrollment',
    preview: 'Annual benefits enrollment is now open. Please review your current benefits and make any necessary changes by December 31st...',
    body: 'Dear Team,\n\nAnnual benefits enrollment is now open. Please review your current benefits and make any necessary changes by December 31st.\n\nAvailable Benefits:\n- Health Insurance Plans\n- Dental and Vision Coverage\n- 401(k) Retirement Plan\n- Life Insurance\n- Flexible Spending Account\n\nTo make changes, please log into the benefits portal or contact HR directly.\n\nThank you,\nHR Team',
    timestamp: '2024-12-15T14:20:00',
    read: true,
    starred: false,
    priority: 'medium',
    folder: 'inbox',
    attachments: []
  },
  {
    id: 3,
    sender: 'admin@company.com',
    senderName: 'System Admin',
    subject: 'Scheduled Maintenance - December 20th',
    preview: 'We will be performing scheduled system maintenance on December 20th from 2:00 AM to 6:00 AM EST. During this time...',
    body: 'Dear Users,\n\nWe will be performing scheduled system maintenance on December 20th from 2:00 AM to 6:00 AM EST.\n\nDuring this time, the following services will be unavailable:\n- Employee portal\n- Time tracking system\n- Payroll application\n\nWe apologize for any inconvenience and appreciate your understanding.\n\nIT Team',
    timestamp: '2024-12-15T10:15:00',
    read: true,
    starred: false,
    priority: 'low',
    folder: 'inbox',
    attachments: []
  },
  {
    id: 4,
    sender: 'client@example.com',
    senderName: 'John Client',
    subject: 'Meeting Follow-up and Next Steps',
    preview: 'Thank you for the productive meeting yesterday. I wanted to follow up on the action items we discussed and confirm next steps...',
    body: 'Hi Team,\n\nThank you for the productive meeting yesterday. I wanted to follow up on the action items we discussed and confirm next steps.\n\nAction Items:\n1. Provide technical specifications by Friday\n2. Schedule demo session for next week\n3. Review contract terms and conditions\n\nI look forward to moving forward with this partnership.\n\nBest regards,\nJohn',
    timestamp: '2024-12-14T16:45:00',
    read: true,
    starred: true,
    priority: 'high',
    folder: 'sent',
    attachments: []
  }
]

const folders = [
  { id: 'inbox', name: 'Inbox', icon: Inbox, count: 3 },
  { id: 'sent', name: 'Sent', icon: Send, count: 12 },
  { id: 'drafts', name: 'Drafts', icon: Mail, count: 2 },
  { id: 'starred', name: 'Starred', icon: Star, count: 5 },
  { id: 'archive', name: 'Archive', icon: Archive, count: 24 },
  { id: 'trash', name: 'Trash', icon: Trash2, count: 8 }
]

const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800'
}

interface ComposeEmailData {
  to: string
  cc: string
  bcc: string
  subject: string
  body: string
  priority: string
}

export default function EmailDashboard() {
  const { user } = useUser()
  const [selectedFolder, setSelectedFolder] = useState('inbox')
  const [selectedEmail, setSelectedEmail] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCompose, setShowCompose] = useState(false)
  const [composeData, setComposeData] = useState<ComposeEmailData>({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    priority: 'medium'
  })

  const filteredEmails = mockEmails.filter(email => {
    const matchesFolder = selectedFolder === 'all' || email.folder === selectedFolder || 
      (selectedFolder === 'starred' && email.starred)
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.preview.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFolder && matchesSearch
  })

  const handleSendEmail = () => {
    // Simulate sending email
    console.log('Sending email:', composeData)
    setShowCompose(false)
    setComposeData({
      to: '',
      cc: '',
      bcc: '',
      subject: '',
      body: '',
      priority: 'medium'
    })
    alert('Email sent successfully!')
  }

  const handleEmailAction = (action: string, emailId: number) => {
    console.log(`${action} email ${emailId}`)
    // Implement email actions (star, archive, delete, etc.)
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your company communications and messages</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button onClick={() => setShowCompose(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Compose
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Folders */}
            <Card>
              <CardHeader>
                <CardTitle>Folders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {folders.map((folder) => {
                    const Icon = folder.icon
                    return (
                      <Button
                        key={folder.id}
                        variant={selectedFolder === folder.id ? 'default' : 'ghost'}
                        className="w-full justify-between"
                        onClick={() => setSelectedFolder(folder.id)}
                      >
                        <div className="flex items-center">
                          <Icon className="h-4 w-4 mr-2" />
                          {folder.name}
                        </div>
                        <Badge variant="secondary" className="ml-auto">
                          {folder.count}
                        </Badge>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark All Read
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Archive className="h-4 w-4 mr-2" />
                    Archive All
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter Options
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="capitalize">{selectedFolder}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {filteredEmails.map((email) => (
                    <div
                      key={email.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                        selectedEmail?.id === email.id ? 'bg-blue-50 border-blue-200' : ''
                      } ${!email.read ? 'font-semibold bg-blue-50/30' : ''}`}
                      onClick={() => setSelectedEmail(email)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{email.senderName}</span>
                          {email.starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                          {email.attachments.length > 0 && <Paperclip className="h-4 w-4 text-gray-400" />}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={priorityColors[email.priority as keyof typeof priorityColors]}>
                            {email.priority}
                          </Badge>
                          <span className="text-xs text-gray-500">{formatTimestamp(email.timestamp)}</span>
                        </div>
                      </div>
                      <div className="text-sm font-medium mb-1 truncate">{email.subject}</div>
                      <div className="text-xs text-gray-600 truncate">{email.preview}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email Content */}
          <div>
            {selectedEmail ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{selectedEmail.subject}</CardTitle>
                      <CardDescription>
                        From: {selectedEmail.senderName} &lt;{selectedEmail.sender}&gt;
                      </CardDescription>
                      <CardDescription className="text-xs">
                        {new Date(selectedEmail.timestamp).toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEmailAction('star', selectedEmail.id)}>
                        <Star className={`h-4 w-4 ${selectedEmail.starred ? 'text-yellow-500 fill-current' : ''}`} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Priority Badge */}
                    <Badge className={priorityColors[selectedEmail.priority as keyof typeof priorityColors]}>
                      {selectedEmail.priority} priority
                    </Badge>

                    {/* Email Body */}
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-sm">{selectedEmail.body}</div>
                    </div>

                    {/* Attachments */}
                    {selectedEmail.attachments.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Attachments</h4>
                        <div className="space-y-2">
                          {selectedEmail.attachments.map((attachment: any, index: number) => (
                            <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                              <Paperclip className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{attachment.name}</span>
                              <span className="text-xs text-gray-500">({attachment.size})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-4 border-t">
                      <Button size="sm">
                        <Reply className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                      <Button variant="outline" size="sm">
                        <ReplyAll className="h-4 w-4 mr-2" />
                        Reply All
                      </Button>
                      <Button variant="outline" size="sm">
                        <Forward className="h-4 w-4 mr-2" />
                        Forward
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No email selected</h3>
                  <p className="text-gray-600">Select an email from the list to view its contents</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Compose Email Dialog */}
        <Dialog open={showCompose} onOpenChange={setShowCompose}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Compose Email</DialogTitle>
              <DialogDescription>
                Create and send a new email message
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">To</label>
                <Input
                  value={composeData.to}
                  onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                  placeholder="recipient@company.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">CC</label>
                  <Input
                    value={composeData.cc}
                    onChange={(e) => setComposeData({ ...composeData, cc: e.target.value })}
                    placeholder="cc@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">BCC</label>
                  <Input
                    value={composeData.bcc}
                    onChange={(e) => setComposeData({ ...composeData, bcc: e.target.value })}
                    placeholder="bcc@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <Input
                  value={composeData.subject}
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                  placeholder="Email subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <Select value={composeData.priority} onValueChange={(value) => setComposeData({ ...composeData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <Textarea
                  value={composeData.body}
                  onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                  placeholder="Type your message here..."
                  rows={8}
                />
              </div>

              <div className="flex items-center space-x-4">
                <Button variant="outline">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Attach Files
                </Button>
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleSendEmail} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" onClick={() => setShowCompose(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
