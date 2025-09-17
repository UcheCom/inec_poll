// lib/types/poll.ts

export type ElectionType = 'Presidential' | 'Gubernatorial' | 'Senatorial' | 'House of Reps' | 'State Assembly';

export interface Profile {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    state?: string;
    lga?: string;
    created_at: string;
    updated_at: string;
}

export interface Poll {
    id: string;
    title: string;
    description?: string;
    election_type: ElectionType;
    state?: string;
    lga?: string;
    creator_id?: string;
    is_active: boolean;
    start_date: string;
    end_date?: string;
    created_at: string;
    updated_at: string;
}

export interface PollOption {
    id: string;
    poll_id: string;
    candidate_name: string;
    party_name?: string;
    candidate_image_url?: string;
    display_order: number;
    created_at: string;
}

export interface Vote {
    id: string;
    poll_id: string;
    option_id: string;
    voter_id?: string;
    voter_ip_address?: string;
    voted_at: string;
}

export interface PollStatistics {
    poll_id: string;
    title: string;
    election_type: ElectionType;
    state?: string;
    lga?: string;
    total_votes: number;
    created_at: string;
    end_date?: string;
    is_active: boolean;
}

export interface OptionVoteCount {
    option_id: string;
    poll_id: string;
    candidate_name: string;
    party_name?: string;
    vote_count: number;
    vote_percentage: number;
}

export interface PollWithOptions extends Poll {
    options: PollOption[];
    statistics?: PollStatistics;
    option_vote_counts?: OptionVoteCount[];
    profiles?: {
        id: string;
        email: string;
        full_name?: string;
    };
}
