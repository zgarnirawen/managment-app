import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'nextgen-teal',
  text = 'Loading...' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div 
        className={`animate-spin rounded-full border-b-2 border-${color} ${sizeClasses[size]}`}
      />
      {text && (
        <p className="text-nextgen-light-gray text-sm">{text}</p>
      )}
    </div>
  );
}
