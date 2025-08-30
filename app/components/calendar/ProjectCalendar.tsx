'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Calendar, Clock, User, Flag, Target, Users } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps: {
    type: 'task' | 'meeting' | 'sprint' | 'deadline' | 'leave';
    description?: string;
    priority?: string;
    assignee?: { name: string; email: string };
    status?: string;
    location?: string;
    attendees?: Array<{ name: string; email: string }>;
  };
}

interface ProjectCalendarProps {
  sprintId?: string;
  projectId?: string;
  employeeId?: string;
  showAll?: boolean;
}

export default function ProjectCalendar({ sprintId, projectId, employeeId, showAll = false }: ProjectCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('dayGridMonth');

  useEffect(() => {
    fetchCalendarEvents();
  }, [sprintId, projectId, employeeId]);

  const fetchCalendarEvents = async () => {
    try {
      setIsLoading(true);
      let url = '/api/calendar';
      const params = new URLSearchParams();
      
      if (sprintId) params.append('sprintId', sprintId);
      if (projectId) params.append('projectId', projectId);
      if (employeeId) params.append('employeeId', employeeId);
      if (showAll) params.append('showAll', 'true');
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch calendar events');
      
      const data = await response.json();
      setEvents(transformEvents(data));
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const transformEvents = (data: any[]): CalendarEvent[] => {
    return data.map(item => {
      let event: CalendarEvent = {
        id: item.id,
        title: item.title,
        start: item.start || item.startDate || item.deadline,
        end: item.end || item.endDate,
        extendedProps: {
          type: item.type,
          description: item.description,
          priority: item.priority,
          status: item.status,
          assignee: item.assignedTo || item.assignee,
          location: item.location,
          attendees: item.attendees
        }
      };

      // Color coding based on event type
      switch (item.type) {
        case 'task':
          event.backgroundColor = getTaskColor(item.priority, item.status);
          event.borderColor = getTaskBorderColor(item.priority);
          break;
        case 'meeting':
          event.backgroundColor = '#8B5CF6';
          event.borderColor = '#7C3AED';
          break;
        case 'sprint':
          event.backgroundColor = '#3B82F6';
          event.borderColor = '#2563EB';
          break;
        case 'deadline':
          event.backgroundColor = '#EF4444';
          event.borderColor = '#DC2626';
          break;
        case 'leave':
          event.backgroundColor = '#10B981';
          event.borderColor = '#059669';
          break;
        default:
          event.backgroundColor = '#6B7280';
          event.borderColor = '#4B5563';
      }

      return event;
    });
  };

  const getTaskColor = (priority: string, status: string) => {
    if (status === 'DONE') return '#10B981';
    
    switch (priority) {
      case 'HIGH': return '#EF4444';
      case 'MEDIUM': return '#F59E0B';
      case 'LOW': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getTaskBorderColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return '#DC2626';
      case 'MEDIUM': return '#D97706';
      case 'LOW': return '#4B5563';
      default: return '#4B5563';
    }
  };

  const handleEventClick = (clickInfo: any) => {
    const event = events.find(e => e.id === clickInfo.event.id);
    if (event) {
      setSelectedEvent(event);
    }
  };

  const handleDateClick = (dateClickInfo: any) => {
    // Handle date click for creating new events
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'task': return <Flag className="h-4 w-4" />;
      case 'meeting': return <Users className="h-4 w-4" />;
      case 'sprint': return <Target className="h-4 w-4" />;
      case 'deadline': return <Clock className="h-4 w-4" />;
      case 'leave': return <Calendar className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'task': return 'Tâche';
      case 'meeting': return 'Réunion';
      case 'sprint': return 'Sprint';
      case 'deadline': return 'Échéance';
      case 'leave': return 'Congé';
      default: return 'Événement';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <Badge className="bg-red-100 text-red-800">🔴 Élevée</Badge>;
      case 'MEDIUM':
        return <Badge className="bg-yellow-100 text-yellow-800">🟡 Moyenne</Badge>;
      case 'LOW':
        return <Badge className="bg-green-100 text-green-800">🟢 Basse</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendrier des projets
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={view === 'dayGridMonth' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('dayGridMonth')}
              >
                Mois
              </Button>
              <Button
                variant={view === 'timeGridWeek' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('timeGridWeek')}
              >
                Semaine
              </Button>
              <Button
                variant={view === 'timeGridDay' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('timeGridDay')}
              >
                Jour
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
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            initialView={view}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            events={events}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            height="auto"
            locale="fr"
            buttonText={{
              today: "Aujourd'hui",
              month: 'Mois',
              week: 'Semaine',
              day: 'Jour'
            }}
            allDayText="Toute la journée"
            noEventsText="Aucun événement à afficher"
          />
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getEventTypeIcon(selectedEvent.extendedProps.type)}
                {selectedEvent.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  {getEventTypeLabel(selectedEvent.extendedProps.type)}
                </Badge>
                {selectedEvent.extendedProps.priority && 
                  getPriorityBadge(selectedEvent.extendedProps.priority)
                }
              </div>

              {selectedEvent.extendedProps.description && (
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Description</h4>
                  <p className="text-sm text-gray-600">{selectedEvent.extendedProps.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Début</h4>
                  <p className="text-gray-600">
                    {new Date(selectedEvent.start).toLocaleString('fr-FR')}
                  </p>
                </div>
                {selectedEvent.end && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Fin</h4>
                    <p className="text-gray-600">
                      {new Date(selectedEvent.end).toLocaleString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>

              {selectedEvent.extendedProps.assignee && (
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Assigné à</h4>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {selectedEvent.extendedProps.assignee.name}
                    </span>
                  </div>
                </div>
              )}

              {selectedEvent.extendedProps.location && (
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Lieu</h4>
                  <p className="text-sm text-gray-600">{selectedEvent.extendedProps.location}</p>
                </div>
              )}

              {selectedEvent.extendedProps.attendees && selectedEvent.extendedProps.attendees.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Participants</h4>
                  <div className="space-y-1">
                    {selectedEvent.extendedProps.attendees.map((attendee, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-3 w-3" />
                        {attendee.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
