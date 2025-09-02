'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';

export default function TestUserData() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      console.log('🔍 Current user data:', {
        id: user.id,
        publicMetadata: user.publicMetadata,
        unsafeMetadata: user.unsafeMetadata,
        fullUser: user
      });
    }
  }, [isLoaded, user]);

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user) {
    return <div className="p-8">Not signed in</div>;
  }

  return (
    <div className="p-8 bg-nextgen-dark-gray min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-nextgen-white mb-6">User Data Test</h1>
        
        <div className="bg-nextgen-medium-gray/20 border border-nextgen-light-gray/20 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-nextgen-white mb-4">Current User Information</h2>
          
          <div className="space-y-4 text-nextgen-light-gray">
            <div>
              <strong className="text-nextgen-white">User ID:</strong> {user.id}
            </div>
            <div>
              <strong className="text-nextgen-white">Email:</strong> {user.emailAddresses[0]?.emailAddress}
            </div>
            <div>
              <strong className="text-nextgen-white">Name:</strong> {user.fullName}
            </div>
          </div>
        </div>

        <div className="bg-nextgen-medium-gray/20 border border-nextgen-light-gray/20 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-nextgen-white mb-4">Public Metadata</h2>
          <pre className="text-nextgen-light-gray bg-nextgen-dark-gray p-4 rounded overflow-auto">
            {JSON.stringify(user.publicMetadata, null, 2)}
          </pre>
        </div>

        <div className="bg-nextgen-medium-gray/20 border border-nextgen-light-gray/20 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-nextgen-white mb-4">Unsafe Metadata</h2>
          <pre className="text-nextgen-light-gray bg-nextgen-dark-gray p-4 rounded overflow-auto">
            {JSON.stringify(user.unsafeMetadata, null, 2)}
          </pre>
        </div>

        <div className="bg-nextgen-medium-gray/20 border border-nextgen-light-gray/20 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-nextgen-white mb-4">Actions</h2>
          <div className="space-x-4">
            <button
              onClick={() => {
                console.log('🔄 Reloading user data...');
                user.reload();
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Reload User Data
            </button>
            <button
              onClick={() => {
                console.log('🔄 Full user object:', user);
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Log Full User Object
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
