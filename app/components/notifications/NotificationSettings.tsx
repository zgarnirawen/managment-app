'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Mail, Phone, MessageSquare, Settings, Save, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/use-toast';

interface NotificationSettingsProps {
  employeeId: string;
}

interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  taskAssigned: boolean;
  deadlineReminders: boolean;
  meetingReminders: boolean;
  leaveApprovals: boolean;
  systemUpdates: boolean;
  chatMessages: boolean;
  reminderFrequency: 'immediate' | 'hourly' | 'daily';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const defaultPreferences: NotificationPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  taskAssigned: true,
  deadlineReminders: true,
  meetingReminders: true,
  leaveApprovals: true,
  systemUpdates: false,
  chatMessages: true,
  reminderFrequency: 'immediate',
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
};

export default function NotificationSettings({ employeeId }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, [employeeId]);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/employees/${employeeId}/notification-preferences`);
      if (response.ok) {
        const data = await response.json();
        setPreferences({ ...defaultPreferences, ...data });
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load notification preferences",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/employees/${employeeId}/notification-preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Notification preferences saved successfully",
        });
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save notification preferences",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateQuietHours = (key: keyof NotificationPreferences['quietHours'], value: any) => {
    setPreferences(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [key]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Configure how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Delivery Methods */}
        <div>
          <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Delivery Methods
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" />
                <Label htmlFor="email-notifications">Email Notifications</Label>
              </div>
              <Switch
                id="email-notifications"
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) => updatePreference('emailNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-green-500" />
                <Label htmlFor="push-notifications">Push Notifications</Label>
              </div>
              <Switch
                id="push-notifications"
                checked={preferences.pushNotifications}
                onCheckedChange={(checked) => updatePreference('pushNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-purple-500" />
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <Badge variant="secondary" className="text-xs">Premium</Badge>
              </div>
              <Switch
                id="sms-notifications"
                checked={preferences.smsNotifications}
                onCheckedChange={(checked) => updatePreference('smsNotifications', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Notification Types */}
        <div>
          <h4 className="text-sm font-medium mb-4">Notification Types</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="task-assigned">Task Assignments</Label>
              <Switch
                id="task-assigned"
                checked={preferences.taskAssigned}
                onCheckedChange={(checked) => updatePreference('taskAssigned', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="deadline-reminders">Deadline Reminders</Label>
              <Switch
                id="deadline-reminders"
                checked={preferences.deadlineReminders}
                onCheckedChange={(checked) => updatePreference('deadlineReminders', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="meeting-reminders">Meeting Reminders</Label>
              <Switch
                id="meeting-reminders"
                checked={preferences.meetingReminders}
                onCheckedChange={(checked) => updatePreference('meetingReminders', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="leave-approvals">Leave Request Updates</Label>
              <Switch
                id="leave-approvals"
                checked={preferences.leaveApprovals}
                onCheckedChange={(checked) => updatePreference('leaveApprovals', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="chat-messages">
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Chat Messages
                </span>
              </Label>
              <Switch
                id="chat-messages"
                checked={preferences.chatMessages}
                onCheckedChange={(checked) => updatePreference('chatMessages', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="system-updates">System Updates</Label>
              <Switch
                id="system-updates"
                checked={preferences.systemUpdates}
                onCheckedChange={(checked) => updatePreference('systemUpdates', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Reminder Frequency */}
        <div>
          <h4 className="text-sm font-medium mb-4">Reminder Frequency</h4>
          <div className="space-y-2">
            {['immediate', 'hourly', 'daily'].map((frequency) => (
              <div key={frequency} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`frequency-${frequency}`}
                  name="frequency"
                  value={frequency}
                  checked={preferences.reminderFrequency === frequency}
                  onChange={(e) => updatePreference('reminderFrequency', e.target.value)}
                  className="text-primary"
                />
                <Label htmlFor={`frequency-${frequency}`} className="capitalize">
                  {frequency}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Quiet Hours */}
        <div>
          <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
            <BellOff className="h-4 w-4" />
            Quiet Hours
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="quiet-hours-enabled">Enable Quiet Hours</Label>
              <Switch
                id="quiet-hours-enabled"
                checked={preferences.quietHours.enabled}
                onCheckedChange={(checked) => updateQuietHours('enabled', checked)}
              />
            </div>
            
            {preferences.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quiet-start">Start Time</Label>
                  <input
                    type="time"
                    id="quiet-start"
                    value={preferences.quietHours.start}
                    onChange={(e) => updateQuietHours('start', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="quiet-end">End Time</Label>
                  <input
                    type="time"
                    id="quiet-end"
                    value={preferences.quietHours.end}
                    onChange={(e) => updateQuietHours('end', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={savePreferences} 
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
