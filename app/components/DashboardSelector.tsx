'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  UserRole, 
  getDashboardRoute, 
  getRoleDisplay, 
  hasFeatureAccess,
  getAllFeatures,
  isFirstUser,
  getAvailableSignupRoles
} from '../../lib/roles';
import { 
  Users, 
  Settings, 
  BarChart3, 
  Calendar, 
  MessageSquare, 
  DollarSign,
  Trophy,
  GraduationCap,
  Shield,
  Crown,
  Building,
  Target,
  Clock,
  VideoIcon
} from 'lucide-react';

interface DashboardSelectorProps {
  onRoleSelected?: (role: UserRole) => void;
  showRoleSelection?: boolean;
}

export default function DashboardSelector({ 
  onRoleSelected, 
  showRoleSelection = false 
}: DashboardSelectorProps) {
  const { user } = useUser();
  const router = useRouter();
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirst, setIsFirst] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Check if this is the first user
        const firstUser = await isFirstUser();
        setIsFirst(firstUser);

        if (firstUser) {
          // First user should be super admin
          await updateUserRole('super_admin');
          setCurrentRole('super_admin');
          router.push(getDashboardRoute('super_admin'));
          return;
        }

        // Get user role from metadata
        const role = user.unsafeMetadata?.role as UserRole || 
                    user.publicMetadata?.role as UserRole;

        if (role && ['intern', 'employee', 'manager', 'admin', 'super_admin'].includes(role)) {
          setCurrentRole(role);
          if (!showRoleSelection) {
            router.push(getDashboardRoute(role));
          }
        } else if (!showRoleSelection) {
          // User needs to select a role
          router.push('/setup/role-selection');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [user, router, showRoleSelection]);

  const updateUserRole = async (role: UserRole) => {
    try {
      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          role: role,
          roleSetupComplete: true
        }
      });
      
      setCurrentRole(role);
      if (onRoleSelected) {
        onRoleSelected(role);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleRoleSelection = async (role: UserRole) => {
    setSelectedRole(role);
    await updateUserRole(role);
    router.push(getDashboardRoute(role));
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'team_management': return <Users className="w-4 h-4" />;
      case 'admin_dashboard': return <Shield className="w-4 h-4" />;
      case 'super_admin_dashboard': return <Crown className="w-4 h-4" />;
      case 'payroll_view': return <DollarSign className="w-4 h-4" />;
      case 'project_participation': return <Target className="w-4 h-4" />;
      case 'training_portal': return <GraduationCap className="w-4 h-4" />;
      case 'team_statistics': return <BarChart3 className="w-4 h-4" />;
      case 'personal_calendar': return <Calendar className="w-4 h-4" />;
      case 'team_collaboration': return <MessageSquare className="w-4 h-4" />;
      case 'video_conferences': return <VideoIcon className="w-4 h-4" />;
      case 'timesheet_submission': return <Clock className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nextgen-primary"></div>
      </div>
    );
  }

  if (isFirst) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-red-500" />
              Welcome Super Admin!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                You are the first user and have been automatically assigned Super Admin privileges.
                You now have full access to all system features and can manage other users.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showRoleSelection && !currentRole) {
    const availableRoles = getAvailableSignupRoles();

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Choose Your Role</h1>
            <p className="text-gray-600">
              Select your role to get started. You can be promoted later by managers or admins.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {availableRoles.map((roleOption) => {
              const roleDisplay = getRoleDisplay(roleOption.role);
              const features = getAllFeatures(roleOption.role);

              return (
                <Card 
                  key={roleOption.role}
                  className={`cursor-pointer transition-all hover:shadow-lg border-2 ${ 
                    selectedRole === roleOption.role ? 'border-nextgen-primary' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedRole(roleOption.role)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{roleOption.label}</span>
                      <Badge className={roleDisplay.color}>
                        Level {roleDisplay.level}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{roleOption.description}</p>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Available Features:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {features.slice(0, 6).map((feature) => (
                          <div key={feature} className="flex items-center gap-2 text-sm">
                            {getFeatureIcon(feature)}
                            <span className="capitalize">{feature.replace(/_/g, ' ')}</span>
                          </div>
                        ))}
                      </div>
                      {features.length > 6 && (
                        <p className="text-xs text-gray-500">
                          +{features.length - 6} more features
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedRole && (
            <div className="text-center mt-8">
              <Button 
                onClick={() => handleRoleSelection(selectedRole)}
                size="lg"
                className="px-8"
              >
                Continue as {getRoleDisplay(selectedRole).name}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentRole) {
    const roleDisplay = getRoleDisplay(currentRole);
    const features = getAllFeatures(currentRole);

    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Dashboard</span>
              <Badge className={roleDisplay.color}>
                {roleDisplay.name}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {features.slice(0, 9).map((feature) => (
                <div key={feature} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  {getFeatureIcon(feature)}
                  <span className="text-sm capitalize">{feature.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={() => router.push(getDashboardRoute(currentRole))}
              className="w-full"
              size="lg"
            >
              Go to {roleDisplay.name} Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
