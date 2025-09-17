import { z } from 'zod'
import { ELECTION_TYPES, NIGERIAN_STATES, POLL_CONFIG, VALIDATION_RULES } from '../constants'

/**
 * Election Type Schema
 * 
 * Validates election type values against allowed options
 */
export const electionTypeSchema = z.enum(ELECTION_TYPES)

/**
 * Poll Option Schema
 * 
 * Validates individual poll option data
 */
export const pollOptionSchema = z.object({
    candidate_name: z.string()
        .min(1, 'Candidate name is required')
        .max(POLL_CONFIG.MAX_CANDIDATE_NAME_LENGTH, `Candidate name must be less than ${POLL_CONFIG.MAX_CANDIDATE_NAME_LENGTH} characters`)
        .trim(),
    party_name: z.string()
        .max(POLL_CONFIG.MAX_PARTY_NAME_LENGTH, `Party name must be less than ${POLL_CONFIG.MAX_PARTY_NAME_LENGTH} characters`)
        .trim()
        .optional(),
    candidate_image_url: z.string()
        .url('Must be a valid URL')
        .optional()
        .or(z.literal(''))
})

/**
 * Create Poll Schema
 * 
 * Validates poll creation data with comprehensive validation rules
 */
export const createPollSchema = z.object({
    title: z.string()
        .min(1, 'Poll title is required')
        .max(POLL_CONFIG.MAX_TITLE_LENGTH, `Poll title must be less than ${POLL_CONFIG.MAX_TITLE_LENGTH} characters`)
        .trim(),
    description: z.string()
        .max(POLL_CONFIG.MAX_DESCRIPTION_LENGTH, `Description must be less than ${POLL_CONFIG.MAX_DESCRIPTION_LENGTH} characters`)
        .trim()
        .optional(),
    election_type: electionTypeSchema,
    state: z.string()
        .max(POLL_CONFIG.MAX_STATE_LENGTH, `State name must be less than ${POLL_CONFIG.MAX_STATE_LENGTH} characters`)
        .trim()
        .optional(),
    lga: z.string()
        .max(POLL_CONFIG.MAX_LGA_LENGTH, `LGA name must be less than ${POLL_CONFIG.MAX_LGA_LENGTH} characters`)
        .trim()
        .optional(),
    end_date: z.string()
        .datetime('Must be a valid date')
        .optional()
        .or(z.literal('')),
    options: z.array(pollOptionSchema)
        .min(POLL_CONFIG.MIN_CANDIDATES, `At least ${POLL_CONFIG.MIN_CANDIDATES} candidates are required`)
        .max(POLL_CONFIG.MAX_CANDIDATES, `Maximum ${POLL_CONFIG.MAX_CANDIDATES} candidates allowed`)
})

/**
 * Update Poll Schema
 * 
 * Validates poll update data (same as create but allows partial updates)
 */
export const updatePollSchema = createPollSchema.partial().extend({
    options: z.array(pollOptionSchema)
        .min(POLL_CONFIG.MIN_CANDIDATES, `At least ${POLL_CONFIG.MIN_CANDIDATES} candidates are required`)
        .max(POLL_CONFIG.MAX_CANDIDATES, `Maximum ${POLL_CONFIG.MAX_CANDIDATES} candidates allowed`)
        .optional()
})

/**
 * Vote Schema
 * 
 * Validates vote submission data
 */
export const voteSchema = z.object({
    poll_id: z.string().regex(VALIDATION_RULES.UUID_REGEX, 'Invalid poll ID'),
    option_id: z.string().regex(VALIDATION_RULES.UUID_REGEX, 'Invalid option ID')
})

/**
 * User Profile Schema
 * 
 * Validates user profile data
 */
export const userProfileSchema = z.object({
    full_name: z.string()
        .min(1, 'Full name is required')
        .max(POLL_CONFIG.MAX_CANDIDATE_NAME_LENGTH, `Full name must be less than ${POLL_CONFIG.MAX_CANDIDATE_NAME_LENGTH} characters`)
        .trim(),
    email: z.string()
        .email('Must be a valid email address')
        .max(POLL_CONFIG.MAX_CANDIDATE_NAME_LENGTH, `Email must be less than ${POLL_CONFIG.MAX_CANDIDATE_NAME_LENGTH} characters`),
    state: z.string()
        .max(POLL_CONFIG.MAX_STATE_LENGTH, `State name must be less than ${POLL_CONFIG.MAX_STATE_LENGTH} characters`)
        .trim()
        .optional(),
    lga: z.string()
        .max(POLL_CONFIG.MAX_LGA_LENGTH, `LGA name must be less than ${POLL_CONFIG.MAX_LGA_LENGTH} characters`)
        .trim()
        .optional(),
    avatar_url: z.string()
        .url('Must be a valid URL')
        .optional()
        .or(z.literal(''))
})

/**
 * Input Sanitization Schema
 * 
 * Sanitizes user inputs to prevent XSS attacks
 */
export const sanitizeInputSchema = z.string()
    .transform((val) => val.trim())
    .transform((val) => val.replace(/[<>]/g, '')) // Remove potential HTML tags
    .transform((val) => val.replace(/javascript:/gi, '')) // Remove javascript: protocol
    .transform((val) => val.replace(/on\w+=/gi, '')) // Remove event handlers

/**
 * Rate Limiting Schema
 * 
 * Validates rate limiting data
 */
export const rateLimitSchema = z.object({
    action: z.enum(['create_poll', 'vote', 'update_poll', 'delete_poll']),
    user_id: z.string().uuid(),
    ip_address: z.string().ip(),
    timestamp: z.number().positive()
})

/**
 * Validation Helper Functions
 */

/**
 * Validates poll creation data
 * 
 * @param data - Poll creation data to validate
 * @returns Validation result with success/error status
 */
export function validateCreatePoll(data: unknown) {
    try {
        const validatedData = createPollSchema.parse(data)
        return { success: true, data: validatedData }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.errors.map(e => e.message).join(', ')
            }
        }
        return { success: false, error: 'Validation failed' }
    }
}

/**
 * Validates vote data
 * 
 * @param data - Vote data to validate
 * @returns Validation result with success/error status
 */
export function validateVote(data: unknown) {
    try {
        const validatedData = voteSchema.parse(data)
        return { success: true, data: validatedData }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.errors.map(e => e.message).join(', ')
            }
        }
        return { success: false, error: 'Validation failed' }
    }
}

/**
 * Sanitizes user input
 * 
 * @param input - Input string to sanitize
 * @returns Sanitized input string
 */
export function sanitizeInput(input: string): string {
    try {
        return sanitizeInputSchema.parse(input)
    } catch {
        return input.trim().replace(/[<>]/g, '')
    }
}

/**
 * Validates Nigerian state names
 * 
 * @param state - State name to validate
 * @returns True if valid Nigerian state, false otherwise
 */
export function isValidNigerianState(state: string): boolean {
    return NIGERIAN_STATES.includes(state as any)
}
