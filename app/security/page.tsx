'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import Link from 'next/link';

export default function SecuritySettingsPage() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const userRole = user.unsafeMetadata?.role as string;
  const roleSetupComplete = user.unsafeMetadata?.roleSetupComplete as boolean;
  const twoFactorEnabled = user.unsafeMetadata?.twoFactorEnabled as boolean;

  return (
    <div className="min-h-screen bg-nextgen-dark-blue py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-nextgen-white mb-2">Security Settings</h1>
          <p className="text-nextgen-light-gray">Manage your account security and authentication preferences</p>
        </div>

        <div className="space-y-6">
          {/* Account Information */}
          <div className="bg-nextgen-medium-gray/20 border border-nextgen-light-gray/20 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-nextgen-white mb-4">Account Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-nextgen-light-gray">Email</label>
                <div className="mt-1 text-sm text-nextgen-white">{user.emailAddresses[0]?.emailAddress}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-nextgen-light-gray">Role</label>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    userRole === 'admin' ? 'bg-nextgen-error/20 text-nextgen-error' :
                    userRole === 'manager' ? 'bg-nextgen-teal/20 text-nextgen-teal' :
                    'bg-nextgen-success/20 text-nextgen-success'
                  }`}>
                    {userRole?.charAt(0).toUpperCase() + userRole?.slice(1) || 'Not Set'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="bg-nextgen-medium-gray/20 border border-nextgen-light-gray/20 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-nextgen-white">Two-Factor Authentication</h2>
                <p className="text-sm text-nextgen-light-gray">Add an extra layer of security to your account</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                twoFactorEnabled 
                  ? 'bg-nextgen-success/20 text-nextgen-success' 
                  : 'bg-nextgen-error/20 text-nextgen-error'
              }`}>
                {twoFactorEnabled ? '✓ Enabled' : '✗ Disabled'}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-nextgen-teal/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-nextgen-teal text-xs">📱</span>
                </div>
                <div>
                  <h3 className="font-medium text-nextgen-white">Authenticator App</h3>
                  <p className="text-sm text-nextgen-light-gray">Use Google Authenticator, Authy, or similar apps</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                {!twoFactorEnabled ? (
                  <Link
                    href="/two-factor-setup"
                    className="bg-nextgen-teal hover:bg-nextgen-teal-hover text-nextgen-dark-blue px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Enable 2FA
                  </Link>
                ) : (
                  <button
                    onClick={() => {/* Handle disable 2FA */}}
                    className="bg-nextgen-error hover:bg-red-600 text-nextgen-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Disable 2FA
                  </button>
                )}
                <Link
                  href="/two-factor-setup"
                  className="bg-nextgen-medium-gray hover:bg-nextgen-light-gray text-nextgen-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Manage 2FA
                </Link>
              </div>
            </div>
          </div>

          {/* Role Management */}
          <div className="bg-nextgen-medium-gray/20 border border-nextgen-light-gray/20 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-nextgen-white">Role & Permissions</h2>
                <p className="text-sm text-nextgen-light-gray">Your current role and access permissions</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                roleSetupComplete 
                  ? 'bg-nextgen-success/20 text-nextgen-success' 
                  : 'bg-nextgen-warning/20 text-nextgen-warning'
              }`}>
                {roleSetupComplete ? '✓ Complete' : '⚠ Incomplete'}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg border-2 ${
                  userRole === 'employee' ? 'border-nextgen-success bg-nextgen-success/10' : 'border-nextgen-light-gray/30 bg-nextgen-medium-gray/10'
                }`}>
                  <div className="text-2xl mb-2">👨‍💼</div>
                  <h3 className="font-medium text-nextgen-white">Employee</h3>
                  <p className="text-xs text-nextgen-light-gray">Basic access to personal dashboard</p>
                </div>
                
                <div className={`p-4 rounded-lg border-2 ${
                  userRole === 'manager' ? 'border-nextgen-teal bg-nextgen-teal/10' : 'border-nextgen-light-gray/30 bg-nextgen-medium-gray/10'
                }`}>
                  <div className="text-2xl mb-2">👔</div>
                  <h3 className="font-medium text-nextgen-white">Manager</h3>
                  <p className="text-xs text-nextgen-light-gray">Team management and oversight</p>
                </div>
                
                <div className={`p-4 rounded-lg border-2 ${
                  userRole === 'admin' ? 'border-nextgen-error bg-nextgen-error/10' : 'border-nextgen-light-gray/30 bg-nextgen-medium-gray/10'
                }`}>
                  <div className="text-2xl mb-2">⚡</div>
                  <h3 className="font-medium text-nextgen-white">Administrator</h3>
                  <p className="text-xs text-nextgen-light-gray">Full system access and control</p>
                </div>
              </div>
              
              {!roleSetupComplete && (
                <Link
                  href="/setup"
                  className="inline-flex bg-nextgen-teal hover:bg-nextgen-teal-hover text-nextgen-dark-blue px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Complete Role Setup
                </Link>
              )}
            </div>
          </div>

          {/* Security Recommendations */}
          <div className="bg-nextgen-light-blue/10 border border-nextgen-teal/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-nextgen-white mb-4">🛡️ Security Recommendations</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <span className={twoFactorEnabled ? 'text-nextgen-success text-lg' : 'text-nextgen-error text-lg'}>
                  {twoFactorEnabled ? '✓' : '✗'}
                </span>
                <span className="text-nextgen-white font-medium">Enable Two-Factor Authentication</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-nextgen-success text-lg">✓</span>
                <span className="text-nextgen-white font-medium">Use a strong, unique password</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={roleSetupComplete ? 'text-nextgen-success text-lg' : 'text-nextgen-warning text-lg'}>
                  {roleSetupComplete ? '✓' : '!'}
                </span>
                <span className="text-nextgen-white font-medium">Complete role setup for proper access control</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-nextgen-success text-lg">✓</span>
                <span className="text-nextgen-white font-medium">Regularly review your account activity</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-nextgen-success text-lg">✓</span>
                <span className="text-nextgen-white font-medium">Keep your software and browsers updated</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-nextgen-success text-lg">✓</span>
                <span className="text-nextgen-white font-medium">Monitor account access and sign-out unused sessions</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-nextgen-teal hover:text-nextgen-teal-hover font-medium transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
