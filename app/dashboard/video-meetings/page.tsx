'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { 
  Video, 
  Plus, 
  Calendar,
  Clock,
  Users,
  Share2,
  Mic,
  MicOff,
  VideoOff,
  Phone,
  PhoneOff,
  Settings,
  Copy,
  ExternalLink,
  Play,
  Square,
  Camera,
  Monitor,
  MessageCircle,
  Search,
  Filter
} from 'lucide-react'

// Mock meeting data
const mockMeetings = [
  {
    id: 1,
    title: 'Team Standup',
    description: 'Daily team standup to discuss progress and blockers',
    startTime: '2024-12-16T09:00:00',
    endTime: '2024-12-16T09:30:00',
    status: 'scheduled',
    host: 'sarah.johnson@company.com',
    participants: [
      { email: 'john.smith@company.com', name: 'John Smith', status: 'accepted' },
      { email: 'mike.davis@company.com', name: 'Mike Davis', status: 'pending' },
      { email: 'emily.wilson@company.com', name: 'Emily Wilson', status: 'accepted' }
    ],
    meetingLink: 'https://meet.company.com/room/standup-12345',
    recordingEnabled: true,
    maxParticipants: 10
  },
  {
    id: 2,
    title: 'Project Review Meeting',
    description: 'Quarterly project review and planning session',
    startTime: '2024-12-16T14:00:00',
    endTime: '2024-12-16T15:30:00',
    status: 'in-progress',
    host: 'admin@company.com',
    participants: [
      { email: 'manager@company.com', name: 'Project Manager', status: 'accepted' },
      { email: 'lead@company.com', name: 'Tech Lead', status: 'accepted' },
      { email: 'client@example.com', name: 'Client Representative', status: 'accepted' }
    ],
    meetingLink: 'https://meet.company.com/room/review-67890',
    recordingEnabled: true,
    maxParticipants: 15
  },
  {
    id: 3,
    title: 'Training Session',
    description: 'Employee onboarding and system training',
    startTime: '2024-12-17T10:00:00',
    endTime: '2024-12-17T12:00:00',
    status: 'scheduled',
    host: 'hr@company.com',
    participants: [
      { email: 'intern@company.com', name: 'New Intern', status: 'accepted' },
      { email: 'trainer@company.com', name: 'System Trainer', status: 'accepted' }
    ],
    meetingLink: 'https://meet.company.com/room/training-11111',
    recordingEnabled: true,
    maxParticipants: 20
  },
  {
    id: 4,
    title: 'Client Presentation',
    description: 'Product demonstration and feature showcase',
    startTime: '2024-12-18T11:00:00',
    endTime: '2024-12-18T12:00:00',
    status: 'completed',
    host: 'sales@company.com',
    participants: [
      { email: 'client1@example.com', name: 'Client Manager', status: 'accepted' },
      { email: 'client2@example.com', name: 'Client Tech Lead', status: 'accepted' },
      { email: 'support@company.com', name: 'Support Rep', status: 'accepted' }
    ],
    meetingLink: 'https://meet.company.com/room/presentation-22222',
    recordingEnabled: true,
    maxParticipants: 12,
    recording: 'https://recordings.company.com/presentation-22222.mp4'
  }
]

const meetingStatuses = {
  scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
  'in-progress': { color: 'bg-green-100 text-green-800', label: 'In Progress' },
  completed: { color: 'bg-gray-100 text-gray-800', label: 'Completed' },
  cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
}

interface MeetingForm {
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  participants: string
  recordingEnabled: boolean
  maxParticipants: number
}

export default function VideoMeetingsDashboard() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('meetings')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [isInMeeting, setIsInMeeting] = useState(false)
  const [meetingControls, setMeetingControls] = useState({
    camera: true,
    microphone: true,
    screenshare: false
  })
  const [formData, setFormData] = useState<MeetingForm>({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    participants: '',
    recordingEnabled: true,
    maxParticipants: 10
  })

  const filteredMeetings = mockMeetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || meeting.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const upcomingMeetings = mockMeetings
    .filter(meeting => new Date(meeting.startTime) > new Date() && meeting.status === 'scheduled')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3)

  const handleCreateMeeting = async () => {
    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime) {
      alert('Please fill in all required fields')
      return
    }

    const newMeeting = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      startTime: `${formData.date}T${formData.startTime}:00`,
      endTime: `${formData.date}T${formData.endTime}:00`,
      status: 'scheduled',
      host: user?.emailAddresses[0]?.emailAddress || 'user@company.com',
      participants: formData.participants.split(',').map(email => ({
        email: email.trim(),
        name: email.trim().split('@')[0],
        status: 'pending'
      })),
      meetingLink: `https://meet.company.com/room/${Date.now()}`,
      recordingEnabled: formData.recordingEnabled,
      maxParticipants: formData.maxParticipants
    }

    // POST to placeholder create API
    try {
      await fetch('/api/placeholder/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'meeting', data: newMeeting })
      })
      setShowCreateDialog(false)
      alert('Meeting created (placeholder)')
    } catch (err) {
      console.error('Failed to create meeting (placeholder)', err)
      alert('Failed to create meeting (placeholder)')
    }
    setFormData({
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      participants: '',
      recordingEnabled: true,
      maxParticipants: 10
    })
  // handled above
  }

  const handleJoinMeeting = (meeting: any) => {
    setSelectedMeeting(meeting)
    setIsInMeeting(true)
  }

  const handleLeaveMeeting = () => {
    setIsInMeeting(false)
    setSelectedMeeting(null)
  }

  const toggleControl = (control: 'camera' | 'microphone' | 'screenshare') => {
    setMeetingControls(prev => ({
      ...prev,
      [control]: !prev[control]
    }))
  }

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const copyMeetingLink = (link: string) => {
    navigator.clipboard.writeText(link)
    alert('Meeting link copied to clipboard!')
  }

  if (isInMeeting && selectedMeeting) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        {/* Meeting Header */}
        <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">{selectedMeeting.title}</h1>
            <p className="text-sm text-gray-300">
              {selectedMeeting.participants.length + 1} participants
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Video Area */}
        <div className="flex-1 relative bg-gray-800">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-gray-700 rounded-lg p-8 text-center text-white">
              <Camera className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Video Preview</h3>
              <p className="text-gray-300">Your camera is {meetingControls.camera ? 'on' : 'off'}</p>
            </div>
          </div>

          {/* Participant thumbnails */}
          <div className="absolute top-4 right-4 space-y-2">
            {selectedMeeting.participants.slice(0, 3).map((participant: any, index: number) => (
              <div key={index} className="bg-gray-700 rounded-lg p-3 text-white text-sm w-32">
                <div className="w-8 h-8 bg-gray-600 rounded-full mx-auto mb-2" />
                <p className="text-center truncate">{participant.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Meeting Controls */}
        <div className="bg-gray-900 p-4 flex items-center justify-center space-x-4">
          <Button
            variant={meetingControls.microphone ? "default" : "destructive"}
            size="lg"
            onClick={() => toggleControl('microphone')}
            className="rounded-full w-12 h-12"
          >
            {meetingControls.microphone ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          
          <Button
            variant={meetingControls.camera ? "default" : "destructive"}
            size="lg"
            onClick={() => toggleControl('camera')}
            className="rounded-full w-12 h-12"
          >
            {meetingControls.camera ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          <Button
            variant={meetingControls.screenshare ? "default" : "secondary"}
            size="lg"
            onClick={() => toggleControl('screenshare')}
            className="rounded-full w-12 h-12"
          >
            <Monitor className="h-5 w-5" />
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={handleLeaveMeeting}
            className="rounded-full w-12 h-12"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Video Meetings</h1>
            <p className="text-gray-600 mt-1">Schedule, join, and manage video conferences</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="meetings">All Meetings</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="recordings">Recordings</TabsTrigger>
            <TabsTrigger value="rooms">Meeting Rooms</TabsTrigger>
          </TabsList>

          {/* All Meetings Tab */}
          <TabsContent value="meetings" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Meetings</CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        placeholder="Search meetings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredMeetings.map((meeting) => (
                    <div key={meeting.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{meeting.title}</h3>
                          <p className="text-sm text-gray-600">{meeting.description}</p>
                        </div>
                        <Badge className={meetingStatuses[meeting.status as keyof typeof meetingStatuses].color}>
                          {meetingStatuses[meeting.status as keyof typeof meetingStatuses].label}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDateTime(meeting.startTime)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          {meeting.participants.length} participants
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyMeetingLink(meeting.meetingLink)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedMeeting(meeting)
                              setShowDetailsDialog(true)
                            }}
                          >
                            Details
                          </Button>
                        </div>
                        
                        {meeting.status === 'scheduled' && (
                          <Button onClick={() => handleJoinMeeting(meeting)}>
                            <Video className="h-4 w-4 mr-2" />
                            Join Meeting
                          </Button>
                        )}
                        
                        {meeting.status === 'in-progress' && (
                          <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleJoinMeeting(meeting)}>
                            <Video className="h-4 w-4 mr-2" />
                            Join Now
                          </Button>
                        )}

                        {meeting.status === 'completed' && meeting.recording && (
                          <Button variant="outline">
                            <Play className="h-4 w-4 mr-2" />
                            View Recording
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upcoming Tab */}
          <TabsContent value="upcoming" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingMeetings.map((meeting) => (
                <Card key={meeting.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{meeting.title}</CardTitle>
                    <CardDescription>{meeting.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDateTime(meeting.startTime)}
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                        {meeting.participants.length} participants
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" className="flex-1" onClick={() => handleJoinMeeting(meeting)}>
                          <Video className="h-4 w-4 mr-2" />
                          Join
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => copyMeetingLink(meeting.meetingLink)}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Recordings Tab */}
          <TabsContent value="recordings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Meeting Recordings</CardTitle>
                <CardDescription>Access and manage recorded meetings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockMeetings.filter(m => m.recording).map((meeting) => (
                    <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{meeting.title}</h3>
                        <p className="text-sm text-gray-600">
                          Recorded on {formatDateTime(meeting.startTime)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Play
                        </Button>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meeting Rooms Tab */}
          <TabsContent value="rooms" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Meeting Room</CardTitle>
                  <CardDescription>Start an instant meeting</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => handleJoinMeeting({
                    id: 'instant',
                    title: 'Quick Meeting',
                    participants: [],
                    meetingLink: 'https://meet.company.com/room/instant-' + Date.now()
                  })}>
                    <Video className="h-4 w-4 mr-2" />
                    Start Instant Meeting
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Personal Room</CardTitle>
                  <CardDescription>Your dedicated meeting space</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Room ID: {user?.firstName?.toLowerCase()}-room
                    </p>
                    <Button variant="outline" className="w-full">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Room Link
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Join by ID</CardTitle>
                  <CardDescription>Enter meeting ID to join</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Input placeholder="Enter meeting ID" />
                    <Button variant="outline" className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      Join Meeting
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Meeting Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedMeeting?.title}</DialogTitle>
              <DialogDescription>{selectedMeeting?.description}</DialogDescription>
            </DialogHeader>
            {selectedMeeting && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Start Time</label>
                    <p>{formatDateTime(selectedMeeting.startTime)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">End Time</label>
                    <p>{formatDateTime(selectedMeeting.endTime)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Host</label>
                    <p>{selectedMeeting.host}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <Badge className={meetingStatuses[selectedMeeting.status as keyof typeof meetingStatuses].color}>
                      {meetingStatuses[selectedMeeting.status as keyof typeof meetingStatuses].label}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Participants</label>
                  <div className="mt-2 space-y-2">
                    {selectedMeeting.participants.map((participant: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{participant.name}</span>
                        <Badge variant="outline">{participant.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Meeting Link</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input value={selectedMeeting.meetingLink} readOnly />
                    <Button size="sm" onClick={() => copyMeetingLink(selectedMeeting.meetingLink)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Meeting Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New Meeting</DialogTitle>
              <DialogDescription>
                Create a new video meeting and invite participants
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Meeting Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter meeting title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Meeting description (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Time</label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Time</label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Participants (comma-separated emails)</label>
                <Input
                  value={formData.participants}
                  onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                  placeholder="email1@company.com, email2@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Max Participants</label>
                <Select value={formData.maxParticipants.toString()} onValueChange={(value) => setFormData({ ...formData, maxParticipants: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 participants</SelectItem>
                    <SelectItem value="10">10 participants</SelectItem>
                    <SelectItem value="25">25 participants</SelectItem>
                    <SelectItem value="50">50 participants</SelectItem>
                    <SelectItem value="100">100 participants</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="recording"
                  checked={formData.recordingEnabled}
                  onChange={(e) => setFormData({ ...formData, recordingEnabled: e.target.checked })}
                />
                <label htmlFor="recording" className="text-sm">Enable recording</label>
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleCreateMeeting} className="flex-1">
                  Schedule Meeting
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
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
