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
  Mail, 
  Send, 
  Inbox, 
  Archive, 
  Star, 
  Trash2, 
  Search,
  Plus,
  Reply,
  Forward,
  Paperclip,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

// Mock email data
const mockEmails = [
  {
    id: 1,
    from: 'sarah.johnson@company.com',
    fromName: 'Sarah Johnson',
    to: 'you@company.com',
    subject: 'Weekly Team Meeting - Agenda Items',
    preview: 'Hi team, please review the attached agenda for our weekly meeting scheduled for Friday...',
    content: `Hi team,

Please review the attached agenda for our weekly meeting scheduled for Friday at 2 PM.

Agenda Items:
1. Project status updates
2. Q4 planning discussion
3. New team member introductions
4. Process improvements

Let me know if you have any additional items to discuss.

Best regards,
Sarah`,
    timestamp: '2 hours ago',
    read: false,
    starred: true,
    priority: 'high',
    folder: 'inbox',
    attachments: ['agenda.pdf'],
    labels: ['meeting', 'urgent']
  },
  {
    id: 2,
    from: 'hr@company.com',
    fromName: 'HR Department',
    to: 'you@company.com',
    subject: 'Employee Benefits Update - Action Required',
    preview: 'Important updates to your employee benefits package. Please review and confirm your selections...',
    content: `Dear Employee,

We have important updates to your employee benefits package that require your attention.

Changes include:
- New health insurance options
- Updated retirement contribution limits
- Additional wellness programs

Please log into the HR portal and confirm your selections by the end of the month.

Thank you,
HR Department`,
    timestamp: '5 hours ago',
    read: true,
    starred: false,
    priority: 'medium',
    folder: 'inbox',
    attachments: [],
    labels: ['hr', 'benefits']
  },
  {
    id: 3,
    from: 'mike.chen@company.com',
    fromName: 'Mike Chen',
    to: 'you@company.com',
    subject: 'Code Review Request - Payment Module',
    preview: 'Could you please review the payment module changes? The PR is ready for review...',
    content: `Hi,

Could you please review the payment module changes? The PR is ready for review.

Key changes:
- Added new payment gateway integration
- Improved error handling
- Updated security validations

The deadline is tomorrow, so please prioritize this review.

Thanks,
Mike`,
    timestamp: '1 day ago',
    read: true,
    starred: false,
    priority: 'high',
    folder: 'inbox',
    attachments: [],
    labels: ['development', 'review']
  },
  {
    id: 4,
    from: 'admin@company.com',
    fromName: 'System Admin',
    to: 'you@company.com',
    subject: 'System Maintenance Scheduled',
    preview: 'Scheduled system maintenance on Sunday from 2 AM to 6 AM. Please save your work...',
    content: `Dear All,

We have scheduled system maintenance on Sunday from 2 AM to 6 AM EST.

During this time:
- Email system will be unavailable
- File servers will be offline
- Databases will be backed up

Please save all your work and log out before the maintenance window.

IT Team`,
    timestamp: '2 days ago',
    read: false,
    starred: false,
    priority: 'low',
    folder: 'inbox',
    attachments: [],
    labels: ['system', 'maintenance']
  }
]

const mockFolders = [
  { name: 'inbox', label: 'Inbox', count: 4, icon: Inbox },
  { name: 'starred', label: 'Starred', count: 1, icon: Star },
  { name: 'sent', label: 'Sent', count: 12, icon: Send },
  { name: 'archive', label: 'Archive', count: 45, icon: Archive },
  { name: 'trash', label: 'Trash', count: 3, icon: Trash2 }
]

interface ComposeEmail {
  to: string
  cc: string
  bcc: string
  subject: string
  content: string
  priority: string
  attachments: File[]
}

export default function EmailSystem() {
  const { user } = useUser()
  const [emails, setEmails] = useState(mockEmails)
  const [selectedEmail, setSelectedEmail] = useState<any>(null)
  const [selectedFolder, setSelectedFolder] = useState('inbox')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCompose, setShowCompose] = useState(false)
  const [composeEmail, setComposeEmail] = useState<ComposeEmail>({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    content: '',
    priority: 'medium',
    attachments: []
  })

  const filteredEmails = emails.filter(email => {
    const matchesFolder = email.folder === selectedFolder
    const matchesSearch = searchTerm === '' || 
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.fromName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.content.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFolder && matchesSearch
  })

  const handleEmailSelect = (email: any) => {
    setSelectedEmail(email)
    if (!email.read) {
      setEmails(emails.map(e => 
        e.id === email.id ? { ...e, read: true } : e
      ))
    }
  }

  const handleStarToggle = (emailId: number) => {
    setEmails(emails.map(email => 
      email.id === emailId ? { ...email, starred: !email.starred } : email
    ))
  }

  const handleDelete = (emailId: number) => {
    setEmails(emails.map(email => 
      email.id === emailId ? { ...email, folder: 'trash' } : email
    ))
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null)
    }
  }

  const handleArchive = (emailId: number) => {
    setEmails(emails.map(email => 
      email.id === emailId ? { ...email, folder: 'archive' } : email
    ))
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null)
    }
  }

  const handleSendEmail = () => {
    const newEmail = {
      id: emails.length + 1,
      from: user?.emailAddresses[0]?.emailAddress || 'you@company.com',
      fromName: user?.fullName || 'You',
      to: composeEmail.to,
      subject: composeEmail.subject,
      preview: composeEmail.content.substring(0, 100) + '...',
      content: composeEmail.content,
      timestamp: 'Just now',
      read: true,
      starred: false,
      priority: composeEmail.priority,
      folder: 'sent',
      attachments: composeEmail.attachments.map(f => f.name),
      labels: []
    }

    setEmails([newEmail, ...emails])
    setComposeEmail({
      to: '',
      cc: '',
      bcc: '',
      subject: '',
      content: '',
      priority: 'medium',
      attachments: []
    })
    setShowCompose(false)
    alert('Email sent successfully!')
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email System</h1>
            <p className="text-gray-600 mt-1">Manage your company communications</p>
          </div>
          <Button onClick={() => setShowCompose(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Compose
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Folders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockFolders.map((folder) => {
                    const Icon = folder.icon
                    return (
                      <Button
                        key={folder.name}
                        variant={selectedFolder === folder.name ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setSelectedFolder(folder.name)}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {folder.label}
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
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Team Directory
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Archive className="h-4 w-4 mr-2" />
                    Archive All Read
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search emails..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {filteredEmails.map((email) => (
                    <div
                      key={email.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedEmail?.id === email.id ? 'bg-blue-50 border-blue-200' : ''
                      } ${!email.read ? 'font-semibold' : ''}`}
                      onClick={() => handleEmailSelect(email)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium truncate">{email.fromName}</span>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(email.priority)}>
                            {email.priority}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStarToggle(email.id)
                            }}
                          >
                            <Star className={`h-4 w-4 ${email.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm font-medium mb-1">{email.subject}</p>
                      <p className="text-xs text-gray-600 mb-2">{email.preview}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{email.timestamp}</span>
                        {email.attachments.length > 0 && (
                          <Paperclip className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email Content */}
          <div className="lg:col-span-2">
            {selectedEmail ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{selectedEmail.subject}</h3>
                      <p className="text-sm text-gray-600">
                        From: {selectedEmail.fromName} &lt;{selectedEmail.from}&gt;
                      </p>
                      <p className="text-xs text-gray-500">{selectedEmail.timestamp}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(selectedEmail.priority)}>
                        {selectedEmail.priority}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => handleArchive(selectedEmail.id)}>
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(selectedEmail.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <pre className="whitespace-pre-wrap text-sm">{selectedEmail.content}</pre>
                  </div>
                  
                  {selectedEmail.attachments.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-2">Attachments:</h4>
                      <div className="space-y-2">
                        {selectedEmail.attachments.map((attachment: string, index: number) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                            <Paperclip className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{attachment}</span>
                            <Button size="sm" variant="outline">Download</Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
                    <Button size="sm">
                      <Reply className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                    <Button size="sm" variant="outline">
                      <Forward className="h-4 w-4 mr-2" />
                      Forward
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Mail className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No email selected</h3>
                  <p className="text-gray-600">Select an email from the list to view its contents</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Compose Email Modal */}
        {showCompose && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle>Compose Email</CardTitle>
                <CardDescription>Send a new email message</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-3">
                    <label className="block text-sm font-medium mb-2">To</label>
                    <Input
                      value={composeEmail.to}
                      onChange={(e) => setComposeEmail({...composeEmail, to: e.target.value})}
                      placeholder="recipient@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">CC</label>
                    <Input
                      value={composeEmail.cc}
                      onChange={(e) => setComposeEmail({...composeEmail, cc: e.target.value})}
                      placeholder="cc@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">BCC</label>
                    <Input
                      value={composeEmail.bcc}
                      onChange={(e) => setComposeEmail({...composeEmail, bcc: e.target.value})}
                      placeholder="bcc@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <Select value={composeEmail.priority} onValueChange={(value) => setComposeEmail({...composeEmail, priority: value})}>
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
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <Input
                    value={composeEmail.subject}
                    onChange={(e) => setComposeEmail({...composeEmail, subject: e.target.value})}
                    placeholder="Email subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <Textarea
                    value={composeEmail.content}
                    onChange={(e) => setComposeEmail({...composeEmail, content: e.target.value})}
                    placeholder="Write your message here..."
                    rows={8}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setShowCompose(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendEmail} className="bg-blue-600 hover:bg-blue-700">
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
