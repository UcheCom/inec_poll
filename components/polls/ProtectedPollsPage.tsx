'use client'

import { useEffect } from 'react'
import { useAuth } from '../../src/context/AuthContext'
import { useRouter } from 'next/navigation'

/**
 * Props interface for ProtectedPollsPage
 * 
 * @interface ProtectedPollsPageProps
 */
interface ProtectedPollsPageProps {
    /** Child components to render if user is authenticated */
    children: React.ReactNode
}

/**
 * ProtectedPollsPage Component
 * 
 * A higher-order component that provides authentication protection
 * for poll-related pages. Ensures only authenticated users can access
 * poll functionality and redirects unauthenticated users to login.
 * 
 * Features:
 * - Authentication state monitoring
 * - Automatic redirect to login for unauthenticated users
 * - Loading state display during authentication check
 * - Conditional rendering based on auth status
 * 
 * @param props - Component props containing children to protect
 * @returns JSX element with protected content or loading/redirect states
 */
export default function ProtectedPollsPage({ children }: ProtectedPollsPageProps) {
    // Authentication context for user state and loading status
    const { user, loading } = useAuth()
    const router = useRouter()

    /**
     * Effect hook to handle authentication-based navigation
     * 
     * Monitors authentication state and redirects unauthenticated users
     * to the login page. Only triggers redirect after loading is complete
     * to prevent flashing during initial auth check.
     */
    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login')
        }
    }, [user, loading, router])

    // Show loading spinner while checking authentication status
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    // Don't render anything if user is not authenticated (redirect will happen)
    if (!user) {
        return null
    }

    // Render protected content for authenticated users
    return <>{children}</>
}
