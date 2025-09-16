'use client'
import CreatePollForm from '../../../components/forms/CreatePollForm'
import { useAuth } from '../../../src/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function CreatePollPage() {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login')
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </main>
        )
    }

    if (!user) {
        return null
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <CreatePollForm />
        </main>
    )
}
