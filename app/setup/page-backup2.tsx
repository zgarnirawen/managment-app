'use client';

import React, { useState, useEffect } from 'react';

export default function SetupPageSimple() {
  const [selectedRole, setSelectedRole] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Check if already completed
  useEffect(() => {
    const completed = localStorage.getItem('setupCompleted');
    if (completed === 'true') {
      setShowSuccess(true);
    }
  }, []);

  const roles = [
    {
      id: 'employee',
      name: 'Employee',
      icon: '👤',
      description: 'Access timesheets, view schedules, submit requests'
    },
    {
      id: 'manager',
      name: 'Manager',
      icon: '👥',
      description: 'Manage team, approve requests, view reports'
    },
    {
      id: 'admin',
      name: 'Admin',
      icon: '⚙️',
      description: 'Full system access and administration'
    }
  ];

  const handleRoleClick = (roleId) => {
    console.log('Role clicked:', roleId);
    setSelectedRole(roleId);
  };

  const handleContinue = () => {
    if (!selectedRole) {
      alert('Please select a role first');
      return;
    }

    console.log('🔥 Continue clicked with role:', selectedRole);
    
    // Save locally - NO API CALLS
    localStorage.setItem('userRole', selectedRole);
    localStorage.setItem('setupCompleted', 'true');
    
    setShowSuccess(true);
    
    console.log('🔥 Setup completed successfully');
    
    // Navigate after a short delay
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1000);
  };

  const resetSetup = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('setupCompleted');
    setShowSuccess(false);
    setSelectedRole('');
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nextgen-dark-blue to-nextgen-light-blue flex items-center justify-center p-4">
        <div className="bg-nextgen-light-blue/80 rounded-nextgen shadow-nextgen-lg p-8 max-w-md w-full border border-nextgen-teal/30">
          <div className="text-center">
            <div className="w-20 h-20 bg-nextgen-success rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">✅</span>
            </div>
            <h1 className="text-2xl font-bold text-nextgen-white mb-4">Setup Complete!</h1>
            <p className="text-nextgen-light-gray mb-6">
              Role: {localStorage.getItem('userRole')}
            </p>
            <button
              onClick={() => {
                window.location.href = '/dashboard';
              }}
              className="w-full bg-nextgen-success hover:bg-nextgen-success/80 text-nextgen-white font-semibold py-3 px-6 rounded-nextgen mb-3"
            >
              Go to Dashboard →
            </button>
            <button
              onClick={resetSetup}
              className="w-full bg-nextgen-medium-gray hover:bg-nextgen-hover-gray text-nextgen-white py-2 px-6 rounded-nextgen text-sm"
            >
              Reset Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-nextgen-dark-blue to-nextgen-light-blue flex items-center justify-center p-4">
      <div className="bg-nextgen-light-blue/80 rounded-nextgen shadow-nextgen-lg p-8 max-w-lg w-full border border-nextgen-teal/30">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-nextgen-teal rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h1 className="text-2xl font-bold text-nextgen-white mb-2">Account Setup</h1>
          <p className="text-nextgen-light-gray">Choose your role to continue</p>
        </div>

        <div className="space-y-3 mb-8">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => handleRoleClick(role.id)}
              className={`p-4 rounded-nextgen border-2 cursor-pointer transition-all hover:shadow-nextgen ${
                selectedRole === role.id
                  ? 'border-nextgen-teal bg-nextgen-teal/20 text-nextgen-white'
                  : 'border-nextgen-medium-gray hover:border-nextgen-teal text-nextgen-light-gray hover:text-nextgen-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{role.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{role.name}</span>
                    {selectedRole === role.id && (
                      <div className="w-2 h-2 bg-nextgen-teal rounded-full"></div>
                    )}
                  </div>
                  <p className="text-sm opacity-75">{role.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className="w-full bg-nextgen-teal hover:bg-nextgen-teal-hover disabled:bg-nextgen-disabled-gray disabled:cursor-not-allowed text-nextgen-white font-semibold py-3 px-6 rounded-nextgen transition-all flex items-center justify-center gap-2"
        >
          {selectedRole ? (
            `Continue as ${roles.find(r => r.id === selectedRole)?.name} →`
          ) : (
            'Select a role to continue'
          )}
        </button>
      </div>
    </div>
  );
}
