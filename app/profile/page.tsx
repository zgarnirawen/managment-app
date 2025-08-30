'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '../components/ui/button';
import LoadingSpinner from '../components/LoadingSpinner';
import Image from 'next/image';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  position?: string;
  hireDate?: string;
  manager?: string;
  phone?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetchProfile();
    }
  }, [isLoaded, user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedData: Partial<UserProfile>) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      
      if (response.ok) {
        fetchProfile();
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'text-red-400 bg-red-400/20';
      case 'manager': return 'text-purple-400 bg-purple-400/20';
      case 'employee': return 'text-blue-400 bg-blue-400/20';
      case 'intern': return 'text-orange-400 bg-orange-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isLoaded || loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-nextgen-dark-gray text-nextgen-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-nextgen-teal mb-2">
            👤 My Profile
          </h1>
          <p className="text-nextgen-light-gray">
            View and manage your personal information and account settings
          </p>
        </div>

        {profile && (
          <div className="space-y-6">
            {/* Profile Header Card */}
            <div className="bg-nextgen-medium-gray rounded-lg p-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  {user?.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt="Profile"
                      width={100}
                      height={100}
                      className="rounded-full border-4 border-nextgen-teal"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-nextgen-dark-blue rounded-full flex items-center justify-center text-3xl font-bold text-nextgen-teal">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-nextgen-white mb-2">
                    {profile.name}
                  </h2>
                  <div className="flex items-center gap-4 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRoleColor(profile.role)}`}>
                      {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                    </span>
                    {profile.department && (
                      <span className="text-nextgen-light-gray">
                        📁 {profile.department}
                      </span>
                    )}
                  </div>
                  <p className="text-nextgen-light-gray">{profile.email}</p>
                </div>
                <Button
                  onClick={() => setEditing(!editing)}
                  className="bg-nextgen-teal hover:bg-nextgen-teal-hover"
                >
                  {editing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="bg-nextgen-medium-gray rounded-lg p-6">
              <h3 className="text-xl font-semibold text-nextgen-teal mb-4">
                📋 Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-nextgen-light-gray mb-1">Position</label>
                  <div className="text-nextgen-white">
                    {profile.position || 'Not specified'}
                  </div>
                </div>
                <div>
                  <label className="block text-nextgen-light-gray mb-1">Hire Date</label>
                  <div className="text-nextgen-white">
                    {profile.hireDate ? formatDate(profile.hireDate) : 'Not specified'}
                  </div>
                </div>
                <div>
                  <label className="block text-nextgen-light-gray mb-1">Manager</label>
                  <div className="text-nextgen-white">
                    {profile.manager || 'Not assigned'}
                  </div>
                </div>
                <div>
                  <label className="block text-nextgen-light-gray mb-1">Phone</label>
                  <div className="text-nextgen-white">
                    {profile.phone || 'Not provided'}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-nextgen-medium-gray rounded-lg p-6">
              <h3 className="text-xl font-semibold text-nextgen-teal mb-4">
                📞 Contact Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-nextgen-light-gray mb-1">Address</label>
                  <div className="text-nextgen-white">
                    {profile.address || 'Not provided'}
                  </div>
                </div>
                {profile.emergencyContact && (
                  <div>
                    <label className="block text-nextgen-light-gray mb-2">Emergency Contact</label>
                    <div className="bg-nextgen-dark-blue rounded p-4">
                      <div className="text-nextgen-white font-semibold">
                        {profile.emergencyContact.name}
                      </div>
                      <div className="text-nextgen-light-gray">
                        {profile.emergencyContact.phone} • {profile.emergencyContact.relationship}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-nextgen-medium-gray rounded-lg p-6">
              <h3 className="text-xl font-semibold text-nextgen-teal mb-4">
                ⚙️ Account Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-nextgen-dark-blue rounded">
                  <div>
                    <div className="text-nextgen-white font-semibold">Two-Factor Authentication</div>
                    <div className="text-nextgen-light-gray text-sm">
                      Secure your account with 2FA
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-nextgen-dark-blue rounded">
                  <div>
                    <div className="text-nextgen-white font-semibold">Notification Preferences</div>
                    <div className="text-nextgen-light-gray text-sm">
                      Manage how you receive notifications
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-nextgen-dark-blue rounded">
                  <div>
                    <div className="text-nextgen-white font-semibold">Privacy Settings</div>
                    <div className="text-nextgen-light-gray text-sm">
                      Control your privacy preferences
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4">
              <Button className="bg-nextgen-teal hover:bg-nextgen-teal-hover">
                📄 Download Profile Report
              </Button>
              <Button variant="outline">
                🔄 Sync with HR System
              </Button>
              <Button variant="outline">
                📧 Update Email Preferences
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
