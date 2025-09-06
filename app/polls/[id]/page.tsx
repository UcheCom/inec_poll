// app/polls/[id]/page.tsx
import React from 'react';
import { PollProvider } from '../../../src/context/PollContext';
import { usePollContext } from '../../../src/context/PollContext';
import { useParams } from 'next/navigation';

const PollDetail = () => {
    const { getPollById } = usePollContext();
    // @ts-ignore
    const { id } = useParams();
    const poll = getPollById(id as string);
    if (!poll) return <div>Poll not found</div>;
    return (
        <div>
            <h2>{poll.title}</h2>
            <p>{poll.description}</p>
            <p>Type: {poll.electionType} {poll.state && `| State: ${poll.state}`}</p>
            <h3>Candidates</h3>
            <ul>
                {poll.candidates.map((c) => <li key={c}>{c}</li>)}
            </ul>
            {/* Voting UI would go here */}
        </div>
    );
};

export default function PollDetailPage() {
    return (
        <PollProvider>
            <PollDetail />
        </PollProvider>
    );
}
