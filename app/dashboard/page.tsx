'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Crown, Users, Settings, Calendar, Mail, Video } from 'lucide-react';
import UserOnboarding from '../components/UserOnboarding';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [showRoleTransition, setShowRoleTransition] = useState(false);
  const [newFeatures, setNewFeatures] = useState<string[]>([]);

  // Role hierarchy and their available features
  const roleFeatures = {
    intern: ['basic-dashboard', 'tasks', 'time-tracking'],
    employee: ['basic-dashboard', 'tasks', 'time-tracking', 'calendar', 'email', 'projects'],
    manager: ['basic-dashboard', 'tasks', 'time-tracking', 'calendar', 'email', 'projects', 'team-management', 'promotion-system', 'meetings'],
    admin: ['basic-dashboard', 'tasks', 'time-tracking', 'calendar', 'email', 'projects', 'team-management', 'promotion-system', 'meetings', 'user-management', 'system-settings'],
    super_admin: ['basic-dashboard', 'tasks', 'time-tracking', 'calendar', 'email', 'projects', 'team-management', 'promotion-system', 'meetings', 'user-management', 'system-settings', 'full-admin-access']
  };

  const roleRedirects = {
    intern: '/intern',
    employee: '/employee', 
    manager: '/manager',
    admin: '/admin',
    super_admin: '/dashboard/super-admin'
  };

  useEffect(() => {
    if (isLoaded && user) {
      // Check if user has completed role setup
      const roleSetupComplete = user.unsafeMetadata?.roleSetupComplete;
      const userRole = user.unsafeMetadata?.role as string;
      const previousRole = user.unsafeMetadata?.previousRole as string;
      
      if (!roleSetupComplete || !userRole) {
        // User needs to complete onboarding
        setNeedsOnboarding(true);
      } else {
        // Check if user was recently promoted
        if (previousRole && previousRole !== userRole) {
          const prevFeatures = roleFeatures[previousRole as keyof typeof roleFeatures] || [];
          const currentFeatures = roleFeatures[userRole as keyof typeof roleFeatures] || [];
          const unlockedFeatures = currentFeatures.filter(feature => !prevFeatures.includes(feature));
          
          if (unlockedFeatures.length > 0) {
            setNewFeatures(unlockedFeatures);
            setShowRoleTransition(true);
            
            // Clear the previousRole flag after showing transition
            setTimeout(() => {
              user.update({
                unsafeMetadata: {
                  ...user.unsafeMetadata,
                  previousRole: null
                }
              });
            }, 5000);
          }
        }
        
        // Redirect to appropriate dashboard
        setRedirecting(true);
        const redirectPath = roleRedirects[userRole as keyof typeof roleRedirects] || '/employee';
        router.push(redirectPath);
      }
    }
  }, [isLoaded, user, router]);

  // Show onboarding if user needs role selection
  if (needsOnboarding) {
    return <UserOnboarding />;
  }

  // Show role transition notification
  if (showRoleTransition) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-blue-100">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Crown className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🎉 Congratulations!
            </h2>
            
            <p className="text-gray-600 mb-6">
              You've been promoted to <span className="font-semibold text-blue-600">{String(user?.unsafeMetadata?.role)}</span>!
              You now have access to new features:
            </p>
            
            <div className="space-y-3 mb-6">
              {newFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  {feature.includes('calendar') && <Calendar className="w-5 h-5 text-blue-600" />}
                  {feature.includes('email') && <Mail className="w-5 h-5 text-blue-600" />}
                  {feature.includes('meeting') && <Video className="w-5 h-5 text-blue-600" />}
                  {feature.includes('management') && <Users className="w-5 h-5 text-blue-600" />}
                  {feature.includes('settings') && <Settings className="w-5 h-5 text-blue-600" />}
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {feature.replace('-', ' ')}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
              <span className="text-gray-600">Redirecting to your new dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show onboarding if user needs role selection
  if (needsOnboarding) {
    return <UserOnboarding />;
  }

  if (!isLoaded || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {redirecting ? 'Redirecting to your dashboard...' : 'Loading...'}
          </h2>
          <p className="text-gray-600">
            {redirecting 
              ? 'Please wait while we determine your role and redirect you.'
              : 'Please wait while we load your information.'
            }
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600">
            Please sign in to access your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return null;
}