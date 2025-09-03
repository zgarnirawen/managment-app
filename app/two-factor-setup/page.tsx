'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TwoFactorSetupPage() {
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');

  const handleEnable2FA = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Generate 2FA setup using Clerk's approach
      // Note: Clerk's 2FA setup requires specific configuration in Clerk Dashboard
      
      // For now, show a message that 2FA setup requires Clerk configuration
      alert('2FA setup requires configuration in Clerk Dashboard. Please contact your administrator.');
      setIsLoading(false);
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      alert('Unable to set up 2FA at this time. Please try again later.');
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode || !user) return;
    
    setIsLoading(true);
    try {
      // 2FA verification requires proper Clerk configuration
      // For now, show that this feature needs to be properly implemented
      alert('2FA verification requires proper Clerk configuration. Please contact your administrator.');
      setIsLoading(false);
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      alert('Unable to verify 2FA code. Please try again later.');
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    router.push('/dashboard');
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔐 Two-Factor Authentication
          </h1>
          <p className="text-gray-600">
            Add an extra layer of security to your account
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {step === 'setup' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Enable Two-Factor Authentication</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-medium">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Install an authenticator app</h3>
                    <p className="text-sm text-gray-600">Download Google Authenticator, Authy, or similar app on your phone</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-medium">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Scan QR code</h3>
                    <p className="text-sm text-gray-600">Use your authenticator app to scan the QR code</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-medium">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Enter verification code</h3>
                    <p className="text-sm text-gray-600">Enter the 6-digit code from your authenticator app</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleEnable2FA}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                {isLoading ? 'Setting up...' : 'Start Setup'}
              </button>
            </div>
          )}

          {step === 'verify' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Scan QR Code & Verify</h2>
              
              <div className="text-center mb-6">
                <div className="bg-gray-100 w-48 h-48 mx-auto rounded-lg flex items-center justify-center mb-4">
                  <div className="text-gray-500 text-sm">QR Code Placeholder</div>
                </div>
                <p className="text-sm text-gray-600">Scan this QR code with your authenticator app</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter verification code from your app:
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-mono"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-yellow-800 mb-2">⚠️ Save Your Backup Codes</h3>
                <p className="text-sm text-yellow-700 mb-3">
                  These codes can be used to access your account if you lose your authenticator device:
                </p>
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="bg-white px-2 py-1 rounded border">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleVerify2FA}
                disabled={!verificationCode || verificationCode.length !== 6 || isLoading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                {isLoading ? 'Verifying...' : 'Verify & Enable 2FA'}
              </button>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                🎉 Two-Factor Authentication Enabled!
              </h2>
              <p className="text-gray-600 mb-6">
                Your account is now protected with an additional layer of security.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-green-800 mb-2">What happens next?</h3>
                <ul className="text-sm text-green-700 space-y-1 text-left">
                  <li>• You'll need your authenticator app for future sign-ins</li>
                  <li>• Keep your backup codes in a safe place</li>
                  <li>• You can disable 2FA anytime in your account settings</li>
                </ul>
              </div>

              <button
                onClick={handleComplete}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
              >
                Continue to Dashboard
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <a
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Skip for now (not recommended)
          </a>
        </div>
      </div>
    </div>
  );
}
