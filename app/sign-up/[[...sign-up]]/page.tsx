'use client';

import { SignUp } from '@clerk/nextjs';
import { useState } from 'react';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Join Our Team
            </h1>
            <p className="text-gray-600">
              Create your account and select your role
            </p>
          </div>
          
          <SignUp 
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
            redirectUrl="/setup"
            appearance={{
              elements: {
                formButtonPrimary: 
                  "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
                card: "shadow-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: 
                  "bg-white border border-gray-300 hover:bg-gray-50",
                socialButtonsBlockButtonText: "text-gray-600",
                formFieldInput: 
                  "border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500",
                footerActionLink: "text-blue-600 hover:text-blue-700"
              }
            }}
          />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/sign-in" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
