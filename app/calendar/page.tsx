'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type: 'meeting' | 'deadline' | 'holiday' | 'training' | 'personal' | 'sprint' | 'review';
  attendees?: string[];
  location?: string;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  createdBy: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  reminderMinutes?: number;
};

type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export default function CalendarSystem() {
  const { user } = useUser();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    type: 'meeting',
    startTime: '',
    endTime: '',
    location: '',
    priority: 'medium',
    reminderMinutes: 15
  });

  useEffect(() => {
    fetchEvents();
  }, [currentDate, view]);

  const fetchEvents = async () => {
    try {
      // Mock calendar events
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Team Standup',
          description: 'Daily standup meeting with development team',
          startTime: '2024-02-15T09:00:00',
          endTime: '2024-02-15T09:30:00',
          type: 'meeting',
          attendees: ['john@company.com', 'jane@company.com', 'mike@company.com'],
          location: 'Conference Room A',
          isRecurring: true,
          recurringPattern: 'daily',
          createdBy: user?.emailAddresses[0]?.emailAddress || 'user@company.com',
          status: 'confirmed',
          priority: 'high',
          reminderMinutes: 15
        },
        {
          id: '2',
          title: 'Sprint Planning',
          description: 'Planning for Sprint 24',
          startTime: '2024-02-16T14:00:00',
          endTime: '2024-02-16T16:00:00',
          type: 'sprint',
          attendees: ['team@company.com'],
          location: 'Online - Zoom',
          isRecurring: false,
          createdBy: user?.emailAddresses[0]?.emailAddress || 'user@company.com',
          status: 'confirmed',
          priority: 'high',
          reminderMinutes: 30
        },
        {
          id: '3',
          title: 'Project Deadline - Feature X',
          description: 'Final delivery of Feature X to production',
          startTime: '2024-02-20T17:00:00',
          endTime: '2024-02-20T17:00:00',
          type: 'deadline',
          isRecurring: false,
          createdBy: user?.emailAddresses[0]?.emailAddress || 'user@company.com',
          status: 'confirmed',
          priority: 'high',
          reminderMinutes: 60
        },
        {
          id: '4',
          title: 'Presidents Day',
          description: 'Federal Holiday - Office Closed',
          startTime: '2024-02-19T00:00:00',
          endTime: '2024-02-19T23:59:00',
          type: 'holiday',
          isRecurring: true,
          recurringPattern: 'yearly',
          createdBy: 'system',
          status: 'confirmed',
          priority: 'medium'
        },
        {
          id: '5',
          title: 'Code Review Session',
          description: 'Weekly code review with senior developers',
          startTime: '2024-02-17T11:00:00',
          endTime: '2024-02-17T12:00:00',
          type: 'review',
          attendees: ['senior-dev@company.com'],
          location: 'Dev Room',
          isRecurring: true,
          recurringPattern: 'weekly',
          createdBy: user?.emailAddresses[0]?.emailAddress || 'user@company.com',
          status: 'confirmed',
          priority: 'medium',
          reminderMinutes: 15
        },
        {
          id: '6',
          title: 'Personal Appointment',
          description: 'Doctor appointment',
          startTime: '2024-02-18T15:30:00',
          endTime: '2024-02-18T16:30:00',
          type: 'personal',
          isRecurring: false,
          createdBy: user?.emailAddresses[0]?.emailAddress || 'user@company.com',
          status: 'confirmed',
          priority: 'medium',
          reminderMinutes: 30
        }
      ];

      setEvents(mockEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
    setLoading(false);
  };

  const createEvent = async () => {
    if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const event: CalendarEvent = {
        id: Date.now().toString(),
        title: newEvent.title!,
        description: newEvent.description,
        startTime: newEvent.startTime!,
        endTime: newEvent.endTime!,
        type: newEvent.type!,
        location: newEvent.location,
        isRecurring: false,
        createdBy: user?.emailAddresses[0]?.emailAddress || 'user@company.com',
        status: 'confirmed',
        priority: newEvent.priority!,
        reminderMinutes: newEvent.reminderMinutes
      };

      setEvents(prev => [...prev, event]);
      setNewEvent({
        title: '',
        description: '',
        type: 'meeting',
        startTime: '',
        endTime: '',
        location: '',
        priority: 'medium',
        reminderMinutes: 15
      });
      setShowEventModal(false);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      setEvents(prev => prev.filter(event => event.id !== eventId));
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500';
      case 'deadline': return 'bg-red-500';
      case 'holiday': return 'bg-green-500';
      case 'training': return 'bg-purple-500';
      case 'personal': return 'bg-gray-500';
      case 'sprint': return 'bg-orange-500';
      case 'review': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (timeString: string) => {
    return new Date(timeString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTodaysEvents = () => {
    const today = new Date().toISOString().split('T')[0];
    return events.filter(event => 
      event.startTime.split('T')[0] === today
    ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(event => new Date(event.startTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-nextgen-dark-gray min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-nextgen-white">Calendar System</h1>
          <div className="flex space-x-3">
            <select
              value={view}
              onChange={(e) => setView(e.target.value as CalendarView)}
              className="bg-nextgen-medium-gray border border-nextgen-light-gray/20 rounded-lg px-3 py-2 text-nextgen-white"
            >
              <option value="month">Month View</option>
              <option value="week">Week View</option>
              <option value="day">Day View</option>
              <option value="agenda">Agenda View</option>
            </select>
            <button
              onClick={() => setShowEventModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              📅 New Event
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-nextgen-medium-gray/20 border border-nextgen-light-gray/20 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-nextgen-light-gray mb-2">Today's Events</h3>
            <p className="text-2xl font-bold text-nextgen-white">{getTodaysEvents().length}</p>
          </div>
          <div className="bg-nextgen-medium-gray/20 border border-nextgen-light-gray/20 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-nextgen-light-gray mb-2">This Week</h3>
            <p className="text-2xl font-bold text-blue-400">{events.filter(e => {
              const eventDate = new Date(e.startTime);
              const weekStart = new Date();
              weekStart.setDate(weekStart.getDate() - weekStart.getDay());
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekStart.getDate() + 7);
              return eventDate >= weekStart && eventDate < weekEnd;
            }).length}</p>
          </div>
          <div className="bg-nextgen-medium-gray/20 border border-nextgen-light-gray/20 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-nextgen-light-gray mb-2">Meetings</h3>
            <p className="text-2xl font-bold text-green-400">{events.filter(e => e.type === 'meeting').length}</p>
          </div>
          <div className="bg-nextgen-medium-gray/20 border border-nextgen-light-gray/20 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-nextgen-light-gray mb-2">Deadlines</h3>
            <p className="text-2xl font-bold text-red-400">{events.filter(e => e.type === 'deadline').length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Calendar View */}
          <div className="lg:col-span-2">
            <div className="bg-nextgen-medium-gray/20 border border-nextgen-light-gray/20 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-nextgen-white">
                  {view === 'agenda' ? 'Event Agenda' : 'Calendar View'}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                    className="bg-nextgen-medium-gray hover:bg-nextgen-light-gray/20 text-nextgen-white px-3 py-1 rounded transition-colors"
                  >
                    ←
                  </button>
                  <span className="text-nextgen-white px-4 py-1">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                    className="bg-nextgen-medium-gray hover:bg-nextgen-light-gray/20 text-nextgen-white px-3 py-1 rounded transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>

              {view === 'agenda' ? (
                <div className="space-y-3">
                  {events
                    .filter(event => new Date(event.startTime) >= new Date())
                    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                    .slice(0, 10)
                    .map(event => (
                    <div
                      key={event.id}
                      className="flex items-center space-x-3 p-3 bg-nextgen-medium-gray/30 rounded-lg hover:bg-nextgen-medium-gray/40 cursor-pointer transition-colors"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-nextgen-white font-medium">{event.title}</h4>
                            <p className="text-sm text-nextgen-light-gray">
                              {formatDate(event.startTime)} at {formatTime(event.startTime)}
                            </p>
                          </div>
                          <span className={`text-xs font-medium ${getPriorityColor(event.priority)}`}>
                            {event.priority}
                          </span>
                        </div>
                        {event.location && (
                          <p className="text-xs text-nextgen-light-gray mt-1">📍 {event.location}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1 text-center">
                  {/* Calendar grid would go here - simplified for demo */}
                  <div className="text-nextgen-light-gray text-sm font-medium p-2">Sun</div>
                  <div className="text-nextgen-light-gray text-sm font-medium p-2">Mon</div>
                  <div className="text-nextgen-light-gray text-sm font-medium p-2">Tue</div>
                  <div className="text-nextgen-light-gray text-sm font-medium p-2">Wed</div>
                  <div className="text-nextgen-light-gray text-sm font-medium p-2">Thu</div>
                  <div className="text-nextgen-light-gray text-sm font-medium p-2">Fri</div>
                  <div className="text-nextgen-light-gray text-sm font-medium p-2">Sat</div>
                  
                  {/* Simplified calendar days */}
                  {Array.from({ length: 35 }, (_, i) => {
                    const dayEvents = events.filter(event => {
                      const eventDate = new Date(event.startTime).getDate();
                      return eventDate === i + 1;
                    });
                    
                    return (
                      <div key={i} className="h-20 p-1 border border-nextgen-light-gray/10">
                        <div className="text-nextgen-white text-sm">{i + 1}</div>
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={`text-xs text-white p-1 mt-1 rounded ${getEventTypeColor(event.type)} cursor-pointer`}
                            onClick={() => setSelectedEvent(event)}
                          >
                            {event.title.substring(0, 8)}...
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-nextgen-light-gray">+{dayEvents.length - 2}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Events */}
            <div className="bg-nextgen-medium-gray/20 border border-nextgen-light-gray/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-nextgen-white mb-4">Today's Events</h3>
              <div className="space-y-3">
                {getTodaysEvents().length > 0 ? getTodaysEvents().map(event => (
                  <div
                    key={event.id}
                    className="flex items-center space-x-3 p-2 bg-nextgen-medium-gray/30 rounded cursor-pointer hover:bg-nextgen-medium-gray/40 transition-colors"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className={`w-2 h-2 rounded-full ${getEventTypeColor(event.type)}`}></div>
                    <div className="flex-1">
                      <p className="text-nextgen-white text-sm font-medium">{event.title}</p>
                      <p className="text-nextgen-light-gray text-xs">{formatTime(event.startTime)}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-nextgen-light-gray text-sm">No events today</p>
                )}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-nextgen-medium-gray/20 border border-nextgen-light-gray/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-nextgen-white mb-4">Upcoming</h3>
              <div className="space-y-3">
                {getUpcomingEvents().map(event => (
                  <div
                    key={event.id}
                    className="flex items-center space-x-3 p-2 bg-nextgen-medium-gray/30 rounded cursor-pointer hover:bg-nextgen-medium-gray/40 transition-colors"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className={`w-2 h-2 rounded-full ${getEventTypeColor(event.type)}`}></div>
                    <div className="flex-1">
                      <p className="text-nextgen-white text-sm font-medium">{event.title}</p>
                      <p className="text-nextgen-light-gray text-xs">
                        {formatDate(event.startTime)} - {formatTime(event.startTime)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Types Legend */}
            <div className="bg-nextgen-medium-gray/20 border border-nextgen-light-gray/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-nextgen-white mb-4">Event Types</h3>
              <div className="space-y-2">
                {[
                  { type: 'meeting', label: 'Meetings' },
                  { type: 'deadline', label: 'Deadlines' },
                  { type: 'holiday', label: 'Holidays' },
                  { type: 'training', label: 'Training' },
                  { type: 'sprint', label: 'Sprint Events' },
                  { type: 'review', label: 'Reviews' },
                  { type: 'personal', label: 'Personal' }
                ].map(({ type, label }) => (
                  <div key={type} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getEventTypeColor(type)}`}></div>
                    <span className="text-nextgen-light-gray text-sm">{label}</span>
                    <span className="text-nextgen-white text-sm">
                      ({events.filter(e => e.type === type).length})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-nextgen-medium-gray p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-semibold text-nextgen-white mb-4">Create New Event</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-nextgen-light-gray text-sm mb-1">Title *</label>
                  <input
                    type="text"
                    value={newEvent.title || ''}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-nextgen-dark-gray border border-nextgen-light-gray/20 rounded px-3 py-2 text-nextgen-white"
                    placeholder="Event title"
                  />
                </div>

                <div>
                  <label className="block text-nextgen-light-gray text-sm mb-1">Description</label>
                  <textarea
                    value={newEvent.description || ''}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-nextgen-dark-gray border border-nextgen-light-gray/20 rounded px-3 py-2 text-nextgen-white"
                    rows={3}
                    placeholder="Event description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-nextgen-light-gray text-sm mb-1">Start Time *</label>
                    <input
                      type="datetime-local"
                      value={newEvent.startTime || ''}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full bg-nextgen-dark-gray border border-nextgen-light-gray/20 rounded px-3 py-2 text-nextgen-white"
                    />
                  </div>
                  <div>
                    <label className="block text-nextgen-light-gray text-sm mb-1">End Time *</label>
                    <input
                      type="datetime-local"
                      value={newEvent.endTime || ''}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full bg-nextgen-dark-gray border border-nextgen-light-gray/20 rounded px-3 py-2 text-nextgen-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-nextgen-light-gray text-sm mb-1">Type</label>
                    <select
                      value={newEvent.type || 'meeting'}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as CalendarEvent['type'] }))}
                      className="w-full bg-nextgen-dark-gray border border-nextgen-light-gray/20 rounded px-3 py-2 text-nextgen-white"
                    >
                      <option value="meeting">Meeting</option>
                      <option value="deadline">Deadline</option>
                      <option value="training">Training</option>
                      <option value="personal">Personal</option>
                      <option value="sprint">Sprint</option>
                      <option value="review">Review</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-nextgen-light-gray text-sm mb-1">Priority</label>
                    <select
                      value={newEvent.priority || 'medium'}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, priority: e.target.value as CalendarEvent['priority'] }))}
                      className="w-full bg-nextgen-dark-gray border border-nextgen-light-gray/20 rounded px-3 py-2 text-nextgen-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-nextgen-light-gray text-sm mb-1">Location</label>
                  <input
                    type="text"
                    value={newEvent.location || ''}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-nextgen-dark-gray border border-nextgen-light-gray/20 rounded px-3 py-2 text-nextgen-white"
                    placeholder="Meeting location or online link"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={createEvent}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Create Event
                </button>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-nextgen-medium-gray p-6 rounded-lg w-full max-w-md">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-nextgen-white">{selectedEvent.title}</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-nextgen-light-gray hover:text-nextgen-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getEventTypeColor(selectedEvent.type)}`}></div>
                  <span className="text-nextgen-light-gray capitalize">{selectedEvent.type}</span>
                  <span className={`text-xs font-medium ${getPriorityColor(selectedEvent.priority)}`}>
                    {selectedEvent.priority} priority
                  </span>
                </div>

                {selectedEvent.description && (
                  <p className="text-nextgen-light-gray">{selectedEvent.description}</p>
                )}

                <div className="text-nextgen-white">
                  <p><strong>Start:</strong> {formatDate(selectedEvent.startTime)} at {formatTime(selectedEvent.startTime)}</p>
                  <p><strong>End:</strong> {formatDate(selectedEvent.endTime)} at {formatTime(selectedEvent.endTime)}</p>
                </div>

                {selectedEvent.location && (
                  <p className="text-nextgen-light-gray"><strong>Location:</strong> {selectedEvent.location}</p>
                )}

                {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                  <div>
                    <p className="text-nextgen-white font-medium">Attendees:</p>
                    <ul className="text-nextgen-light-gray text-sm">
                      {selectedEvent.attendees.map((attendee, index) => (
                        <li key={index}>• {attendee}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedEvent.isRecurring && (
                  <p className="text-nextgen-light-gray">
                    <strong>Recurring:</strong> {selectedEvent.recurringPattern}
                  </p>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => deleteEvent(selectedEvent.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
