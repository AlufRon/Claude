'use client'
import { Component, ErrorInfo } from 'react'

export class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error caught by boundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
          <h2 className="text-red-500 font-bold mb-2">Something went wrong</h2>
          <pre className="text-sm text-red-400">{this.state.error?.message}</pre>
        </div>
      )
    }
    return this.props.children
  }
}