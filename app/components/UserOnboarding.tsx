'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { GraduationCap, Briefcase, CheckCircle, AlertCircle } from 'lucide-react';

export default function UserOnboarding() {
  const { user } = useUser();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const roleOptions = [
    {
      value: 'intern',
      title: 'Intern',
      description: 'Perfect for students or new graduates looking to gain experience',
      icon: GraduationCap,
      features: [
        'Basic time tracking',
        'Task viewing and completion',
        'Learning resources access',
        'Mentorship program participation'
      ]
    },
    {
      value: 'employee',
      title: 'Employee',
      description: 'Ideal for professionals joining with existing experience',
      icon: Briefcase,
      features: [
        'Full time tracking capabilities',
        'Task management and collaboration',
        'Leave request system',
        'Team project participation'
      ]
    }
  ];

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      setError('Please select a role to continue');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Update user metadata with selected role
      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          role: selectedRole,
          roleSetupComplete: true,
          onboardingDate: new Date().toISOString()
        }
      });

      // Create employee record in database
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: user?.fullName || user?.firstName + ' ' + user?.lastName || 'New User',
          email: user?.primaryEmailAddress?.emailAddress,
          role: selectedRole,
          clerkUserId: user?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create employee profile');
      }

      // Redirect to appropriate dashboard
      router.push(`/${selectedRole}`);

    } catch (err) {
      console.error('Onboarding error:', err);
      setError('Failed to complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg">
        <div className="text-center p-6 border-b">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to the Team! 🎉
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Let's set up your role to get you started with the right tools and permissions
          </p>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Choose your starting role:</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {roleOptions.map((role) => {
                const Icon = role.icon;
                return (
                  <div key={role.value} className="relative">
                    <input
                      type="radio"
                      value={role.value}
                      id={role.value}
                      name="role"
                      checked={selectedRole === role.value}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="sr-only peer"
                    />
                    <label
                      htmlFor={role.value}
                      className="flex flex-col p-6 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Icon className="w-8 h-8 text-blue-600" />
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{role.title}</h4>
                          <p className="text-sm text-gray-600">{role.description}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h5 className="font-medium text-gray-900">What you'll get:</h5>
                        <ul className="space-y-1">
                          {role.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="text-blue-600">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="text-sm text-blue-800">
                <strong>Don't worry!</strong> Your role can be updated later by managers or administrators as you grow and take on new responsibilities within the organization.
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center p-6 border-t">
          <button
            onClick={handleRoleSelection}
            disabled={!selectedRole || isSubmitting}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Setting up your account...' : 'Get Started'}
          </button>
        </div>
      </div>
    </div>
  );
}
