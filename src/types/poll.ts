// src/types/poll.ts

export type ElectionType = 'Presidential' | 'Gubernatorial' | 'Senatorial' | 'House of Reps' | 'State Assembly';

export interface Poll {
    id: string;
    title: string;
    description: string;
    electionType: ElectionType;
    state?: string; // For state-specific elections
    lga?: string;   // For local government area
    candidates: string[];
    createdAt: string;
}
