'use client'

import React from 'react'
import { Alert, AlertDescription, AlertTitle } from './alert'
import { Button } from './button'

/**
 * Error Boundary State Interface
 * 
 * @interface ErrorBoundaryState
 */
interface ErrorBoundaryState {
    hasError: boolean
    error?: Error
    errorInfo?: React.ErrorInfo
}

/**
 * Error Boundary Props Interface
 * 
 * @interface ErrorBoundaryProps
 */
interface ErrorBoundaryProps {
    children: React.ReactNode
    fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

/**
 * ErrorBoundary Component
 * 
 * A React Error Boundary that catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 * 
 * Features:
 * - Catches errors in child components
 * - Logs errors for debugging
 * - Displays user-friendly error messages
 * - Provides error recovery mechanism
 * - Customizable fallback UI
 * 
 * @param props - Component props
 * @returns JSX element with error boundary functionality
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    /**
     * Static method to update state when an error occurs
     * 
     * @param error - The error that occurred
     * @returns New state object
     */
    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    /**
     * Lifecycle method called when an error occurs
     * 
     * @param error - The error that occurred
     * @param errorInfo - Additional error information
     */
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)

        this.setState({
            error,
            errorInfo
        })

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo)
        }
    }

    /**
     * Resets the error state to allow retry
     */
    resetError = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    }

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                const FallbackComponent = this.props.fallback
                return (
                    <FallbackComponent
                        error={this.state.error!}
                        resetError={this.resetError}
                    />
                )
            }

            // Default error UI
            return (
                <div className="min-h-[400px] flex items-center justify-center p-4">
                    <Alert variant="destructive" className="max-w-md">
                        <AlertTitle>Something went wrong</AlertTitle>
                        <AlertDescription className="mt-2">
                            <p className="mb-4">
                                An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
                            </p>
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="mt-4">
                                    <summary className="cursor-pointer font-medium">
                                        Error Details (Development)
                                    </summary>
                                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                                        {this.state.error.toString()}
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </details>
                            )}
                            <div className="mt-4 flex space-x-2">
                                <Button
                                    onClick={this.resetError}
                                    variant="outline"
                                    size="sm"
                                >
                                    Try Again
                                </Button>
                                <Button
                                    onClick={() => window.location.reload()}
                                    size="sm"
                                >
                                    Refresh Page
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                </div>
            )
        }

        return this.props.children
    }
}

/**
 * Error Fallback Component
 * 
 * A simple fallback component for displaying errors
 * 
 * @param error - The error that occurred
 * @param resetError - Function to reset the error state
 * @returns JSX element with error display
 */
const DefaultErrorFallback: React.FC<{
    error: Error;
    resetError: () => void
}> = ({ error, resetError }) => {
    return (
        <div className="min-h-[200px] flex items-center justify-center p-4">
            <div className="text-center">
                <h2 className="text-lg font-semibold text-red-600 mb-2">
                    Oops! Something went wrong
                </h2>
                <p className="text-gray-600 mb-4">
                    We encountered an error while loading this content.
                </p>
                <Button onClick={resetError}>
                    Try Again
                </Button>
            </div>
        </div>
    )
}

export { ErrorBoundary, DefaultErrorFallback }
export type { ErrorBoundaryProps, ErrorBoundaryState }
