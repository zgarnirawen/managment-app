'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Monitor,
  Clock,
  Mail,
  Calendar,
  Lock,
  Key,
  Save
} from 'lucide-react';

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      displayName: '',
      email: '',
      phone: '',
      department: '',
      jobTitle: ''
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      taskReminders: true,
      meetingReminders: true,
      weeklyReports: true
    },
    preferences: {
      theme: 'dark',
      timeFormat: '24h',
      dateFormat: 'MM/DD/YYYY',
      timezone: 'UTC',
      language: 'en'
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      passwordLastChanged: null
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      loadSettings();
    }
  }, [isLoaded, user]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/user/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(prevSettings => ({
          ...prevSettings,
          ...data,
          profile: {
            ...prevSettings.profile,
            displayName: user?.fullName || '',
            email: user?.emailAddresses[0]?.emailAddress || '',
            ...data.profile
          }
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        // Show success message
        console.log('Settings saved successfully');
      } else {
        console.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-nextgen-dark-blue p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-nextgen-medium-gray rounded mb-6"></div>
            <div className="grid grid-cols-4 gap-6">
              <div className="h-96 bg-nextgen-medium-gray rounded"></div>
              <div className="col-span-3 h-96 bg-nextgen-medium-gray rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nextgen-dark-blue text-nextgen-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-8 h-8 text-nextgen-teal" />
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-nextgen-medium-gray rounded-lg p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-nextgen-teal text-nextgen-dark-gray'
                          : 'text-nextgen-light-gray hover:bg-nextgen-light-gray hover:bg-opacity-10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-nextgen-medium-gray rounded-lg p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white mb-6">Profile Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-nextgen-light-gray mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={settings.profile.displayName}
                        onChange={(e) => updateSetting('profile', 'displayName', e.target.value)}
                        className="w-full px-3 py-2 bg-nextgen-dark-blue border border-nextgen-light-gray rounded-lg text-white focus:ring-2 focus:ring-nextgen-teal focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-nextgen-light-gray mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={settings.profile.email}
                        disabled
                        className="w-full px-3 py-2 bg-nextgen-light-gray bg-opacity-10 border border-nextgen-light-gray rounded-lg text-nextgen-light-gray cursor-not-allowed"
                      />
                      <p className="text-sm text-nextgen-medium-gray mt-1">
                        Email managed by authentication provider
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-nextgen-light-gray mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={settings.profile.phone}
                        onChange={(e) => updateSetting('profile', 'phone', e.target.value)}
                        className="w-full px-3 py-2 bg-nextgen-dark-blue border border-nextgen-light-gray rounded-lg text-white focus:ring-2 focus:ring-nextgen-teal focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-nextgen-light-gray mb-2">
                        Department
                      </label>
                      <select
                        value={settings.profile.department}
                        onChange={(e) => updateSetting('profile', 'department', e.target.value)}
                        className="w-full px-3 py-2 bg-nextgen-dark-blue border border-nextgen-light-gray rounded-lg text-white focus:ring-2 focus:ring-nextgen-teal focus:border-transparent"
                      >
                        <option value="">Select Department</option>
                        <option value="engineering">Engineering</option>
                        <option value="marketing">Marketing</option>
                        <option value="sales">Sales</option>
                        <option value="hr">Human Resources</option>
                        <option value="finance">Finance</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-nextgen-light-gray mb-2">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={settings.profile.jobTitle}
                        onChange={(e) => updateSetting('profile', 'jobTitle', e.target.value)}
                        className="w-full px-3 py-2 bg-nextgen-dark-blue border border-nextgen-light-gray rounded-lg text-white focus:ring-2 focus:ring-nextgen-teal focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    {Object.entries(settings.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between py-3 border-b border-nextgen-light-gray border-opacity-20">
                        <div>
                          <h3 className="text-white font-medium">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </h3>
                          <p className="text-nextgen-light-gray text-sm">
                            {getNotificationDescription(key)}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value as boolean}
                            onChange={(e) => updateSetting('notifications', key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-nextgen-light-gray peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-nextgen-teal peer-focus:ring-opacity-25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nextgen-teal"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white mb-6">Display Preferences</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-nextgen-light-gray mb-2">
                        Theme
                      </label>
                      <select
                        value={settings.preferences.theme}
                        onChange={(e) => updateSetting('preferences', 'theme', e.target.value)}
                        className="w-full px-3 py-2 bg-nextgen-dark-blue border border-nextgen-light-gray rounded-lg text-white focus:ring-2 focus:ring-nextgen-teal focus:border-transparent"
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-nextgen-light-gray mb-2">
                        Time Format
                      </label>
                      <select
                        value={settings.preferences.timeFormat}
                        onChange={(e) => updateSetting('preferences', 'timeFormat', e.target.value)}
                        className="w-full px-3 py-2 bg-nextgen-dark-blue border border-nextgen-light-gray rounded-lg text-white focus:ring-2 focus:ring-nextgen-teal focus:border-transparent"
                      >
                        <option value="12h">12 Hour</option>
                        <option value="24h">24 Hour</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-nextgen-light-gray mb-2">
                        Date Format
                      </label>
                      <select
                        value={settings.preferences.dateFormat}
                        onChange={(e) => updateSetting('preferences', 'dateFormat', e.target.value)}
                        className="w-full px-3 py-2 bg-nextgen-dark-blue border border-nextgen-light-gray rounded-lg text-white focus:ring-2 focus:ring-nextgen-teal focus:border-transparent"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-nextgen-light-gray mb-2">
                        Timezone
                      </label>
                      <select
                        value={settings.preferences.timezone}
                        onChange={(e) => updateSetting('preferences', 'timezone', e.target.value)}
                        className="w-full px-3 py-2 bg-nextgen-dark-blue border border-nextgen-light-gray rounded-lg text-white focus:ring-2 focus:ring-nextgen-teal focus:border-transparent"
                      >
                        <option value="UTC">UTC</option>
                        <option value="EST">EST</option>
                        <option value="PST">PST</option>
                        <option value="CET">CET</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white mb-6">Security Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-nextgen-dark-blue rounded-lg">
                      <div className="flex items-center gap-3">
                        <Key className="w-6 h-6 text-nextgen-teal" />
                        <div>
                          <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                          <p className="text-nextgen-light-gray text-sm">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                      </div>
                      <a
                        href="/two-factor-setup"
                        className="px-4 py-2 bg-nextgen-teal text-nextgen-dark-gray rounded-lg hover:bg-cyan-400 transition-colors"
                      >
                        Configure
                      </a>
                    </div>
                    
                    <div className="p-4 bg-nextgen-dark-blue rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <Lock className="w-6 h-6 text-nextgen-teal" />
                        <h3 className="text-white font-medium">Session Settings</h3>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-nextgen-light-gray mb-2">
                          Session Timeout (minutes)
                        </label>
                        <select
                          value={settings.security.sessionTimeout}
                          onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-nextgen-medium-gray border border-nextgen-light-gray rounded-lg text-white focus:ring-2 focus:ring-nextgen-teal focus:border-transparent"
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={120}>2 hours</option>
                          <option value={0}>Never</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-6 border-t border-nextgen-light-gray border-opacity-20 mt-8">
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-nextgen-teal text-nextgen-dark-gray rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-nextgen-dark-gray"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getNotificationDescription(key: string): string {
  const descriptions: Record<string, string> = {
    emailNotifications: 'Receive notifications via email',
    pushNotifications: 'Show desktop and mobile notifications',
    smsNotifications: 'Receive SMS notifications for urgent items',
    taskReminders: 'Get reminded about upcoming task deadlines',
    meetingReminders: 'Receive meeting reminders before scheduled events',
    weeklyReports: 'Get weekly summary reports of your activity'
  };
  
  return descriptions[key] || 'Configure this notification setting';
}
