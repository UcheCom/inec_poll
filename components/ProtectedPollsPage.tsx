'use client'

import { useEffect } from 'react'
import { useAuth } from '../src/context/AuthContext'
import { useRouter } from 'next/navigation'

interface ProtectedPollsPageProps {
    children: React.ReactNode
}

export default function ProtectedPollsPage({ children }: ProtectedPollsPageProps) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login')
        }
    }, [user, loading, router])

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

    if (!user) {
        return null
    }

    return <>{children}</>
}
