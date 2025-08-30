'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Calendar, Filter, Users, Clock } from 'lucide-react';
import { EventDetailsModal, CreateMeetingModal } from '../../components/calendar';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  type: 'TASK' | 'SPRINT' | 'MEETING' | 'LEAVE';
  employeeId?: string;
  employeeName?: string;
  description?: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: any;
}

export default function CalendarPage() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewFilter, setViewFilter] = useState<string>('all');
  const [calendarView, setCalendarView] = useState('dayGridMonth');
  
  const queryClient = useQueryClient();

  // Fetch calendar events
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['calendar-events', viewFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (viewFilter !== 'all') {
        params.append('employeeId', viewFilter);
      }
      
      const response = await fetch(`/api/calendar?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch calendar events');
      }
      return response.json();
    },
  });

  // Update event mutation for drag & drop
  const updateEventMutation = useMutation({
    mutationFn: async ({ id, start, end }: { id: string; start: string; end?: string }) => {
      const response = await fetch('/api/calendar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, start, end }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update event');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });

  // Handle event click
  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(clickInfo.event.toPlainObject());
    setIsEventModalOpen(true);
  };

  // Handle date click (for creating meetings)
  const handleDateClick = (dateClickInfo: any) => {
    setSelectedDate(new Date(dateClickInfo.dateStr));
    setIsMeetingModalOpen(true);
  };

  // Handle event drop (drag & drop)
  const handleEventDrop = (dropInfo: any) => {
    updateEventMutation.mutate({
      id: dropInfo.event.id,
      start: dropInfo.event.start.toISOString(),
      end: dropInfo.event.end?.toISOString(),
    });
  };

  // Filter events based on type
  const filteredEvents = events.filter((event: CalendarEvent) => {
    if (viewFilter === 'all') return true;
    return event.employeeId === viewFilter;
  });

  const getEventCounts = () => {
    const counts = {
      tasks: events.filter((e: CalendarEvent) => e.type === 'TASK').length,
      sprints: events.filter((e: CalendarEvent) => e.type === 'SPRINT').length,
      meetings: events.filter((e: CalendarEvent) => e.type === 'MEETING').length,
      leave: events.filter((e: CalendarEvent) => e.type === 'LEAVE').length,
    };
    return counts;
  };

  const eventCounts = getEventCounts();

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">Error loading calendar events. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">View and manage tasks, sprints, meetings, and events</p>
        </div>
        <div className="flex gap-3">
          <CreateMeetingModal 
            isOpen={isMeetingModalOpen}
            onClose={() => setIsMeetingModalOpen(false)}
            selectedDate={selectedDate}
            onMeetingCreated={() => {
              queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
              setIsMeetingModalOpen(false);
            }}
          />
          <Button onClick={() => setIsMeetingModalOpen(true)}>
            <Clock className="h-4 w-4 mr-2" />
            New Meeting
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              <span className="text-sm font-medium">Tasks</span>
            </div>
            <p className="text-2xl font-bold">{eventCounts.tasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-orange-500"></div>
              <span className="text-sm font-medium">Sprints</span>
            </div>
            <p className="text-2xl font-bold">{eventCounts.sprints}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span className="text-sm font-medium">Meetings</span>
            </div>
            <p className="text-2xl font-bold">{eventCounts.meetings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-500"></div>
              <span className="text-sm font-medium">Leave</span>
            </div>
            <p className="text-2xl font-bold">{eventCounts.leave}</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Calendar Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="space-y-2">
              <label className="text-sm font-medium">Employee Filter</label>
              <Select value={viewFilter} onValueChange={setViewFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {/* TODO: Add employee options from API */}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">View</label>
              <Select value={calendarView} onValueChange={setCalendarView}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dayGridMonth">Month</SelectItem>
                  <SelectItem value="timeGridWeek">Week</SelectItem>
                  <SelectItem value="timeGridDay">Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading calendar events...</p>
              </div>
            </div>
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              initialView={calendarView}
              events={filteredEvents}
              editable={true}
              droppable={true}
              eventClick={handleEventClick}
              dateClick={handleDateClick}
              eventDrop={handleEventDrop}
              height="auto"
              eventDisplay="block"
              dayMaxEvents={3}
              moreLinkClick="popover"
              nowIndicator={true}
              selectable={true}
              selectMirror={true}
              eventDidMount={(info) => {
                // Add custom styling based on event type
                const eventType = info.event.extendedProps.type;
                info.el.setAttribute('data-event-type', eventType);
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setSelectedEvent(null);
        }}
        onEventUpdated={() => {
          queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
        }}
      />
    </div>
  );
}
