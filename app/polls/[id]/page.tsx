import { getPollById, getPollResults } from '../../../lib/actions/polls'
import PollVotingComponent from '../../../components/PollVotingComponent'
import Link from 'next/link'

interface PollDetailPageProps {
    params: Promise<{
        id: string
    }> // params is a promise
}

export default async function PollDetailPage({ params }: PollDetailPageProps) {
    const { id } = await params // await it

    const pollResult = await getPollById(id)
    const resultsResult = await getPollResults(id)

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

    const poll = pollResult.poll
    const results = resultsResult.success ? resultsResult.results : []

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="mb-6">
                <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
                    ← Back to polls
                </Link>

                <h1 className="text-3xl font-bold mb-4">{poll.title}</h1>

                {poll.description && (
                    <p className="text-gray-600 mb-4">{poll.description}</p>
                )}

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

            <PollVotingComponent
                poll={poll}
                results={results}
                pollId={id}
            />
        </div>
    )
}
