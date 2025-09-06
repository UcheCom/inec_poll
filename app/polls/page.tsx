import React from 'react';
import { PollProvider } from '../../src/context/PollContext';
import { PollList } from '../../src/components/polls/PollList';

export default function PollsPage() {
  return (
    <PollProvider>
      <main style={{ padding: 24 }}>
        <h1>INEC Nigeria Polls</h1>
        <PollList />
      </main>
    </PollProvider>
  );
}
