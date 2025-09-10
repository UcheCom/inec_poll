"use client"
import React, { useEffect } from 'react';
import { PollProvider } from '../../src/context/PollContext';
import { PollList } from '../../src/components/polls/PollList';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function PollsPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <PollProvider>
      <main style={{ padding: 24 }}>
        <h1>INEC Nigeria Polls</h1>
        <PollList />
      </main>
    </PollProvider>
  );
}
