'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InstantSetup() {
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleContinue = () => {
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }
    
    setIsLoading(true);
    
    // Store role in localStorage for now
    localStorage.setItem('userRole', selectedRole);
    
    // Redirect to dashboard immediately
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-slate-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Instant Access</h1>
          <p className="text-slate-300">Skip all loading - get started now!</p>
        </div>

        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Choose Your Role:</h3>
          
          {['Employee', 'Manager', 'Admin'].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                selectedRole === role
                  ? 'border-green-500 bg-green-500/10 text-white'
                  : 'border-slate-600 hover:border-green-500 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedRole === role ? 'border-green-500 bg-green-500' : 'border-slate-600'
                }`}>
                  {selectedRole === role && <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>}
                </div>
                <span className="font-medium">{role}</span>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedRole || isLoading}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-600 disabled:cursor-not-allowed px-6 py-4 rounded-lg text-white font-semibold transition-all duration-200"
        >
          {isLoading ? 'Starting...' : 'Continue to Dashboard →'}
        </button>

        <div className="mt-6 p-4 bg-green-900/20 border border-green-500/20 rounded-lg">
          <h4 className="text-green-400 font-semibold mb-2">✓ No Authentication Required</h4>
          <p className="text-green-200 text-sm">Direct access without any delays or loading screens!</p>
        </div>
      </div>
    </div>
  );
}
