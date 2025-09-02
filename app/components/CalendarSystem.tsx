'use client';

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar, Clock, Users, Plus, X, Edit, Trash2, Eye, MapPin, UserPlus } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  description?: string;
  type: 'meeting' | 'task' | 'deadline' | 'leave' | 'training' | 'other';
  attendees?: string[];
  location?: string;
  priority: 'low' | 'medium' | 'high';
  createdBy: string;
  allDay?: boolean;
  recurring?: boolean;
  backgroundColor?: string;
  borderColor?: string;
}

interface CalendarSystemProps {
  userRole: string;
  userId: string;
  teamMembers?: Array<{ id: string; name: string; email: string; }>;
}

const CalendarSystem: React.FC<CalendarSystemProps> = ({ userRole, userId, teamMembers = [] }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [view, setView] = useState('dayGridMonth');
  const [filter, setFilter] = useState('all');

  // Mock data - replace with actual API calls
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Team Sprint Planning',
      start: '2024-12-18T10:00:00',
      end: '2024-12-18T12:00:00',
      description: 'Sprint planning for Q1 2025 projects',
      type: 'meeting',
      attendees: ['team1', 'team2'],
      location: 'Conference Room A',
      priority: 'high',
      createdBy: 'manager1',
      backgroundColor: '#3b82f6',
      borderColor: '#1d4ed8'
    },
    {
      id: '2',
      title: 'Project Deadline - CRM Integration',
      start: '2024-12-20',
      type: 'deadline',
      priority: 'high',
      createdBy: 'admin1',
      allDay: true,
      backgroundColor: '#ef4444',
      borderColor: '#dc2626'
    },
    {
      id: '3',
      title: 'Employee Training - Security',
      start: '2024-12-19T14:00:00',
      end: '2024-12-19T16:00:00',
      type: 'training',
      priority: 'medium',
      createdBy: 'hr1',
      backgroundColor: '#10b981',
      borderColor: '#059669'
    },
    {
      id: '4',
      title: 'Leave - John Doe',
      start: '2024-12-23',
      end: '2024-12-27',
      type: 'leave',
      priority: 'low',
      createdBy: 'john_doe',
      allDay: true,
      backgroundColor: '#f59e0b',
      borderColor: '#d97706'
    }
  ];

  useEffect(() => {
    // Load calendar events
    setEvents(mockEvents);
  }, []);

  const getEventTypeColor = (type: string) => {
    const colors = {
      meeting: { bg: '#3b82f6', border: '#1d4ed8' },
      task: { bg: '#8b5cf6', border: '#7c3aed' },
      deadline: { bg: '#ef4444', border: '#dc2626' },
      leave: { bg: '#f59e0b', border: '#d97706' },
      training: { bg: '#10b981', border: '#059669' },
      other: { bg: '#6b7280', border: '#4b5563' }
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.dateStr);
    setIsCreateModalOpen(true);
  };

  const handleEventClick = (arg: any) => {
    const event = events.find(e => e.id === arg.event.id);
    if (event) {
      setSelectedEvent(event);
      setIsEventModalOpen(true);
    }
  };

  const createEvent = (eventData: Partial<CalendarEvent>) => {
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: eventData.title || 'New Event',
      start: eventData.start || selectedDate,
      end: eventData.end,
      description: eventData.description,
      type: eventData.type || 'other',
      attendees: eventData.attendees || [],
      location: eventData.location,
      priority: eventData.priority || 'medium',
      createdBy: userId,
      allDay: eventData.allDay || false,
      ...getEventTypeColor(eventData.type || 'other')
    };

    setEvents([...events, newEvent]);
    setIsCreateModalOpen(false);
  };

  const updateEvent = (eventId: string, updates: Partial<CalendarEvent>) => {
    setEvents(events.map(event =>
      event.id === eventId ? { ...event, ...updates } : event
    ));
    setIsEventModalOpen(false);
  };

  const deleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
    setIsEventModalOpen(false);
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.type === filter;
  });

  const EventModal = ({ event, onClose, onUpdate, onDelete }: any) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <p className="text-gray-900">{event.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
              <p className="text-sm text-gray-600">
                {new Date(event.start).toLocaleString()}
              </p>
            </div>
            {event.end && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
                <p className="text-sm text-gray-600">
                  {new Date(event.end).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                event.type === 'meeting' ? 'bg-blue-100 text-blue-800' :
                event.type === 'deadline' ? 'bg-red-100 text-red-800' :
                event.type === 'training' ? 'bg-green-100 text-green-800' :
                event.type === 'leave' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {event.type}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                event.priority === 'high' ? 'bg-red-100 text-red-800' :
                event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {event.priority}
              </span>
            </div>
          </div>

          {event.description && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <p className="text-sm text-gray-600">{event.description}</p>
            </div>
          )}

          {event.location && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <p className="text-sm text-gray-600 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {event.location}
              </p>
            </div>
          )}

          {event.attendees && event.attendees.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attendees</label>
              <div className="flex flex-wrap gap-1">
                {event.attendees.map((attendee, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    {attendee}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {(userRole === 'admin' || userRole === 'super_admin' || event.createdBy === userId) && (
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => {/* Edit functionality */}}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={() => onDelete(event.id)}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center justify-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const CreateEventModal = ({ onClose, onCreate }: any) => {
    const [formData, setFormData] = useState({
      title: '',
      start: selectedDate,
      end: '',
      description: '',
      type: 'meeting',
      location: '',
      priority: 'medium',
      allDay: false,
      attendees: [] as string[]
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onCreate(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Create Event</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date/Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.start}
                  onChange={(e) => setFormData({...formData, start: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date/Time</label>
                <input
                  type="datetime-local"
                  value={formData.end}
                  onChange={(e) => setFormData({...formData, end: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="meeting">Meeting</option>
                  <option value="task">Task</option>
                  <option value="deadline">Deadline</option>
                  <option value="leave">Leave</option>
                  <option value="training">Training</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Meeting room, office, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Event details..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="allDay"
                checked={formData.allDay}
                onChange={(e) => setFormData({...formData, allDay: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="allDay" className="text-sm text-gray-700">All Day Event</label>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Create Event
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
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
        </div>
        <div className="flex items-center space-x-4">
          {/* View Selector */}
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="dayGridMonth">Month</option>
            <option value="timeGridWeek">Week</option>
            <option value="timeGridDay">Day</option>
          </select>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Events</option>
            <option value="meeting">Meetings</option>
            <option value="task">Tasks</option>
            <option value="deadline">Deadlines</option>
            <option value="leave">Leave</option>
            <option value="training">Training</option>
          </select>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={view}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={filteredEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          height="auto"
          eventDisplay="block"
          eventTextColor="#ffffff"
          slotMinTime="07:00:00"
          slotMaxTime="19:00:00"
          allDaySlot={true}
          nowIndicator={true}
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5],
            startTime: '09:00',
            endTime: '17:00'
          }}
        />
      </div>

      {/* Event Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Total Events</p>
              <p className="text-2xl font-bold text-blue-900">{events.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Meetings</p>
              <p className="text-2xl font-bold text-green-900">
                {events.filter(e => e.type === 'meeting').length}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Deadlines</p>
              <p className="text-2xl font-bold text-red-900">
                {events.filter(e => e.type === 'deadline').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Leave Requests</p>
              <p className="text-2xl font-bold text-yellow-900">
                {events.filter(e => e.type === 'leave').length}
              </p>
            </div>
            <UserPlus className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Modals */}
      {isEventModalOpen && selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setIsEventModalOpen(false)}
          onUpdate={updateEvent}
          onDelete={deleteEvent}
        />
      )}

      {isCreateModalOpen && (
        <CreateEventModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={createEvent}
        />
      )}
    </div>
  );
};

export default CalendarSystem;
