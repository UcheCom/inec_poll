'use server'

import { createServerClient } from '../supabaseClient'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Poll, PollOption, ElectionType } from '../types/poll'

/**
 * CreatePollData Interface
 * 
 * Defines the structure for poll creation data.
 * Used for both creating new polls and updating existing ones.
 * 
 * @interface CreatePollData
 */
export interface CreatePollData {
    /** Title of the poll - required for identification */
    title: string
    /** Optional description providing context about the poll */
    description?: string
    /** Type of election (Presidential, Gubernatorial, etc.) */
    election_type: ElectionType
    /** State for state-specific elections (optional for Presidential) */
    state?: string
    /** Local Government Area for local elections */
    lga?: string
    /** Optional end date for the poll */
    end_date?: string
    /** Array of candidate options for the poll */
    options: {
        /** Name of the candidate - required */
        candidate_name: string
        /** Political party affiliation - optional */
        party_name?: string
        /** URL to candidate's image - optional */
        candidate_image_url?: string
    }[]
}

/**
 * Creates a new poll with the provided data
 * 
 * This server action handles the complete poll creation process including:
 * - User authentication validation
 * - User profile creation if needed
 * - Poll record creation
 * - Poll options creation
 * - Transaction rollback on failure
 * 
 * @param data - Poll creation data including title, description, election type, and options
 * @param userId - ID of the user creating the poll
 * @returns Promise with success status and poll ID or error message
 * 
 * @throws Error if user is not authenticated
 * @throws Error if poll creation fails
 * @throws Error if poll options creation fails (with automatic cleanup)
 */
export async function createPoll(data: CreatePollData, userId: string) {
    try {
        const supabase = createServerClient()

        // Validate user authentication - required for poll creation
        if (!userId) {
            throw new Error('Authentication required to create polls')
        }

        // Ensure user profile exists before creating poll
        // This handles cases where user was created through auth but profile wasn't set up
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .single()

        // Handle profile lookup errors (except "not found" which is expected)
        if (profileError && profileError.code !== 'PGRST116') {
            throw new Error('Failed to verify user profile')
        }

        // Create user profile if it doesn't exist
        // This ensures referential integrity for the poll's creator_id
        if (!profile) {
            const { error: createProfileError } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    email: '', // Will be updated when user completes profile
                    full_name: null,
                    avatar_url: null
                })

            if (createProfileError) {
                throw new Error('Failed to create user profile')
            }
        }

        // Create the main poll record
        const { data: poll, error: pollError } = await supabase
            .from('polls')
            .insert({
                title: data.title,
                description: data.description,
                election_type: data.election_type,
                state: data.state,
                lga: data.lga,
                creator_id: userId,
                end_date: data.end_date ? new Date(data.end_date).toISOString() : null
            })
            .select()
            .single()

        if (pollError) {
            throw new Error(`Failed to create poll: ${pollError.message}`)
        }

        // Create poll options (candidates) for the poll
        if (data.options && data.options.length > 0) {
            const optionsData = data.options.map((option, index) => ({
                poll_id: poll.id,
                candidate_name: option.candidate_name,
                party_name: option.party_name,
                candidate_image_url: option.candidate_image_url,
                display_order: index + 1 // Maintains order of candidates as entered
            }))

            const { error: optionsError } = await supabase
                .from('poll_options')
                .insert(optionsData)

            if (optionsError) {
                // Transaction rollback: delete the poll if options creation fails
                // This maintains data consistency
                await supabase.from('polls').delete().eq('id', poll.id)
                throw new Error(`Failed to create poll options: ${optionsError.message}`)
            }
        }

        // Revalidate the polls page to show the new poll
        revalidatePath('/polls')
        return { success: true, poll_id: poll.id }
    } catch (error) {
        console.error('Error creating poll:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create poll'
        }
    }
}

/**
 * Retrieves all active polls with their options and creator information
 * 
 * Fetches polls from the database with related data including:
 * - Poll options (candidates) with display order
 * - Creator profile information
 * - Only active polls are returned
 * - Results are ordered by creation date (newest first)
 * 
 * @returns Promise with success status and polls array or error message
 * 
 * @throws Error if database query fails
 * @throws Error if environment variables are not configured
 */
export async function getPolls() {
    try {
        const supabase = createServerClient()

        // Fetch polls with related data using Supabase's relational queries
        const { data: polls, error } = await supabase
            .from('polls')
            .select(`
        *,
        poll_options (
          id,
          candidate_name,
          party_name,
          candidate_image_url,
          display_order
        ),
        profiles!polls_creator_id_fkey (
          id,
          email,
          full_name
        )
      `)
            .eq('is_active', true) // Only fetch active polls
            .order('created_at', { ascending: false }) // Newest polls first

        if (error) {
            throw new Error(`Failed to fetch polls: ${error.message}`)
        }

        return { success: true, polls }
    } catch (error) {
        console.error('Error fetching polls:', error)

        // Provide helpful error message for common configuration issues
        if (error instanceof Error && error.message.includes('Missing Supabase environment variables')) {
            return {
                success: false,
                error: 'Environment variables not configured. Please set up your .env.local file with Supabase credentials.'
            }
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch polls'
        }
    }
}

/**
 * Retrieves a specific poll by its ID with all related options
 * 
 * Fetches a single poll from the database including:
 * - All poll details (title, description, election type, etc.)
 * - Poll options (candidates) with display order
 * - Used for poll detail pages and voting interfaces
 * 
 * @param id - Unique identifier of the poll to fetch
 * @returns Promise with success status and poll data or error message
 * 
 * @throws Error if poll is not found
 * @throws Error if database query fails
 */
export async function getPollById(id: string) {
    try {
        const supabase = createServerClient()

        // Fetch single poll with its options using relational query
        const { data: poll, error } = await supabase
            .from('polls')
            .select(`
        *,
        poll_options (
          id,
          candidate_name,
          party_name,
          candidate_image_url,
          display_order
        )
      `)
            .eq('id', id)
            .single() // Expect exactly one result

        if (error) {
            throw new Error(`Failed to fetch poll: ${error.message}`)
        }

        return { success: true, poll }
    } catch (error) {
        console.error('Error fetching poll:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch poll'
        }
    }
}

/**
 * Records a user's vote for a specific poll option
 * 
 * This function handles the complete voting process including:
 * - User authentication validation
 * - Poll availability checks (active status and end date)
 * - Duplicate vote prevention
 * - Vote recording with referential integrity
 * - Cache invalidation for real-time results
 * 
 * @param pollId - ID of the poll being voted on
 * @param optionId - ID of the selected poll option (candidate)
 * @param userId - ID of the user casting the vote
 * @returns Promise with success status or error message
 * 
 * @throws Error if user is not authenticated
 * @throws Error if poll is not found or inactive
 * @throws Error if poll has ended
 * @throws Error if user has already voted
 * @throws Error if vote recording fails
 */
export async function voteOnPoll(pollId: string, optionId: string, userId: string) {
    try {
        const supabase = createServerClient()

        // Validate user authentication - required for voting
        if (!userId) {
            throw new Error('Authentication required to vote')
        }

        // Check poll status before allowing vote
        // This prevents voting on inactive or expired polls
        const { data: poll, error: pollError } = await supabase
            .from('polls')
            .select('is_active, end_date')
            .eq('id', pollId)
            .single()

        if (pollError || !poll) {
            throw new Error('Poll not found')
        }

        // Ensure poll is still active
        if (!poll.is_active) {
            throw new Error('This poll is no longer active')
        }

        // Check if poll has passed its end date
        if (poll.end_date && new Date(poll.end_date) < new Date()) {
            throw new Error('This poll has ended')
        }

        // Prevent duplicate voting - each user can only vote once per poll
        const { data: existingVote } = await supabase
            .from('votes')
            .select('id')
            .eq('poll_id', pollId)
            .eq('voter_id', userId)
            .single()

        if (existingVote) {
            throw new Error('You have already voted on this poll')
        }

        // Record the vote in the database
        const { error: voteError } = await supabase
            .from('votes')
            .insert({
                poll_id: pollId,
                option_id: optionId,
                voter_id: userId
            })

        if (voteError) {
            throw new Error(`Failed to cast vote: ${voteError.message}`)
        }

        // Invalidate cache to show updated results immediately
        revalidatePath(`/polls/${pollId}`)
        return { success: true }
    } catch (error) {
        console.error('Error voting on poll:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to vote'
        }
    }
}

export async function updatePoll(pollId: string, data: CreatePollData, userId: string) {
    try {
        const supabase = createServerClient()

        // Validate user ID
        if (!userId) {
            throw new Error('Authentication required to update polls')
        }

        // Check if user owns the poll
        const { data: poll, error: pollError } = await supabase
            .from('polls')
            .select('creator_id')
            .eq('id', pollId)
            .single()

        if (pollError || !poll) {
            throw new Error('Poll not found')
        }

        if (poll.creator_id !== userId) {
            throw new Error('You can only update your own polls')
        }

        // Update the poll
        const { error: updateError } = await supabase
            .from('polls')
            .update({
                title: data.title,
                description: data.description,
                election_type: data.election_type,
                state: data.state,
                lga: data.lga,
                end_date: data.end_date ? new Date(data.end_date).toISOString() : null
            })
            .eq('id', pollId)

        if (updateError) {
            throw new Error(`Failed to update poll: ${updateError.message}`)
        }

        // Delete existing poll options
        const { error: deleteOptionsError } = await supabase
            .from('poll_options')
            .delete()
            .eq('poll_id', pollId)

        if (deleteOptionsError) {
            throw new Error(`Failed to delete existing options: ${deleteOptionsError.message}`)
        }

        // Create new poll options
        if (data.options && data.options.length > 0) {
            const optionsToInsert = data.options.map((option, index) => ({
                poll_id: pollId,
                candidate_name: option.candidate_name,
                party_name: option.party_name || null,
                candidate_image_url: option.candidate_image_url || null,
                display_order: index + 1
            }))

            const { error: insertOptionsError } = await supabase
                .from('poll_options')
                .insert(optionsToInsert)

            if (insertOptionsError) {
                throw new Error(`Failed to create poll options: ${insertOptionsError.message}`)
            }
        }

        revalidatePath('/polls')
        revalidatePath(`/polls/${pollId}`)
        return { success: true }
    } catch (error) {
        console.error('Error updating poll:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update poll'
        }
    }
}

export async function deletePoll(pollId: string, userId: string) {
    try {
        const supabase = createServerClient()

        // Validate user ID
        if (!userId) {
            throw new Error('Authentication required to delete polls')
        }

        // Check if user owns the poll
        const { data: poll, error: pollError } = await supabase
            .from('polls')
            .select('creator_id')
            .eq('id', pollId)
            .single()

        if (pollError || !poll) {
            throw new Error('Poll not found')
        }

        if (poll.creator_id !== userId) {
            throw new Error('You can only delete your own polls')
        }

        // Delete poll options first (due to foreign key constraints)
        const { error: deleteOptionsError } = await supabase
            .from('poll_options')
            .delete()
            .eq('poll_id', pollId)

        if (deleteOptionsError) {
            throw new Error(`Failed to delete poll options: ${deleteOptionsError.message}`)
        }

        // Delete votes
        const { error: deleteVotesError } = await supabase
            .from('votes')
            .delete()
            .eq('poll_id', pollId)

        if (deleteVotesError) {
            throw new Error(`Failed to delete votes: ${deleteVotesError.message}`)
        }

        // Delete the poll
        const { error: deletePollError } = await supabase
            .from('polls')
            .delete()
            .eq('id', pollId)

        if (deletePollError) {
            throw new Error(`Failed to delete poll: ${deletePollError.message}`)
        }

        revalidatePath('/polls')
        return { success: true }
    } catch (error) {
        console.error('Error deleting poll:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete poll'
        }
    }
}

export async function getPollResults(pollId: string) {
    try {
        const supabase = createServerClient()

        const { data: results, error } = await supabase
            .rpc('get_poll_results', { poll_uuid: pollId })

        if (error) {
            throw new Error(`Failed to fetch poll results: ${error.message}`)
        }

        return { success: true, results }
    } catch (error) {
        console.error('Error fetching poll results:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch poll results'
        }
    }
}
