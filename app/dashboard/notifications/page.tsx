'use client';

import { useState } from 'react';
import { Bell, Settings, Home, ArrowLeft, Filter, Search, BarChart3 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import NotificationCenter from '../../components/notifications/NotificationCenter';
import NotificationSettings from '../../components/notifications/NotificationSettings';
import HomeNavigation from '../../components/navigation/HomeNavigation';
import { useUser } from '@clerk/nextjs';

export default function NotificationDashboard() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('notifications');

  // Employee ID from authentication context
  const employeeId = 'cmets2l7w0001mhu87uxes32j';

  const handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <HomeNavigation 
                variant="breadcrumb" 
                className="text-muted-foreground"
              />
              <div className="flex items-center gap-2">
                <Bell className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Notification Center</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleGoHome}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    All Notifications
                  </CardTitle>
                  <CardDescription>
                    View and manage all your notifications in one place
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NotificationCenter 
                    employeeId={employeeId}
                    onNavigateHome={handleGoHome}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <NotificationSettings employeeId={employeeId} />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Notifications
                    </CardTitle>
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">127</div>
                    <p className="text-xs text-muted-foreground">
                      +12% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Unread
                    </CardTitle>
                    <Bell className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">23</div>
                    <p className="text-xs text-muted-foreground">
                      Requires attention
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Response Rate
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">89%</div>
                    <p className="text-xs text-muted-foreground">
                      Above average
                    </p>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2 lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Notification Types Breakdown</CardTitle>
                    <CardDescription>
                      Distribution of notification types over the last 30 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { type: 'Task Assignments', count: 45, color: 'bg-blue-500' },
                        { type: 'Deadline Reminders', count: 32, color: 'bg-orange-500' },
                        { type: 'Meeting Reminders', count: 28, color: 'bg-purple-500' },
                        { type: 'Leave Approvals', count: 15, color: 'bg-green-500' },
                        { type: 'System Updates', count: 7, color: 'bg-gray-500' },
                      ].map((item) => (
                        <div key={item.type} className="flex items-center gap-4">
                          <div className={`w-4 h-4 rounded ${item.color}`}></div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">{item.type}</span>
                              <span className="text-sm text-muted-foreground">{item.count}</span>
                            </div>
                            <div className="mt-1 w-full bg-muted rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${item.color}`}
                                style={{ width: `${(item.count / 127) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
