'use client'

import { useState } from 'react'
import Link from 'next/link'
import { deletePoll } from '../lib/actions/polls'
import { useAuth } from '../src/context/AuthContext'
import { useRouter } from 'next/navigation'

interface PollCardProps {
    poll: {
        id: string
        title: string
        description?: string
        election_type: string
        state?: string
        lga?: string
        created_at: string
        creator_id: string
        poll_options?: Array<{
            id: string
            candidate_name: string
            party_name?: string
            candidate_image_url?: string
            display_order: number
        }>
        profiles?: {
            id: string
            email: string
            full_name?: string
        }
    }
}

export default function PollCard({ poll }: PollCardProps) {
    const { user } = useAuth()
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const isOwner = user && poll.creator_id === user.id

    const handleDelete = async () => {
        if (!user) return

        setIsDeleting(true)
        const result = await deletePoll(poll.id, user.id)

        if (result.success) {
            // Refresh the page to show updated polls
            router.refresh()
        } else {
            alert(`Failed to delete poll: ${result.error}`)
        }

        setIsDeleting(false)
        setShowDeleteConfirm(false)
    }

    return (
        <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow bg-white">
            <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold">{poll.title}</h2>
                    {isOwner && (
                        <div className="flex space-x-2">
                            <Link
                                href={`/polls/${poll.id}/edit`}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                Edit
                            </Link>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    )}
                </div>

                {poll.description && (
                    <p className="text-gray-600 mb-2">{poll.description}</p>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {poll.election_type}
                    </span>
                    {poll.state && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            {poll.state}
                        </span>
                    )}
                </div>

                {poll.profiles && (
                    <p className="text-sm text-gray-500">
                        Created by: {poll.profiles.full_name || poll.profiles.email}
                    </p>
                )}
            </div>

            <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                    {poll.poll_options?.length || 0} candidate(s)
                </p>
                <div className="space-y-1">
                    {poll.poll_options?.slice(0, 3).map((option, index) => (
                        <div key={option.id} className="text-sm text-gray-700">
                            {index + 1}. {option.candidate_name}
                            {option.party_name && ` (${option.party_name})`}
                        </div>
                    ))}
                    {(poll.poll_options?.length || 0) > 3 && (
                        <div className="text-sm text-gray-500">
                            +{(poll.poll_options?.length || 0) - 3} more...
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                    Created: {new Intl.DateTimeFormat('en-GB').format(new Date(poll.created_at))}
                </span>
                <Link
                    href={`/polls/${poll.id}`}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                    View Poll
                </Link>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Delete Poll</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{poll.title}"? This action cannot be undone and will also delete all votes for this poll.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
