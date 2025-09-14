-- Supabase Database Schema for INEC Polls Application
-- Execute this in your Supabase SQL Editor

-- Enable Row Level Security (RLS) and UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE election_type AS ENUM ('Presidential', 'Gubernatorial', 'Senatorial', 'House of Reps', 'State Assembly');

-- Users table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url VARCHAR(500),
    state VARCHAR(100),
    lga VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Polls table
CREATE TABLE public.polls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    election_type election_type NOT NULL,
    state VARCHAR(100),
    lga VARCHAR(100),
    creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poll Options (Candidates) table
CREATE TABLE public.poll_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
    candidate_name VARCHAR(255) NOT NULL,
    party_name VARCHAR(100),
    candidate_image_url VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table
CREATE TABLE public.votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
    option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE NOT NULL,
    voter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    voter_ip_address INET,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one vote per user per poll
    UNIQUE(poll_id, voter_id)
);

-- Poll Statistics View (for quick access to vote counts)
CREATE VIEW public.poll_statistics AS
SELECT 
    p.id as poll_id,
    p.title,
    p.election_type,
    p.state,
    p.lga,
    COUNT(DISTINCT v.id) as total_votes,
    p.created_at,
    p.end_date,
    p.is_active
FROM public.polls p
LEFT JOIN public.votes v ON p.id = v.poll_id
GROUP BY p.id, p.title, p.election_type, p.state, p.lga, p.created_at, p.end_date, p.is_active;

-- Option Vote Count View
CREATE VIEW public.option_vote_counts AS
SELECT 
    po.id as option_id,
    po.poll_id,
    po.candidate_name,
    po.party_name,
    COUNT(v.id) as vote_count,
    ROUND(
        CASE 
            WHEN total_poll_votes.total > 0 
            THEN (COUNT(v.id) * 100.0 / total_poll_votes.total)
            ELSE 0
        END, 2
    ) as vote_percentage
FROM public.poll_options po
LEFT JOIN public.votes v ON po.id = v.option_id
LEFT JOIN (
    SELECT poll_id, COUNT(*) as total
    FROM public.votes
    GROUP BY poll_id
) total_poll_votes ON po.poll_id = total_poll_votes.poll_id
GROUP BY po.id, po.poll_id, po.candidate_name, po.party_name, total_poll_votes.total
ORDER BY po.poll_id, vote_count DESC;

-- Create indexes for better performance
CREATE INDEX idx_polls_election_type ON public.polls(election_type);
CREATE INDEX idx_polls_state ON public.polls(state);
CREATE INDEX idx_polls_creator_id ON public.polls(creator_id);
CREATE INDEX idx_polls_active ON public.polls(is_active);
CREATE INDEX idx_poll_options_poll_id ON public.poll_options(poll_id);
CREATE INDEX idx_votes_poll_id ON public.votes(poll_id);
CREATE INDEX idx_votes_option_id ON public.votes(option_id);
CREATE INDEX idx_votes_voter_id ON public.votes(voter_id);
CREATE INDEX idx_votes_voted_at ON public.votes(voted_at);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Polls policies
CREATE POLICY "Polls are viewable by everyone" ON public.polls
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create polls" ON public.polls
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Poll creators can update their own polls" ON public.polls
    FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Poll creators can delete their own polls" ON public.polls
    FOR DELETE USING (auth.uid() = creator_id);

-- Poll options policies
CREATE POLICY "Poll options are viewable by everyone" ON public.poll_options
    FOR SELECT USING (true);

CREATE POLICY "Poll creators can manage poll options" ON public.poll_options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.polls
            WHERE polls.id = poll_options.poll_id
            AND polls.creator_id = auth.uid()
        )
    );

-- Votes policies
CREATE POLICY "Users can view all votes" ON public.votes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON public.votes
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated'
        AND auth.uid() = voter_id
        AND EXISTS (
            SELECT 1 FROM public.polls
            WHERE polls.id = votes.poll_id
            AND polls.is_active = true
            AND (polls.end_date IS NULL OR polls.end_date > NOW())
        )
    );

-- Votes are immutable - no updates or deletes allowed
CREATE POLICY "Votes cannot be updated" ON public.votes
    FOR UPDATE USING (false);

CREATE POLICY "Votes cannot be deleted" ON public.votes
    FOR DELETE USING (false);

-- Functions for common operations

-- Function to get poll results
CREATE OR REPLACE FUNCTION get_poll_results(poll_uuid UUID)
RETURNS TABLE (
    option_id UUID,
    candidate_name VARCHAR,
    party_name VARCHAR,
    vote_count BIGINT,
    vote_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ovc.option_id,
        ovc.candidate_name,
        ovc.party_name,
        ovc.vote_count,
        ovc.vote_percentage
    FROM option_vote_counts ovc
    WHERE ovc.poll_id = poll_uuid
    ORDER BY ovc.vote_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has voted on a poll
CREATE OR REPLACE FUNCTION has_user_voted(poll_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.votes
        WHERE poll_id = poll_uuid AND voter_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_polls_updated_at BEFORE UPDATE ON public.polls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - for testing)
/*
-- Sample poll
INSERT INTO public.polls (title, description, election_type, state) VALUES
('2023 Presidential Election Poll', 'Who would you vote for in the 2023 Nigerian Presidential Election?', 'Presidential', NULL);

-- Get the poll ID for sample options (replace with actual ID after running above)
INSERT INTO public.poll_options (poll_id, candidate_name, party_name) VALUES
('your-poll-uuid-here', 'Bola Ahmed Tinubu', 'APC'),
('your-poll-uuid-here', 'Atiku Abubakar', 'PDP'),
('your-poll-uuid-here', 'Peter Obi', 'LP'),
('your-poll-uuid-here', 'Rabiu Kwankwaso', 'NNPP');
*/

-- Grants (ensure proper permissions)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.polls TO anon, authenticated;
GRANT SELECT ON public.poll_options TO anon, authenticated;
GRANT SELECT ON public.poll_statistics TO anon, authenticated;
GRANT SELECT ON public.option_vote_counts TO anon, authenticated;

GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.polls TO authenticated;
GRANT ALL ON public.poll_options TO authenticated;
GRANT INSERT, SELECT ON public.votes TO authenticated;

-- Comment on tables and important columns
COMMENT ON TABLE public.profiles IS 'Extended user profiles linked to auth.users';
COMMENT ON TABLE public.polls IS 'Main polls/elections table';
COMMENT ON TABLE public.poll_options IS 'Candidates/options for each poll';
COMMENT ON TABLE public.votes IS 'Individual votes cast by users';
COMMENT ON COLUMN public.votes.voter_ip_address IS 'For additional fraud detection (optional)';
COMMENT ON VIEW public.poll_statistics IS 'Aggregated statistics for each poll';
COMMENT ON VIEW public.option_vote_counts IS 'Vote counts and percentages for each option';