'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { 
  Calendar, 
  Settings, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  Trash2,
  Plus,
  Clock,
  ArrowLeftRight,
  ArrowDownToLine,
  ArrowUpFromLine
} from 'lucide-react';
import { toast } from 'sonner';

interface CalendarSyncSettings {
  id: string;
  provider: 'GOOGLE' | 'OUTLOOK' | 'APPLE' | 'CALDAV' | 'EXCHANGE';
  providerAccountId: string;
  syncEnabled: boolean;
  syncDirection: 'IMPORT_ONLY' | 'EXPORT_ONLY' | 'BIDIRECTIONAL';
  syncEvents: 'ALL' | 'MEETINGS_ONLY' | 'TASKS_ONLY' | 'CUSTOM';
  lastSyncAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CalendarSyncSettingsResponse {
  settings: CalendarSyncSettings[];
}

const PROVIDER_CONFIGS = {
  GOOGLE: {
    name: 'Google Calendar',
    icon: '📅',
    color: 'bg-blue-500',
    description: 'Sync with your Google Calendar',
  },
  OUTLOOK: {
    name: 'Outlook Calendar',
    icon: '📧',
    color: 'bg-blue-600',
    description: 'Sync with Microsoft Outlook',
  },
  APPLE: {
    name: 'Apple Calendar',
    icon: '🍎',
    color: 'bg-gray-800',
    description: 'Sync with Apple Calendar (iCloud)',
  },
  CALDAV: {
    name: 'CalDAV',
    icon: '🔗',
    color: 'bg-green-600',
    description: 'Sync with CalDAV-compatible calendars',
  },
  EXCHANGE: {
    name: 'Exchange',
    icon: '🏢',
    color: 'bg-indigo-600',
    description: 'Sync with Microsoft Exchange',
  },
};

const SYNC_DIRECTION_ICONS = {
  IMPORT_ONLY: ArrowDownToLine,
  EXPORT_ONLY: ArrowUpFromLine,
  BIDIRECTIONAL: ArrowLeftRight,
};

export default function CalendarSyncSettings() {
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch calendar sync settings
  const { data, isLoading, error } = useQuery<CalendarSyncSettingsResponse>({
    queryKey: ['calendar-sync-settings'],
    queryFn: async () => {
      const response = await fetch('/api/calendar-sync/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch calendar sync settings');
      }
      return response.json();
    },
  });

  // Update sync settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async ({ 
      provider, 
      updates 
    }: { 
      provider: string; 
      updates: Partial<CalendarSyncSettings> 
    }) => {
      const response = await fetch('/api/calendar-sync/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, ...updates }),
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-sync-settings'] });
      toast.success('Calendar sync settings updated successfully');
    },
    onError: () => {
      toast.error('Failed to update calendar sync settings');
    },
  });

  // Disconnect calendar mutation
  const disconnectMutation = useMutation({
    mutationFn: async (provider: string) => {
      const response = await fetch(`/api/calendar-sync/settings?provider=${provider}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to disconnect calendar');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-sync-settings'] });
      toast.success('Calendar disconnected successfully');
    },
    onError: () => {
      toast.error('Failed to disconnect calendar');
    },
  });

  // Manual sync mutation
  const syncMutation = useMutation({
    mutationFn: async ({ provider, direction }: { provider: string; direction: string }) => {
      const response = await fetch('/api/calendar-sync/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, direction }),
      });
      if (!response.ok) throw new Error('Failed to sync calendar');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['calendar-sync-settings'] });
      toast.success(data.message);
    },
    onError: () => {
      toast.error('Failed to sync calendar');
    },
  });

  const handleConnect = async (provider: string) => {
    setIsConnecting(provider);
    try {
      if (provider === 'GOOGLE') {
        const response = await fetch('/api/calendar-sync/oauth/google');
        const data = await response.json();
        if (data.authUrl) {
          window.location.href = data.authUrl;
        }
      } else {
        toast.info(`${PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS].name} integration coming soon!`);
      }
    } catch (error) {
      toast.error('Failed to initiate connection');
    } finally {
      setIsConnecting(null);
    }
  };

  const handleSettingUpdate = (provider: string, updates: Partial<CalendarSyncSettings>) => {
    updateSettingsMutation.mutate({ provider, updates });
  };

  const handleSync = (provider: string, direction: string) => {
    syncMutation.mutate({ provider, direction });
  };

  const connectedProviders = data?.settings || [];
  const availableProviders = Object.keys(PROVIDER_CONFIGS).filter(
    provider => !connectedProviders.find(setting => setting.provider === provider)
  );

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Failed to load calendar sync settings</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Calendar Synchronization</h2>
        <p className="text-muted-foreground">
          Connect your personal calendars to automatically sync work events and stay organized.
        </p>
      </div>

      {/* Connected Calendars */}
      {connectedProviders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Connected Calendars
            </CardTitle>
            <CardDescription>
              Manage your connected calendar accounts and sync preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {connectedProviders.map((setting) => {
              const config = PROVIDER_CONFIGS[setting.provider];
              
              return (
                <div key={setting.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center text-white text-lg`}>
                        {config.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{config.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Account: {setting.providerAccountId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={setting.isActive ? 'default' : 'secondary'}>
                        {setting.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => disconnectMutation.mutate(setting.provider)}
                        disabled={disconnectMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Sync Enabled</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={setting.syncEnabled}
                          onCheckedChange={(checked) =>
                            handleSettingUpdate(setting.provider, { syncEnabled: checked })
                          }
                          disabled={updateSettingsMutation.isPending}
                        />
                        <span className="text-sm">{setting.syncEnabled ? 'On' : 'Off'}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Sync Direction</Label>
                      <Select
                        value={setting.syncDirection}
                        onValueChange={(value) =>
                          handleSettingUpdate(setting.provider, { syncDirection: value as any })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BIDIRECTIONAL">
                            <div className="flex items-center gap-2">
                              <ArrowLeftRight className="h-4 w-4" />
                              Both Ways
                            </div>
                          </SelectItem>
                          <SelectItem value="IMPORT_ONLY">
                            <div className="flex items-center gap-2">
                              <ArrowDownToLine className="h-4 w-4" />
                              Import Only
                            </div>
                          </SelectItem>
                          <SelectItem value="EXPORT_ONLY">
                            <div className="flex items-center gap-2">
                              <ArrowUpFromLine className="h-4 w-4" />
                              Export Only
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Sync Events</Label>
                      <Select
                        value={setting.syncEvents}
                        onValueChange={(value) =>
                          handleSettingUpdate(setting.provider, { syncEvents: value as any })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All Events</SelectItem>
                          <SelectItem value="MEETINGS_ONLY">Meetings Only</SelectItem>
                          <SelectItem value="TASKS_ONLY">Tasks Only</SelectItem>
                          <SelectItem value="CUSTOM">Custom Selection</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        Last sync: {setting.lastSyncAt 
                          ? new Date(setting.lastSyncAt).toLocaleString()
                          : 'Never'
                        }
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSync(setting.provider, setting.syncDirection)}
                      disabled={syncMutation.isPending || !setting.syncEnabled}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Now
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Available Calendars */}
      {availableProviders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Connect Calendar
            </CardTitle>
            <CardDescription>
              Add a new calendar provider to sync your work schedule.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableProviders.map((provider) => {
                const config = PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS];
                return (
                  <div
                    key={provider}
                    className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg ${config.color} flex items-center justify-center text-white text-xl`}>
                        {config.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{config.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {config.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => handleConnect(provider)}
                      disabled={isConnecting === provider}
                    >
                      {isConnecting === provider ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Connect {config.name}
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            How Calendar Sync Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <ArrowLeftRight className="h-4 w-4 text-blue-600" />
                Bidirectional Sync
              </div>
              <p className="text-muted-foreground">
                Work events are exported to your personal calendar, and personal events can be imported to avoid conflicts.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <ArrowDownToLine className="h-4 w-4 text-green-600" />
                Import Only
              </div>
              <p className="text-muted-foreground">
                Only import events from your personal calendar to check availability for work meetings.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <ArrowUpFromLine className="h-4 w-4 text-orange-600" />
                Export Only
              </div>
              <p className="text-muted-foreground">
                Only export work events to your personal calendar to keep track of your work schedule.
              </p>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Privacy & Security</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Your calendar tokens are encrypted and stored securely</li>
              <li>• Only you can access your synced calendar data</li>
              <li>• You can disconnect any calendar at any time</li>
              <li>• Work events are clearly marked when exported to personal calendars</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
