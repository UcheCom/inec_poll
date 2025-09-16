import { getPollById, getPollResults } from '../../../lib/actions/polls'
import PollVotingComponent from '../../../components/polls/PollVotingComponent'
import Link from 'next/link'

/**
 * Props interface for PollDetailPage
 * 
 * @interface PollDetailPageProps
 */
interface PollDetailPageProps {
    /** Route parameters containing the poll ID */
    params: Promise<{
        id: string
    }> // params is a promise in Next.js App Router
}

/**
 * PollDetailPage Component
 * 
 * Displays detailed information about a specific poll and provides
 * the voting interface. This is a Server Component that fetches
 * poll data and results on the server side for optimal performance.
 * 
 * Features:
 * - Server-side data fetching for poll details and results
 * - Comprehensive poll information display
 * - Voting interface integration
 * - Error handling for missing or invalid polls
 * - Navigation breadcrumbs
 * - Responsive design with metadata display
 * 
 * @param props - Component props containing route parameters
 * @returns JSX element containing the poll detail page
 */
export default async function PollDetailPage({ params }: PollDetailPageProps) {
    // Extract poll ID from route parameters
    const { id } = await params // await it

    // Fetch poll data and results in parallel for better performance
    const pollResult = await getPollById(id)
    const resultsResult = await getPollResults(id)

    // Handle poll not found or data fetching errors
    if (!pollResult.success || !pollResult.poll) {
        return (
            <div className="container mx-auto p-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    Poll not found or error loading poll: {pollResult.error}
                </div>
                <Link href="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
                    ← Back to polls
                </Link>
            </div>
        )
    }

    // Extract poll data and results with fallbacks
    const poll = pollResult.poll
    const results = resultsResult.success ? resultsResult.results : []

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            {/* Poll header section with navigation and metadata */}
            <div className="mb-6">
                <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
                    ← Back to polls
                </Link>

                <h1 className="text-3xl font-bold mb-4">{poll.title}</h1>

                {/* Optional poll description */}
                {poll.description && (
                    <p className="text-gray-600 mb-4">{poll.description}</p>
                )}

                {/* Poll metadata tags for election type and location */}
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        {poll.election_type}
                    </span>
                    {poll.state && (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                            {poll.state}
                        </span>
                    )}
                    {poll.lga && (
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                            {poll.lga}
                        </span>
                    )}
                </div>
            </div>

            {/* Voting interface component */}
            <PollVotingComponent
                poll={poll}
                results={results}
                pollId={id}
            />
        </div>
    )
}
