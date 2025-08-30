"use client"

import * as React from "react"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

type ToastActionElement = React.ReactElement

const ToastContext = React.createContext<{
  toast: (props: ToastProps) => void
}>({
  toast: () => {}
})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toast = React.useCallback((props: ToastProps) => {
    // Simple toast implementation - in a real app you'd use a proper toast library

    alert(`${props.title ? props.title + ': ' : ''}${props.description}`)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
