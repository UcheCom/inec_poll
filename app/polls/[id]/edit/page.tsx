'use client'
import EditPollForm from '../../../../components/EditPollForm'
import { useAuth } from '../../../../src/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import React from 'react'

interface EditPollPageProps {
    params: Promise<{
        id: string
    }>
}

export default function EditPollPage({ params }: EditPollPageProps) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const { id } = React.use(params)

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
            <EditPollForm pollId={id} />
        </main>
    )
}
