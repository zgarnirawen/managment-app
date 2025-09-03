'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Badge } from '../../components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  MapPin,
  Plus,
  Edit,
  Trash2,
  Video,
  Phone,
  Mail,
  Bell,
  CheckCircle,
  AlertTriangle,
  Filter,
  Download
} from 'lucide-react'

// Mock calendar events data
const mockEvents = [
  {
    id: '1',
    title: 'Team Standup',
    start: '2024-12-16T09:00:00',
    end: '2024-12-16T09:30:00',
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
    extendedProps: {
      type: 'meeting',
      location: 'Conference Room A',
      attendees: ['john@company.com', 'sarah@company.com', 'mike@company.com'],
      description: 'Daily team standup meeting to discuss progress and blockers',
      priority: 'medium'
    }
  },
  {
    id: '2',
    title: 'Project Review',
    start: '2024-12-16T14:00:00',
    end: '2024-12-16T15:30:00',
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
    extendedProps: {
      type: 'review',
      location: 'Virtual Meeting',
      attendees: ['admin@company.com', 'manager@company.com'],
      description: 'Quarterly project review and planning session',
      priority: 'high'
    }
  },
  {
    id: '3',
    title: 'Training Session',
    start: '2024-12-17T10:00:00',
    end: '2024-12-17T12:00:00',
    backgroundColor: '#10b981',
    borderColor: '#10b981',
    extendedProps: {
      type: 'training',
      location: 'Training Room B',
      attendees: ['intern@company.com', 'hr@company.com'],
      description: 'Employee onboarding and system training',
      priority: 'medium'
    }
  },
  {
    id: '4',
    title: 'Client Meeting',
    start: '2024-12-18T11:00:00',
    end: '2024-12-18T12:00:00',
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
    extendedProps: {
      type: 'client',
      location: 'Client Office',
      attendees: ['sales@company.com', 'john.client@demo-company.com'],
      description: 'Product demonstration and contract discussion',
      priority: 'high'
    }
  },
  {
    id: '5',
    title: 'All Hands Meeting',
    start: '2024-12-19T15:00:00',
    end: '2024-12-19T16:00:00',
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
    extendedProps: {
      type: 'company',
      location: 'Main Auditorium',
      attendees: ['all@company.com'],
      description: 'Monthly company-wide meeting with updates and announcements',
      priority: 'high'
    }
  }
]

const eventTypes = [
  { value: 'meeting', label: 'Meeting', color: '#3b82f6' },
  { value: 'review', label: 'Review', color: '#f59e0b' },
  { value: 'training', label: 'Training', color: '#10b981' },
  { value: 'client', label: 'Client', color: '#ef4444' },
  { value: 'company', label: 'Company', color: '#8b5cf6' },
  { value: 'personal', label: 'Personal', color: '#6b7280' }
]

const priorityLevels = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' }
]

interface EventFormData {
  title: string
  description: string
  start: string
  end: string
  type: string
  location: string
  attendees: string
  priority: string
}

export default function CalendarDashboard() {
  const { user } = useUser()
  const [events, setEvents] = useState(mockEvents)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    start: '',
    end: '',
    type: 'meeting',
    location: '',
    attendees: '',
    priority: 'medium'
  })
  const [calendarView, setCalendarView] = useState('dayGridMonth')
  const [filterType, setFilterType] = useState('all')

  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(clickInfo.event)
    setShowEventDialog(true)
  }

  const handleDateSelect = (selectInfo: any) => {
    const startDate = new Date(selectInfo.start)
    const endDate = new Date(selectInfo.end)
    
    setFormData({
      ...formData,
      start: startDate.toISOString().slice(0, 16),
      end: endDate.toISOString().slice(0, 16)
    })
    setShowCreateDialog(true)
  }

  const handleCreateEvent = () => {
    const newEvent = {
      id: Date.now().toString(),
      title: formData.title,
      start: formData.start,
      end: formData.end,
      backgroundColor: eventTypes.find(t => t.value === formData.type)?.color || '#3b82f6',
      borderColor: eventTypes.find(t => t.value === formData.type)?.color || '#3b82f6',
      extendedProps: {
        type: formData.type,
        location: formData.location,
        attendees: formData.attendees.split(',').map(email => email.trim()),
        description: formData.description,
        priority: formData.priority
      }
    }

    setEvents([...events, newEvent])
    setShowCreateDialog(false)
    setFormData({
      title: '',
      description: '',
      start: '',
      end: '',
      type: 'meeting',
      location: '',
      attendees: '',
      priority: 'medium'
    })
  }

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter(event => event.id !== selectedEvent.id))
      setShowEventDialog(false)
      setSelectedEvent(null)
    }
  }

  const filteredEvents = filterType === 'all' 
    ? events 
    : events.filter(event => event.extendedProps?.type === filterType)

  const upcomingEvents = events
    .filter(event => new Date(event.start) >= new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 5)

  const todayEvents = events.filter(event => {
    const today = new Date().toDateString()
    return new Date(event.start).toDateString() === today
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your schedule, meetings, and events</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {eventTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Calendar</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant={calendarView === 'dayGridMonth' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCalendarView('dayGridMonth')}
                    >
                      Month
                    </Button>
                    <Button
                      variant={calendarView === 'timeGridWeek' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCalendarView('timeGridWeek')}
                    >
                      Week
                    </Button>
                    <Button
                      variant={calendarView === 'timeGridDay' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCalendarView('timeGridDay')}
                    >
                      Day
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: ''
                  }}
                  initialView={calendarView}
                  events={filteredEvents}
                  selectable={true}
                  selectMirror={true}
                  dayMaxEvents={true}
                  weekends={true}
                  eventClick={handleEventClick}
                  select={handleDateSelect}
                  height="600px"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Today's Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayEvents.length === 0 ? (
                  <p className="text-gray-500 text-sm">No events today</p>
                ) : (
                  <div className="space-y-3">
                    {todayEvents.map((event) => (
                      <div key={event.id} className="p-3 border rounded-lg">
                        <div className="font-medium text-sm">{event.title}</div>
                        <div className="text-xs text-gray-600 flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(event.start).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        {event.extendedProps?.location && (
                          <div className="text-xs text-gray-600 flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {event.extendedProps.location}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="p-3 border rounded-lg">
                      <div className="font-medium text-sm">{event.title}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {new Date(event.start).toLocaleDateString()} at{' '}
                        {new Date(event.start).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      <Badge 
                        className={`mt-2 text-xs ${
                          priorityLevels.find(p => p.value === event.extendedProps?.priority)?.color
                        }`}
                      >
                        {event.extendedProps?.priority} priority
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Event Types Legend */}
            <Card>
              <CardHeader>
                <CardTitle>Event Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {eventTypes.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: type.color }}
                      />
                      <span className="text-sm">{type.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Event Details Dialog */}
        <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedEvent?.title}</DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Time</label>
                  <p className="text-sm">
                    {new Date(selectedEvent.start).toLocaleString()} -{' '}
                    {new Date(selectedEvent.end).toLocaleString()}
                  </p>
                </div>
                
                {selectedEvent.extendedProps?.location && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Location</label>
                    <p className="text-sm">{selectedEvent.extendedProps.location}</p>
                  </div>
                )}

                {selectedEvent.extendedProps?.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <p className="text-sm">{selectedEvent.extendedProps.description}</p>
                  </div>
                )}

                {selectedEvent.extendedProps?.attendees && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Attendees</label>
                    <p className="text-sm">{selectedEvent.extendedProps.attendees.join(', ')}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDeleteEvent}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Event Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>
                Add a new event to your calendar
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Event title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start</label>
                  <Input
                    type="datetime-local"
                    value={formData.start}
                    onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End</label>
                  <Input
                    type="datetime-local"
                    value={formData.end}
                    onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityLevels.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Meeting location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Attendees</label>
                <Input
                  value={formData.attendees}
                  onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                  placeholder="email1@company.com, email2@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event description"
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleCreateEvent} className="flex-1">
                  Create Event
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
