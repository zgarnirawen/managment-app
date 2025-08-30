'use client';

import { useState, useEffect } from 'react';
import { Clock, Play, Pause, Square, Coffee, MapPin, Wifi, WifiOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/use-toast';
import { formatDuration, formatTime } from '../../lib/time-utils';

interface TimeClockProps {
  employeeId: string;
  employeeName: string;
}

type TimeEntryType = 'WORK' | 'BREAK';
type TimeEntryStatus = 'ACTIVE' | 'COMPLETED';

interface ActiveSession {
  id: string;
  type: TimeEntryType;
  startTime: Date;
  location?: string;
  isOnline: boolean;
}

export default function TimeClock({ employeeId, employeeName }: TimeClockProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [totalWorkToday, setTotalWorkToday] = useState(0);
  const [totalBreakToday, setTotalBreakToday] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<string>('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocation('Location not available');
        }
      );
    }
  }, []);

  // Load today's data and active session
  useEffect(() => {
    loadTodayData();
    loadActiveSession();
  }, [employeeId]);

  const loadTodayData = async () => {
    try {
      const response = await fetch(`/api/time-entries/today?employeeId=${employeeId}`);
      if (response.ok) {
        const data = await response.json();
        setTotalWorkToday(data.totalWork || 0);
        setTotalBreakToday(data.totalBreak || 0);
      }
    } catch (error) {
      console.error('Failed to load today data:', error);
    }
  };

  const loadActiveSession = async () => {
    try {
      const response = await fetch(`/api/time-entries/active?employeeId=${employeeId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.activeSession) {
          setActiveSession({
            ...data.activeSession,
            startTime: new Date(data.activeSession.startTime)
          });
        }
      }
    } catch (error) {
      console.error('Failed to load active session:', error);
    }
  };

  const startSession = async (type: TimeEntryType) => {
    if (!isOnline) {
      toast({
        title: "Offline Mode",
        description: "You're currently offline. Please check your connection.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/time-entries/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId,
          type,
          location,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setActiveSession({
          id: data.id,
          type,
          startTime: new Date(data.startTime),
          location,
          isOnline: true,
        });

        toast({
          title: `${type === 'WORK' ? 'Work' : 'Break'} Started`,
          description: `Started at ${formatTime(new Date())}`,
        });
      } else {
        throw new Error('Failed to start session');
      }
    } catch (error) {
      console.error('Failed to start session:', error);
      toast({
        title: "Error",
        description: "Failed to start session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopSession = async () => {
    if (!activeSession) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/time-entries/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: activeSession.id,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const duration = data.duration;

        if (activeSession.type === 'WORK') {
          setTotalWorkToday(prev => prev + duration);
        } else {
          setTotalBreakToday(prev => prev + duration);
        }

        setActiveSession(null);

        toast({
          title: `${activeSession.type === 'WORK' ? 'Work' : 'Break'} Completed`,
          description: `Duration: ${formatDuration(duration)}`,
        });
      } else {
        throw new Error('Failed to stop session');
      }
    } catch (error) {
      console.error('Failed to stop session:', error);
      toast({
        title: "Error",
        description: "Failed to stop session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSessionDuration = () => {
    if (!activeSession) return 0;
    return Math.floor((currentTime.getTime() - activeSession.startTime.getTime()) / 1000);
  };

  const getStatusColor = () => {
    if (!activeSession) return 'bg-gray-500';
    return activeSession.type === 'WORK' ? 'bg-green-500' : 'bg-orange-500';
  };

  const getStatusText = () => {
    if (!activeSession) return 'Offline';
    return activeSession.type === 'WORK' ? 'Working' : 'On Break';
  };

  return (
    <div className="space-y-6">
      {/* Current Time & Status */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="h-6 w-6" />
            <CardTitle>Time Clock</CardTitle>
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
          </div>
          <CardDescription>
            Welcome back, {employeeName}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {/* Current Time */}
          <div className="text-4xl font-mono font-bold">
            {formatTime(currentTime)}
          </div>
          
          {/* Current Status */}
          <div className="flex items-center justify-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
            <Badge variant={activeSession ? 'default' : 'secondary'} className="text-sm">
              {getStatusText()}
            </Badge>
          </div>

          {/* Active Session Timer */}
          {activeSession && (
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">
                Current {activeSession.type.toLowerCase()} session
              </div>
              <div className="text-2xl font-mono font-bold">
                {formatDuration(getSessionDuration())}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Started at {formatTime(activeSession.startTime)}
              </div>
            </div>
          )}

          {/* Location Info */}
          {location && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {!activeSession ? (
              <>
                <Button
                  onClick={() => startSession('WORK')}
                  disabled={isLoading}
                  className="h-16 text-lg"
                  size="lg"
                >
                  <Play className="h-6 w-6 mr-2" />
                  Start Work
                </Button>
                <Button
                  onClick={() => startSession('BREAK')}
                  disabled={isLoading}
                  variant="outline"
                  className="h-16 text-lg"
                  size="lg"
                >
                  <Coffee className="h-6 w-6 mr-2" />
                  Start Break
                </Button>
                <div className="flex items-center justify-center text-muted-foreground">
                  Ready to clock in
                </div>
              </>
            ) : (
              <>
                <Button
                  onClick={stopSession}
                  disabled={isLoading}
                  variant="destructive"
                  className="h-16 text-lg"
                  size="lg"
                >
                  <Square className="h-6 w-6 mr-2" />
                  Stop {activeSession.type === 'WORK' ? 'Work' : 'Break'}
                </Button>
                {activeSession.type === 'WORK' && (
                  <Button
                    onClick={() => {
                      stopSession();
                      setTimeout(() => startSession('BREAK'), 1000);
                    }}
                    disabled={isLoading}
                    variant="outline"
                    className="h-16 text-lg"
                    size="lg"
                  >
                    <Pause className="h-6 w-6 mr-2" />
                    Take Break
                  </Button>
                )}
                <div className="flex items-center justify-center text-center">
                  <div className="text-sm text-muted-foreground">
                    {activeSession.type === 'WORK' ? 'Currently working' : 'On break'}
                    <br />
                    <span className="text-xs">Click stop to end session</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Today's Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today's Summary</CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                {formatDuration(totalWorkToday + (activeSession?.type === 'WORK' ? getSessionDuration() : 0))}
              </div>
              <div className="text-sm text-green-600 dark:text-green-500">Work Time</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                {formatDuration(totalBreakToday + (activeSession?.type === 'BREAK' ? getSessionDuration() : 0))}
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-500">Break Time</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
