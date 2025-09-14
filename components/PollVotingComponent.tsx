'use client'

import { useState } from 'react'
import { voteOnPoll } from '../lib/actions/polls'
import { Poll, OptionVoteCount } from '../src/types/poll'
import { useAuth } from '../src/context/AuthContext'

/**
 * Props interface for PollVotingComponent
 * 
 * @interface PollVotingComponentProps
 */
interface PollVotingComponentProps {
    /** Poll data with options for voting */
    poll: Poll & {
        poll_options: Array<{
            id: string
            candidate_name: string
            party_name?: string
            candidate_image_url?: string
            display_order: number
        }>
    }
    /** Vote count results for each option */
    results: OptionVoteCount[]
    /** Unique identifier of the poll */
    pollId: string
}

/**
 * PollVotingComponent
 * 
 * Handles the complete voting interface for polls including:
 * - Candidate selection interface
 * - Vote submission with validation
 * - Real-time results display
 * - Poll status checking (active/expired)
 * - Duplicate vote prevention
 * 
 * Features:
 * - Interactive candidate selection with visual feedback
 * - Loading states during vote submission
 * - Error handling for voting failures
 * - Results visualization with percentages and vote counts
 * - Automatic poll status validation
 * 
 * @param props - Component props containing poll data and results
 * @returns JSX element with voting interface or results display
 */
export default function PollVotingComponent({ poll, results, pollId }: PollVotingComponentProps) {
    // Authentication context for user validation
    const { user } = useAuth()

    // Voting state management
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [isVoting, setIsVoting] = useState(false)
    const [hasVoted, setHasVoted] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showResults, setShowResults] = useState(false)

    // Calculate total votes and poll status
    const totalVotes = results.reduce((sum, result) => sum + result.vote_count, 0)
    const isPollActive = poll.is_active && (!poll.end_date || new Date(poll.end_date) > new Date())

    /**
     * Handles vote submission process
     * 
     * Validates user authentication and selected option before submitting vote.
     * Updates UI state based on vote success/failure and refreshes page
     * to show updated results.
     */
    const handleVote = async () => {
        if (!selectedOption) return

        // Ensure user is authenticated before allowing vote
        if (!user) {
            setError('You must be logged in to vote')
            return
        }

        setIsVoting(true)
        setError(null)

        // Submit vote to server action
        const result = await voteOnPoll(pollId, selectedOption, user.id)

        if (result.success) {
            setHasVoted(true)
            setShowResults(true)
            // Refresh page to show updated results immediately
            // This ensures real-time vote count updates
            window.location.reload()
        } else {
            setError(result.error || 'Failed to vote')
        }

        setIsVoting(false)
    }

    /**
     * Calculates vote percentage for a specific option
     * 
     * @param optionId - ID of the poll option
     * @returns Percentage of votes for the option (0-100)
     */
    const getVotePercentage = (optionId: string) => {
        const result = results.find(r => r.option_id === optionId)
        return result ? result.vote_percentage : 0
    }

    /**
     * Gets vote count for a specific option
     * 
     * @param optionId - ID of the poll option
     * @returns Number of votes for the option
     */
    const getVoteCount = (optionId: string) => {
        const result = results.find(r => r.option_id === optionId)
        return result ? result.vote_count : 0
    }

    if (!isPollActive) {
        return (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
                <p className="font-semibold">This poll is no longer active.</p>
                {poll.end_date && (
                    <p className="text-sm">Poll ended on {new Date(poll.end_date).toLocaleString()}</p>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {!hasVoted && !showResults ? (
                <div className="bg-white border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Cast Your Vote</h2>
                    <p className="text-gray-600 mb-6">Select your preferred candidate:</p>

                    <div className="space-y-3">
                        {poll.poll_options
                            .sort((a, b) => a.display_order - b.display_order)
                            .map((option) => (
                                <label
                                    key={option.id}
                                    className={`block p-4 border rounded-lg cursor-pointer transition-colors ${selectedOption === option.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="candidate"
                                        value={option.id}
                                        checked={selectedOption === option.id}
                                        onChange={(e) => setSelectedOption(e.target.value)}
                                        className="sr-only"
                                    />
                                    <div className="flex items-center space-x-4">
                                        {option.candidate_image_url && (
                                            <img
                                                src={option.candidate_image_url}
                                                alt={option.candidate_name}
                                                className="w-12 h-12 rounded-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none'
                                                }}
                                            />
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg">{option.candidate_name}</h3>
                                            {option.party_name && (
                                                <p className="text-gray-600">{option.party_name}</p>
                                            )}
                                        </div>
                                        {selectedOption === option.id && (
                                            <div className="text-blue-600">
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </label>
                            ))}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleVote}
                            disabled={!selectedOption || isVoting}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md font-medium"
                        >
                            {isVoting ? 'Voting...' : 'Submit Vote'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        <p className="font-semibold">Thank you for voting!</p>
                        <p className="text-sm">Your vote has been recorded successfully.</p>
                    </div>

                    <div className="bg-white border rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">Poll Results</h2>
                            <p className="text-gray-600">Total votes: {totalVotes}</p>
                        </div>

                        <div className="space-y-4">
                            {poll.poll_options
                                .sort((a, b) => getVoteCount(b.id) - getVoteCount(a.id))
                                .map((option) => {
                                    const percentage = getVotePercentage(option.id)
                                    const voteCount = getVoteCount(option.id)

                                    return (
                                        <div key={option.id} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center space-x-3">
                                                    {option.candidate_image_url && (
                                                        <img
                                                            src={option.candidate_image_url}
                                                            alt={option.candidate_name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none'
                                                            }}
                                                        />
                                                    )}
                                                    <div>
                                                        <h3 className="font-semibold">{option.candidate_name}</h3>
                                                        {option.party_name && (
                                                            <p className="text-sm text-gray-600">{option.party_name}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">{percentage.toFixed(1)}%</p>
                                                    <p className="text-sm text-gray-600">{voteCount} votes</p>
                                                </div>
                                            </div>

                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )
                                })}
                        </div>
                    </div>
                </div>
            )}

            {!hasVoted && !showResults && (
                <div className="text-center">
                    <button
                        onClick={() => setShowResults(true)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        View Results
                    </button>
                </div>
            )}
        </div>
    )
}
