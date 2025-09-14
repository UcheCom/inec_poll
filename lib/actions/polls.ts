'use server'

import { createServerClient } from '../supabaseClient'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Poll, PollOption, ElectionType } from '../../src/types/poll'

export interface CreatePollData {
    title: string
    description?: string
    election_type: ElectionType
    state?: string
    lga?: string
    end_date?: string
    options: {
        candidate_name: string
        party_name?: string
        candidate_image_url?: string
    }[]
}

export async function createPoll(data: CreatePollData, userId: string) {
    try {
        const supabase = createServerClient()

        // Validate user ID
        if (!userId) {
            throw new Error('Authentication required to create polls')
        }

        // First, ensure the user has a profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .single()

        if (profileError && profileError.code !== 'PGRST116') {
            throw new Error('Failed to verify user profile')
        }

        // Create profile if it doesn't exist
        if (!profile) {
            const { error: createProfileError } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    email: '', // We'll need to get this from the client
                    full_name: null,
                    avatar_url: null
                })

            if (createProfileError) {
                throw new Error('Failed to create user profile')
            }
        }

        // Create the poll
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

        // Create poll options
        if (data.options && data.options.length > 0) {
            const optionsData = data.options.map((option, index) => ({
                poll_id: poll.id,
                candidate_name: option.candidate_name,
                party_name: option.party_name,
                candidate_image_url: option.candidate_image_url,
                display_order: index + 1
            }))

            const { error: optionsError } = await supabase
                .from('poll_options')
                .insert(optionsData)

            if (optionsError) {
                // If options creation fails, clean up the poll
                await supabase.from('polls').delete().eq('id', poll.id)
                throw new Error(`Failed to create poll options: ${optionsError.message}`)
            }
        }

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

export async function getPolls() {
    try {
        const supabase = createServerClient()

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
            .eq('is_active', true)
            .order('created_at', { ascending: false })

        if (error) {
            throw new Error(`Failed to fetch polls: ${error.message}`)
        }

        return { success: true, polls }
    } catch (error) {
        console.error('Error fetching polls:', error)

        // If it's an environment variable error, provide helpful guidance
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

export async function getPollById(id: string) {
    try {
        const supabase = createServerClient()

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
            .single()

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

export async function voteOnPoll(pollId: string, optionId: string, userId: string) {
    try {
        const supabase = createServerClient()

        // Validate user ID
        if (!userId) {
            throw new Error('Authentication required to vote')
        }

        // Check if poll is active
        const { data: poll, error: pollError } = await supabase
            .from('polls')
            .select('is_active, end_date')
            .eq('id', pollId)
            .single()

        if (pollError || !poll) {
            throw new Error('Poll not found')
        }

        if (!poll.is_active) {
            throw new Error('This poll is no longer active')
        }

        if (poll.end_date && new Date(poll.end_date) < new Date()) {
            throw new Error('This poll has ended')
        }

        // Check if user has already voted
        const { data: existingVote } = await supabase
            .from('votes')
            .select('id')
            .eq('poll_id', pollId)
            .eq('voter_id', userId)
            .single()

        if (existingVote) {
            throw new Error('You have already voted on this poll')
        }

        // Cast the vote
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
