'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  MapPin, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  X
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  allDay: boolean;
  eventType: 'MEETING' | 'TASK_DEADLINE' | 'PROJECT_MILESTONE' | 'LEAVE' | 'HOLIDAY' | 'TRAINING' | 'PERSONAL';
  location?: string;
  attendees?: string[];
  creator?: {
    id: string;
    name: string;
  };
  task?: {
    id: string;
    title: string;
  };
  project?: {
    id: string;
    name: string;
  };
}

interface CalendarIntegrationProps {
  userRole: string;
  viewMode?: 'personal' | 'team';
}

const EVENT_TYPE_COLORS = {
  MEETING: 'bg-blue-500 border-blue-600',
  TASK_DEADLINE: 'bg-red-500 border-red-600',
  PROJECT_MILESTONE: 'bg-purple-500 border-purple-600',
  LEAVE: 'bg-orange-500 border-orange-600',
  HOLIDAY: 'bg-green-500 border-green-600',
  TRAINING: 'bg-yellow-500 border-yellow-600',
  PERSONAL: 'bg-gray-500 border-gray-600'
};

const EVENT_TYPE_LABELS = {
  MEETING: 'Meeting',
  TASK_DEADLINE: 'Task Deadline',
  PROJECT_MILESTONE: 'Project Milestone',
  LEAVE: 'Leave',
  HOLIDAY: 'Holiday',
  TRAINING: 'Training',
  PERSONAL: 'Personal'
};

export default function CalendarIntegration({ userRole, viewMode = 'personal' }: CalendarIntegrationProps) {
  const { user } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [filterTypes, setFilterTypes] = useState<string[]>(Object.keys(EVENT_TYPE_COLORS));
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    allDay: false,
    eventType: 'MEETING' as const,
    location: ''
  });

  useEffect(() => {
    fetchEvents();
  }, [currentDate, viewMode]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const startDate = getViewStartDate().toISOString();
      const endDate = getViewEndDate().toISOString();
      
      const endpoint = viewMode === 'team' 
        ? `/api/calendar/events?startDate=${startDate}&endDate=${endDate}&team=true`
        : `/api/calendar/events?startDate=${startDate}&endDate=${endDate}`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (response.ok) {
        setEvents(data.events || []);
      } else {
        console.error('Failed to fetch events:', data.error);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async () => {
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newEvent,
          startDateTime: new Date(newEvent.startDateTime).toISOString(),
          endDateTime: new Date(newEvent.endDateTime).toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(prev => [...prev, data.event]);
        setNewEvent({
          title: '',
          description: '',
          startDateTime: '',
          endDateTime: '',
          allDay: false,
          eventType: 'MEETING',
          location: ''
        });
        setShowCreateModal(false);
      } else {
        console.error('Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const getViewStartDate = () => {
    const date = new Date(currentDate);
    if (viewType === 'month') {
      date.setDate(1);
      date.setDate(date.getDate() - date.getDay());
    } else if (viewType === 'week') {
      date.setDate(date.getDate() - date.getDay());
    }
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const getViewEndDate = () => {
    const date = new Date(currentDate);
    if (viewType === 'month') {
      date.setMonth(date.getMonth() + 1);
      date.setDate(0);
      date.setDate(date.getDate() + (6 - date.getDay()));
    } else if (viewType === 'week') {
      date.setDate(date.getDate() + (6 - date.getDay()));
    }
    date.setHours(23, 59, 59, 999);
    return date;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewType === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (viewType === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.startDateTime).toISOString().split('T')[0];
      return eventDate === dateStr && filterTypes.includes(event.eventType);
    });
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateHeader = () => {
    const options: Intl.DateTimeFormatOptions = viewType === 'month' 
      ? { year: 'numeric', month: 'long' }
      : { year: 'numeric', month: 'long', day: 'numeric' };
    return currentDate.toLocaleDateString(undefined, options);
  };

  const generateCalendarDays = (): Date[] => {
    const startDate = getViewStartDate();
    const days: Date[] = [];
    
    for (let i = 0; i < (viewType === 'month' ? 42 : 7); i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const toggleFilter = (eventType: string) => {
    setFilterTypes(prev => 
      prev.includes(eventType)
        ? prev.filter(type => type !== eventType)
        : [...prev, eventType]
    );
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              {viewMode === 'team' ? 'Team Calendar' : 'My Calendar'}
            </h2>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateDate('prev')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-lg font-medium min-w-48 text-center">
                {formatDateHeader()}
              </span>
              <button
                onClick={() => navigateDate('next')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Type Selector */}
            <div className="flex rounded-lg border">
              {(['month', 'week', 'day'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setViewType(type)}
                  className={`px-3 py-1 text-sm font-medium capitalize ${
                    viewType === type
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Create Event Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Event
            </button>
          </div>
        </div>

        {/* Event Type Filters */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-opacity ${
                filterTypes.includes(type) ? 'opacity-100' : 'opacity-50'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${EVENT_TYPE_COLORS[type as keyof typeof EVENT_TYPE_COLORS].split(' ')[0]}`} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 p-4">
        {viewType === 'month' ? (
          <div className="h-full">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1 h-full">
              {generateCalendarDays().map((date, index) => {
                const dayEvents = getEventsForDate(date);
                const isCurrentMonthDay = isCurrentMonth(date);
                const isTodayDate = isToday(date);

                return (
                  <div
                    key={index}
                    className={`border rounded-lg p-2 min-h-24 ${
                      isCurrentMonthDay ? 'bg-white' : 'bg-gray-50'
                    } ${isTodayDate ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400'
                    } ${isTodayDate ? 'text-blue-600' : ''}`}>
                      {date.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className={`text-xs p-1 rounded cursor-pointer ${
                            EVENT_TYPE_COLORS[event.eventType]
                          } text-white truncate`}
                        >
                          {event.allDay ? event.title : `${formatTime(event.startDateTime)} ${event.title}`}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {generateCalendarDays().map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const isTodayDate = isToday(date);

              return (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    isTodayDate ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'
                  }`}
                >
                  <div className={`text-lg font-semibold mb-3 ${
                    isTodayDate ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {date.toLocaleDateString(undefined, { 
                      weekday: 'long', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  
                  <div className="space-y-2">
                    {dayEvents.length > 0 ? dayEvents.map(event => (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`p-3 rounded-lg cursor-pointer ${
                          EVENT_TYPE_COLORS[event.eventType]
                        } text-white`}
                      >
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm opacity-90">
                          {event.allDay ? 'All Day' : 
                            `${formatTime(event.startDateTime)} - ${formatTime(event.endDateTime)}`
                          }
                          {event.location && (
                            <span className="ml-2">📍 {event.location}</span>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="text-gray-500 text-center py-4">
                        No events scheduled
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create New Event</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <select
                  value={newEvent.eventType}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, eventType: e.target.value as any }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.startDateTime}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, startDateTime: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.endDateTime}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, endDateTime: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newEvent.allDay}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, allDay: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">All Day Event</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Enter event description"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={createEvent}
                disabled={!newEvent.title.trim() || !newEvent.startDateTime || !newEvent.endDateTime}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Event
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${EVENT_TYPE_COLORS[selectedEvent.eventType].split(' ')[0]}`} />
                <span className="text-sm font-medium">{EVENT_TYPE_LABELS[selectedEvent.eventType]}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                {selectedEvent.allDay ? 'All Day' : 
                  `${formatTime(selectedEvent.startDateTime)} - ${formatTime(selectedEvent.endDateTime)}`
                }
              </div>

              {selectedEvent.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {selectedEvent.location}
                </div>
              )}

              {selectedEvent.description && (
                <div className="text-sm text-gray-700">
                  {selectedEvent.description}
                </div>
              )}

              {selectedEvent.creator && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  Created by {selectedEvent.creator.name}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedEvent(null)}
              className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
