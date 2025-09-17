'use client'

import { useState } from 'react'
import Link from 'next/link'
import { deletePoll } from '../../lib/actions/polls'
import { useAuth } from '../../lib/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { LoadingButton } from '../ui/loading'
import { ErrorBoundary } from '../ui/error-boundary'
import { QRCodeButton } from '../ui/qr-code'
import { formatDate, truncateText } from '../../lib/utils'

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

/**
 * PollCard Component
 * 
 * Displays poll information in a card format with voting and management options.
 * Features improved UI with shadcn/ui components, better error handling,
 * and loading states.
 * 
 * @param poll - Poll data to display
 * @returns JSX element containing the poll card
 */
export default function PollCard({ poll }: PollCardProps) {
    const { user } = useAuth()
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const isOwner = user && poll.creator_id === user.id

    /**
     * Handles poll deletion with improved error handling
     */
    const handleDelete = async () => {
        if (!user) {
            setError('You must be logged in to delete polls')
            return
        }

        setIsDeleting(true)
        setError(null)

        try {
            const result = await deletePoll(poll.id, user.id)

            if (result.success) {
                router.refresh()
            } else {
                setError(result.error || 'Failed to delete poll')
            }
        } catch (err) {
            setError('An unexpected error occurred')
            console.error('Delete poll error:', err)
        } finally {
            setIsDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    return (
        <ErrorBoundary>
            <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">
                            {truncateText(poll.title, 50)}
                        </CardTitle>
                        {isOwner && (
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                >
                                    <Link href={`/polls/${poll.id}/edit`}>
                                        Edit
                                    </Link>
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    disabled={isDeleting}
                                >
                                    Delete
                                </Button>
                            </div>
                        )}
                    </div>

                    {poll.description && (
                        <CardDescription>
                            {truncateText(poll.description, 100)}
                        </CardDescription>
                    )}

                    <div className="flex flex-wrap gap-2 mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {poll.election_type}
                        </span>
                        {poll.state && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {poll.state}
                            </span>
                        )}
                    </div>

                    {poll.profiles && (
                        <p className="text-sm text-muted-foreground mt-2">
                            Created by: {poll.profiles.full_name || poll.profiles.email}
                        </p>
                    )}
                </CardHeader>

                <CardContent>
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-muted-foreground">
                            {poll.poll_options?.length || 0} candidate(s)
                        </p>
                        <div className="space-y-2">
                            {poll.poll_options?.slice(0, 3).map((option, index) => (
                                <div key={option.id} className="flex items-center space-x-2 text-sm">
                                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium">
                                        {index + 1}
                                    </span>
                                    <span className="font-medium">{option.candidate_name}</span>
                                    {option.party_name && (
                                        <span className="text-muted-foreground">({option.party_name})</span>
                                    )}
                                </div>
                            ))}
                            {(poll.poll_options?.length || 0) > 3 && (
                                <p className="text-sm text-muted-foreground">
                                    +{(poll.poll_options?.length || 0) - 3} more candidates...
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                        Created: {formatDate(poll.created_at)}
                    </span>
                    <div className="flex items-center gap-2">
                        <QRCodeButton
                            url={`${typeof window !== 'undefined' ? window.location.origin : ''}/polls/${poll.id}`}
                            pollTitle={poll.title}
                        />
                        <Button asChild>
                            <Link href={`/polls/${poll.id}`}>
                                View Poll
                            </Link>
                        </Button>
                    </div>
                </CardFooter>

                {/* Error Display */}
                {error && (
                    <div className="p-4">
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <Card className="max-w-md w-full mx-4">
                            <CardHeader>
                                <CardTitle>Delete Poll</CardTitle>
                                <CardDescription>
                                    Are you sure you want to delete "{poll.title}"? This action cannot be undone and will also delete all votes for this poll.
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="flex justify-end space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </Button>
                                <LoadingButton
                                    variant="destructive"
                                    onClick={handleDelete}
                                    loading={isDeleting}
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </LoadingButton>
                            </CardFooter>
                        </Card>
                    </div>
                )}
            </Card>
        </ErrorBoundary>
    )
}
