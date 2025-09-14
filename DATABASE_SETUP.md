# Database Setup Guide

This guide explains how to set up the Supabase database schema for the INEC Polls application.

## Prerequisites

1. A Supabase project created at [supabase.com](https://supabase.com)
2. Your Supabase project URL and API keys

## Database Schema Overview

The database consists of the following main tables:

### Core Tables

1. **`profiles`** - Extended user profiles linked to Supabase auth
2. **`polls`** - Main polls/elections table
3. **`poll_options`** - Candidates/options for each poll
4. **`votes`** - Individual votes cast by users

### Views

1. **`poll_statistics`** - Aggregated statistics for each poll
2. **`option_vote_counts`** - Vote counts and percentages for each option

## Setup Instructions

### 1. Execute the Schema

1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click "Run" to execute the schema

### 2. Verify Tables

After running the schema, verify that all tables were created:

```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'polls', 'poll_options', 'votes');
```

### 3. Test Row Level Security

Verify that RLS is enabled:

```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'polls', 'poll_options', 'votes');
```

## Key Features

### Security

- **Row Level Security (RLS)** enabled on all tables
- **Vote immutability** - votes cannot be updated or deleted
- **One vote per user per poll** constraint
- **Authentication required** for creating polls and voting

### Performance

- **Comprehensive indexing** on frequently queried columns
- **Optimized views** for statistics and vote counts
- **Efficient foreign key relationships**

### Data Integrity

- **Foreign key constraints** ensure referential integrity
- **Unique constraints** prevent duplicate votes
- **Automatic timestamp updates** via triggers
- **Data validation** through check constraints

## Usage Examples

### Creating a Poll

```sql
-- Insert a new poll
INSERT INTO public.polls (title, description, election_type, state, creator_id)
VALUES ('2023 Presidential Election', 'Who would you vote for?', 'Presidential', 'Lagos', 'user-uuid-here');

-- Add poll options
INSERT INTO public.poll_options (poll_id, candidate_name, party_name, display_order)
VALUES 
  ('poll-uuid-here', 'Candidate A', 'Party A', 1),
  ('poll-uuid-here', 'Candidate B', 'Party B', 2);
```

### Voting

```sql
-- Cast a vote
INSERT INTO public.votes (poll_id, option_id, voter_id)
VALUES ('poll-uuid-here', 'option-uuid-here', 'user-uuid-here');
```

### Getting Results

```sql
-- Get poll results using the helper function
SELECT * FROM get_poll_results('poll-uuid-here');

-- Or use the view directly
SELECT * FROM option_vote_counts WHERE poll_id = 'poll-uuid-here';
```

## Environment Variables

Make sure to set up these environment variables in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure RLS policies are correctly set up
2. **Foreign Key Violations**: Check that referenced records exist
3. **Duplicate Vote Error**: Users can only vote once per poll
4. **Authentication Required**: Ensure user is logged in before voting

### Useful Queries

```sql
-- Check if a user has voted on a poll
SELECT has_user_voted('poll-uuid', 'user-uuid');

-- Get all polls created by a user
SELECT * FROM polls WHERE creator_id = 'user-uuid';

-- Get active polls
SELECT * FROM polls WHERE is_active = true AND (end_date IS NULL OR end_date > NOW());
```

## Schema Modifications

If you need to modify the schema:

1. Always backup your data first
2. Test changes in a development environment
3. Update the TypeScript types accordingly
4. Update any related application code

## Support

For issues with the database schema, check:
1. Supabase documentation
2. PostgreSQL documentation
3. Application logs for specific error messages
