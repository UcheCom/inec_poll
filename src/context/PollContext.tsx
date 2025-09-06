"use client";
// src/context/PollContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Poll } from '../types/poll';

const mockPolls: Poll[] = [
    {
        id: '1',
        title: 'Presidential Election 2027',
        description: 'Vote for your preferred presidential candidate',
        electionType: 'Presidential',
        candidates: ['Candidate A', 'Candidate B', 'Candidate C'],
        createdAt: '2025-09-06',
    },
    {
        id: '2',
        title: 'Gubernatorial Election - Lagos',
        description: 'Vote for your preferred governor in Lagos State',
        electionType: 'Gubernatorial',
        state: 'Lagos',
        candidates: ['Candidate X', 'Candidate Y'],
        createdAt: '2025-09-06',
    },
    {
        id: '3',
        title: 'Senatorial Election - FCT',
        description: 'Vote for your preferred senator in FCT',
        electionType: 'Senatorial',
        state: 'FCT',
        candidates: ['Candidate M', 'Candidate N'],
        createdAt: '2025-09-06',
    },
];

interface PollContextType {
    polls: Poll[];
    getPollById: (id: string) => Poll | undefined;
}

const PollContext = createContext<PollContextType | undefined>(undefined);

export const PollProvider = ({ children }: { children: ReactNode }) => {
    const [polls] = useState<Poll[]>(mockPolls);
    const getPollById = (id: string) => polls.find((p) => p.id === id);
    return (
        <PollContext.Provider value={{ polls, getPollById }}>
            {children}
        </PollContext.Provider>
    );
};

export const usePollContext = () => {
    const ctx = useContext(PollContext);
    if (!ctx) throw new Error('usePollContext must be used within PollProvider');
    return ctx;
};
