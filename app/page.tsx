import Link from 'next/link'
import { getPolls } from '../lib/actions/polls'
import PollCard from '../components/polls/PollCard'

export default async function Home() {
  const result = await getPolls()

  if (!result.success) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading polls: {result.error}
        </div>
      </div>
    )
  }

  const polls = result.polls || []

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Available Polls</h1>
        <Link
          href="/polls/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
        >
          Create New Poll
        </Link>
      </div>

      {polls.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  )
}
