'use client'

import React, { useState, useEffect } from 'react'
import { AlertTriangle, X, RefreshCw, Home, ArrowLeft, Bug, Mail, HelpCircle } from 'lucide-react'

interface ErrorInfo {
  message: string
  stack?: string
  componentStack?: string
  errorBoundary?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
}

interface ErrorHandlerProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

// Global error boundary component
class ErrorBoundary extends React.Component<ErrorHandlerProps, ErrorBoundaryState> {
  constructor(props: ErrorHandlerProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    const enhancedErrorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name
    }

    this.setState({
      errorInfo: enhancedErrorInfo
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, enhancedErrorInfo)
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary Caught:', error, errorInfo)
    }

    // In production, you would send this to your error reporting service
    // Example: Sentry, LogRocket, Bugsnag, etc.
    this.reportError(error, enhancedErrorInfo)
  }

  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // In a real application, send to your error reporting service
      const errorReport = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        errorInfo
      }

      // Example API call (replace with your actual error reporting endpoint)
      if (process.env.NODE_ENV === 'production') {
        await fetch('/api/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorReport)
        })
      }

      console.log('Error reported:', errorReport)
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      this.handleGoHome()
    }
  }

  private handleSendReport = () => {
    const { error, errorInfo, errorId } = this.state
    const subject = encodeURIComponent(`Error Report - ${errorId}`)
    const body = encodeURIComponent(`
Error ID: ${errorId}
Error Message: ${error?.message}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}

Please describe what you were doing when this error occurred:


Additional Details:
${JSON.stringify({ error: error?.stack, errorInfo }, null, 2)}
    `)
    
    window.location.href = `mailto:support@company.com?subject=${subject}&body=${body}`
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorId } = this.state

      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={error!} reset={this.handleReset} />
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-8">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Oops! Something went wrong</h1>
                <p className="text-gray-600">We encountered an unexpected error</p>
              </div>
            </div>

            {/* Error Message */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Details</h3>
              <p className="text-red-700 font-mono text-sm mb-2">
                {error?.message || 'Unknown error occurred'}
              </p>
              <p className="text-red-600 text-xs">
                Error ID: {errorId}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={this.handleReset}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Try Again</span>
                </button>
                <button
                  onClick={this.handleReload}
                  className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Reload Page</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={this.handleGoBack}
                  className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Go Back</span>
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Home className="w-5 h-5" />
                  <span>Go Home</span>
                </button>
              </div>

              <button
                onClick={this.handleSendReport}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>Send Error Report</span>
              </button>
            </div>

            {/* Help Section */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800 mb-1">Need Help?</h4>
                  <p className="text-blue-700 text-sm mb-2">
                    If this error persists, please contact our support team with the error ID above.
                  </p>
                  <div className="space-y-1 text-sm text-blue-600">
                    <p>• Check your internet connection</p>
                    <p>• Clear your browser cache and cookies</p>
                    <p>• Try using a different browser</p>
                    <p>• Contact IT support if the problem continues</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Development Info */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6">
                <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                  <span className="flex items-center space-x-2">
                    <Bug className="w-4 h-4" />
                    <span>Development Details</span>
                  </span>
                </summary>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-auto max-h-64">
                    {JSON.stringify({ error: error?.stack, errorInfo }, null, 2)}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for handling async errors in functional components
export const useErrorHandler = () => {
  const [error, setError] = useState<Error | null>(null)

  const resetError = () => setError(null)

  const handleError = (error: Error) => {
    setError(error)
    console.error('Async Error:', error)
    
    // Report error to your error reporting service
    if (process.env.NODE_ENV === 'production') {
      // reportErrorToService(error)
    }
  }

  useEffect(() => {
    if (error) {
      throw error // This will be caught by the ErrorBoundary
    }
  }, [error])

  return { handleError, resetError }
}

// Higher-order component for wrapping components with error boundaries
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

// Custom error classes for different types of errors
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NetworkError'
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Error notification component
export const ErrorNotification: React.FC<{
  error: Error
  onDismiss: () => void
}> = ({ error, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-md z-50">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-800">Error</h4>
            <p className="text-red-700 text-sm mt-1">{error.message}</p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default ErrorBoundary
