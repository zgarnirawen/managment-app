'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Calendar, Clock, User, MapPin, FileText, Flag } from 'lucide-react';
import { format } from 'date-fns';

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

interface EventDetailsModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEventUpdated: () => void;
}

export default function EventDetailsModal({
  event,
  isOpen,
  onClose,
  onEventUpdated
}: EventDetailsModalProps) {
  if (!event) return null;

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'TASK': return 'bg-blue-100 text-blue-800';
      case 'SPRINT': return 'bg-orange-100 text-orange-800';
      case 'MEETING': return 'bg-green-100 text-green-800';
      case 'LEAVE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const renderTaskDetails = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Flag className="h-4 w-4" />
        <span className="font-medium">Priority:</span>
        <Badge className={getPriorityColor(event.extendedProps.priority)}>
          {event.extendedProps.priority}
        </Badge>
      </div>
      
      {event.extendedProps.status && (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="font-medium">Status:</span>
          <Badge variant="outline">{event.extendedProps.status}</Badge>
        </div>
      )}
      
      {event.extendedProps.assignedTo && (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="font-medium">Assigned to:</span>
          <span>{event.extendedProps.assignedTo.name}</span>
        </div>
      )}
      
      {event.extendedProps.project && (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="font-medium">Project:</span>
          <span>{event.extendedProps.project.name}</span>
        </div>
      )}
    </div>
  );

  const renderSprintDetails = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        <span className="font-medium">Tasks:</span>
        <Badge variant="outline">{event.extendedProps.tasksCount} tasks</Badge>
      </div>
      
      {event.extendedProps.tasks && event.extendedProps.tasks.length > 0 && (
        <div>
          <p className="font-medium mb-2">Sprint Tasks:</p>
          <div className="space-y-1">
            {event.extendedProps.tasks.map((task: any) => (
              <div key={task.id} className="text-sm bg-gray-50 p-2 rounded">
                {task.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderMeetingDetails = () => (
    <div className="space-y-4">
      {event.extendedProps.location && (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span className="font-medium">Location:</span>
          <span>{event.extendedProps.location}</span>
        </div>
      )}
      
      {event.extendedProps.organizer && (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="font-medium">Organizer:</span>
          <span>{event.extendedProps.organizer.name}</span>
        </div>
      )}
      
      {event.extendedProps.attendees && event.extendedProps.attendees.length > 0 && (
        <div>
          <p className="font-medium mb-2">Attendees:</p>
          <div className="flex flex-wrap gap-1">
            {event.extendedProps.attendees.map((attendee: any) => (
              <Badge key={attendee.id} variant="outline">
                {attendee.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {event.extendedProps.meetingType && (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="font-medium">Type:</span>
          <Badge variant="outline">{event.extendedProps.meetingType}</Badge>
        </div>
      )}
    </div>
  );

  const renderLeaveDetails = () => (
    <div className="space-y-4">
      {event.extendedProps.employee && (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="font-medium">Employee:</span>
          <span>{event.extendedProps.employee.name}</span>
        </div>
      )}
      
      {event.extendedProps.reason && (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="font-medium">Reason:</span>
          <span>{event.extendedProps.reason}</span>
        </div>
      )}
    </div>
  );

  const renderEventSpecificDetails = () => {
    switch (event.type) {
      case 'TASK': return renderTaskDetails();
      case 'SPRINT': return renderSprintDetails();
      case 'MEETING': return renderMeetingDetails();
      case 'LEAVE': return renderLeaveDetails();
      default: return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Event Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Event Header */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold">{event.title}</h3>
                <Badge className={getEventTypeColor(event.type)}>
                  {event.type}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {formatDateTime(event.start)}
                    {event.end && event.end !== event.start && (
                      <> - {formatDateTime(event.end)}</>
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {event.description && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Event-specific details */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Details</h4>
              {renderEventSpecificDetails()}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {(event.type === 'TASK' || event.type === 'MEETING') && (
              <Button>
                Edit {event.type.toLowerCase()}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
