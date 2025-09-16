import Link from 'next/link'
import { getPolls } from '../../lib/actions/polls'
import PollCard from '../../components/polls/PollCard'
import ProtectedPollsPage from '../../components/polls/ProtectedPollsPage'

/**
 * PollsPage Component
 * 
 * Main dashboard page displaying all available polls to authenticated users.
 * This is a Server Component that fetches poll data on the server side
 * for optimal performance and SEO.
 * 
 * Features:
 * - Server-side data fetching for polls
 * - Authentication protection via ProtectedPollsPage wrapper
 * - Responsive grid layout for poll cards
 * - Empty state with call-to-action for new users
 * - Error handling for data fetching failures
 * - Navigation to poll creation page
 * 
 * @returns JSX element containing the polls dashboard
 */
export default async function PollsPage() {
  // Fetch polls data on the server side
  const result = await getPolls()

  // Handle data fetching errors with user-friendly message
  if (!result.success) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading polls: {result.error}
        </div>
      </div>
    )
  }

  // Extract polls array with fallback to empty array
  const polls = result.polls || []

  return (
    <ProtectedPollsPage>
      <div className="container mx-auto p-4">
        {/* Page header with title and create poll button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">INEC Nigeria Polls</h1>
          <Link
            href="/polls/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
          >
            Create New Poll
          </Link>
        </div>

        {/* Conditional rendering based on polls availability */}
        {polls.length === 0 ? (
          // Empty state for when no polls exist
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-600 mb-4">No polls available</h2>
            <p className="text-gray-500 mb-6">Be the first to create a poll!</p>
            <Link
              href="/polls/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
            >
              Create Your First Poll
            </Link>
          </div>
        ) : (
          // Grid layout for poll cards
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        )}
      </div>
    </ProtectedPollsPage>
  )
}
