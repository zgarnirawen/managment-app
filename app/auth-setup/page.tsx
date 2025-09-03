'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface SetupState {
  isFirstUser: boolean;
  userCount: number;
  loading: boolean;
  isRegistered: boolean;
}

export default function AuthSetup() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [setupState, setSetupState] = useState<SetupState>({
    isFirstUser: false,
    userCount: 0,
    loading: true,
    isRegistered: false
  });
  const [selectedRole, setSelectedRole] = useState<'intern' | 'employee'>('employee');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      // Force metadata sync on page load
      forceMetadataSync();
      checkSetupStatus();
    }
  }, [isLoaded, user]);

  const forceMetadataSync = async () => {
    try {
      console.log('🔄 Forcing metadata sync...');
      const response = await fetch('/api/auth/check-user-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Metadata sync response:', data);
        
        // Wait a moment for Clerk to process the update
        setTimeout(() => {
          // Refresh the user session
          if (user?.reload) {
            user.reload();
          }
        }, 200); // Reduced from 500ms to 200ms
      }
    } catch (error) {
      console.error('❌ Metadata sync failed:', error);
    }
  };

  const checkSetupStatus = async () => {
    try {
      // Check if user is already registered in metadata
      const userRole = user?.unsafeMetadata?.role || user?.publicMetadata?.role;
      if (userRole) {
        setSetupState(prev => ({ ...prev, isRegistered: true, loading: false }));
        window.location.href = '/dashboard';
        return;
      }

      // Check if user exists in database and sync metadata
      const userCheckResponse = await fetch('/api/auth/check-user-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (userCheckResponse.ok) {
        const userData = await userCheckResponse.json();
        if (userData.exists && userData.role) {
          // User exists in DB but metadata not synced, wait for sync
          console.log('User exists in DB, waiting for metadata sync...');
          
          // Poll for metadata updates instead of just waiting
          let attempts = 0;
          const maxAttempts = 3; // Further reduced from 5
          
          const pollForMetadata = async () => {
            attempts++;
            console.log(`Polling for metadata update (attempt ${attempts}/${maxAttempts})`);
            
            try {
              // Refresh the session token to get updated metadata
              await getToken();
              
              // Re-fetch user data to get latest metadata
              if (user?.reload) {
                await user.reload();
              }
              
              const updatedRole = user?.unsafeMetadata?.role || user?.publicMetadata?.role;
              const updatedSetupComplete = user?.unsafeMetadata?.roleSetupComplete || user?.publicMetadata?.roleSetupComplete;
              
              if (updatedRole && updatedSetupComplete) {
                console.log('✅ Metadata synced successfully:', updatedRole);
                window.location.href = '/dashboard';
                return;
              }
              
              if (attempts < maxAttempts) {
                setTimeout(pollForMetadata, 200); // Reduced from 500ms to 200ms
              } else {
                console.log('❌ Metadata sync timeout, forcing page reload');
                // Force a page reload to get updated metadata
                window.location.reload();
              }
            } catch (error) {
              console.error('Error during metadata polling:', error);
              if (attempts < maxAttempts) {
                setTimeout(pollForMetadata, 200);
              } else {
                window.location.reload();
              }
            }
          };
          
          // Start polling immediately without delay
          pollForMetadata();
          return;
        }
      }

      // Check if this is the first user
      const response = await fetch('/api/auth/first-user-setup');
      const data = await response.json();
      
      setSetupState({
        isFirstUser: data.isFirstUser,
        userCount: data.userCount || 0,
        loading: false,
        isRegistered: false
      });
    } catch (error) {
      console.error('Failed to check setup status:', error);
      setSetupState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleFirstUserSetup = async () => {
    if (!user) return;
    
    setProcessing(true);
    try {
      const response = await fetch('/api/auth/first-user-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ First user setup complete');
        
        // Poll for metadata updates with faster intervals
        let attempts = 0;
        const maxAttempts = 3; // Reduced from 10
        
        const pollForMetadata = async () => {
          attempts++;
          console.log(`Polling for first user metadata (attempt ${attempts}/${maxAttempts})`);
          
          try {
            // Refresh the session token to get updated metadata
            await getToken();
            
            // Re-fetch user data to get latest metadata
            if (user?.reload) {
              await user.reload();
            }
            
            const updatedRole = user?.unsafeMetadata?.role || user?.publicMetadata?.role;
            const updatedSetupComplete = user?.unsafeMetadata?.roleSetupComplete || user?.publicMetadata?.roleSetupComplete;
            
            if (updatedRole && updatedSetupComplete) {
              console.log('✅ First user metadata synced successfully:', updatedRole);
              window.location.href = '/dashboard';
              return;
            }
            
            if (attempts < maxAttempts) {
              setTimeout(pollForMetadata, 200); // Reduced from 1000ms to 200ms
            } else {
              console.log('❌ First user metadata sync timeout, forcing page reload');
              window.location.reload();
            }
          } catch (error) {
            console.error('Error during first user metadata polling:', error);
            if (attempts < maxAttempts) {
              setTimeout(pollForMetadata, 200);
            } else {
              window.location.reload();
            }
          }
        };
        
        // Start polling immediately without delay
        pollForMetadata();
      } else {
        throw new Error(result.error || 'First user setup failed');
      }
    } catch (error) {
      console.error('❌ First user setup failed:', error);
      alert(`Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleUserRegistration = async () => {
    if (!user || !selectedRole) return;
    
    setProcessing(true);
    try {
      const response = await fetch('/api/auth/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedRole })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ User registration complete');
        
        // Poll for metadata updates
        let attempts = 0;
        const maxAttempts = 10;
        
        const pollForMetadata = async () => {
          attempts++;
          console.log(`Polling for registration metadata (attempt ${attempts}/${maxAttempts})`);
          
          try {
            // Refresh the session token to get updated metadata
            await getToken();
            
            // Re-fetch user data to get latest metadata
            if (user?.reload) {
              await user.reload();
            }
            
            const updatedRole = user?.unsafeMetadata?.role || user?.publicMetadata?.role;
            const updatedSetupComplete = user?.unsafeMetadata?.roleSetupComplete || user?.publicMetadata?.roleSetupComplete;
            
            if (updatedRole && updatedSetupComplete) {
              console.log('✅ Registration metadata synced successfully:', updatedRole);
              window.location.href = '/dashboard';
              return;
            }
            
            if (attempts < maxAttempts) {
              setTimeout(pollForMetadata, 200); // Reduced from 1000ms to 200ms
            } else {
              console.log('❌ Registration metadata sync timeout, forcing page reload');
              window.location.reload();
            }
          } catch (error) {
            console.error('Error during registration metadata polling:', error);
            if (attempts < maxAttempts) {
              setTimeout(pollForMetadata, 200); // Reduced from 1000ms to 200ms
            } else {
              window.location.reload();
            }
          }
        };
        
        // Start polling immediately without delay
        pollForMetadata();
      } else {
        throw new Error(result.error || 'User registration failed');
      }
    } catch (error) {
      console.error('❌ User registration failed:', error);
      alert(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };

  if (!isLoaded || setupState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Setting up your account</h2>
          <p className="text-gray-600 mb-4">Please wait while we configure your profile...</p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
          <p className="text-sm text-gray-500 mt-4">This should only take a few seconds</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to continue with the setup process.</p>
          <button
            onClick={() => router.push('/sign-in')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (setupState.isRegistered) {
    // Instantly redirect to dashboard without showing any message
    window.location.href = '/dashboard';
    return null; // Don't render anything
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-md mx-auto">
        {setupState.isFirstUser ? (
          // First User Setup (Super Admin)
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👑</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome, First User!
              </h1>
              <p className="text-gray-600">
                You're the first person to access this system. You'll be granted Super Administrator privileges.
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-purple-800 mb-2">Super Administrator Privileges:</h3>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Full system access and control</li>
                <li>• User management and role assignment</li>
                <li>• System configuration and settings</li>
                <li>• All departmental features</li>
              </ul>
            </div>

            <button
              onClick={handleFirstUserSetup}
              disabled={processing}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Setting up...
                </div>
              ) : (
                'Become Super Administrator'
              )}
            </button>
          </div>
        ) : (
          // Regular User Registration
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome to the Team!
              </h1>
              <p className="text-gray-600">
                Choose your starting role. You can be promoted later by administrators.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Current users in system: {setupState.userCount}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedRole === 'employee' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="employee"
                  checked={selectedRole === 'employee'}
                  onChange={(e) => setSelectedRole(e.target.value as 'employee')}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <div className="text-2xl mr-3">👔</div>
                  <div>
                    <div className="font-semibold text-gray-800">Employee</div>
                    <div className="text-sm text-gray-600">
                      Standard access to projects, tasks, and collaboration tools
                    </div>
                  </div>
                </div>
              </label>

              <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedRole === 'intern' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="intern"
                  checked={selectedRole === 'intern'}
                  onChange={(e) => setSelectedRole(e.target.value as 'intern')}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <div className="text-2xl mr-3">🎓</div>
                  <div>
                    <div className="font-semibold text-gray-800">Intern</div>
                    <div className="text-sm text-gray-600">
                      Learning-focused access with mentorship and training features
                    </div>
                  </div>
                </div>
              </label>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">Note:</h3>
              <p className="text-sm text-blue-700">
                Higher roles (Manager, Admin) are assigned by administrators based on your performance and company needs.
              </p>
            </div>

            <button
              onClick={handleUserRegistration}
              disabled={processing}
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Registering...
                </div>
              ) : (
                `Join as ${selectedRole === 'intern' ? 'Intern' : 'Employee'}`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
