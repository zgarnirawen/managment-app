'use client';

import React, { useState } from 'react';

export default function SetupPageUltraSimple() {
  const [selectedRole, setSelectedRole] = useState('');
  
  const roles = ['employee', 'manager', 'admin'];

  const handleSetup = (role) => {
    console.log('Setting up role:', role);
    localStorage.setItem('userRole', role);
    localStorage.setItem('setupCompleted', 'true');
    
    alert(`Setup complete as ${role}! Redirecting to dashboard...`);
    
    // Use setTimeout to avoid any potential API calls
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 500);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a2332 0%, #2a3441 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(42, 52, 65, 0.8)',
        padding: '40px',
        borderRadius: '15px',
        border: '1px solid rgba(20, 184, 166, 0.3)',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          color: 'white', 
          fontSize: '28px', 
          marginBottom: '10px' 
        }}>
          Account Setup
        </h1>
        <p style={{ 
          color: '#9ca3af', 
          marginBottom: '30px' 
        }}>
          Choose your role to continue
        </p>
        
        <div style={{ marginBottom: '30px' }}>
          {roles.map((role) => (
            <div
              key={role}
              onClick={() => handleSetup(role)}
              style={{
                padding: '15px 20px',
                margin: '10px 0',
                backgroundColor: selectedRole === role ? 'rgba(20, 184, 166, 0.2)' : 'rgba(75, 85, 99, 0.3)',
                border: selectedRole === role ? '2px solid #14b8a6' : '2px solid #4b5563',
                borderRadius: '10px',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s',
                textTransform: 'capitalize',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              {role}
            </div>
          ))}
        </div>
        
        <p style={{ 
          color: '#6b7280', 
          fontSize: '12px' 
        }}>
          Click on any role to complete setup instantly
        </p>
      </div>
    </div>
  );
}
