import { z } from 'zod'

/**
 * Election Type Schema
 * 
 * Validates election type values against allowed options
 */
export const electionTypeSchema = z.enum([
    'Presidential',
    'Gubernatorial',
    'Senatorial',
    'House of Reps',
    'State Assembly'
])

/**
 * Poll Option Schema
 * 
 * Validates individual poll option data
 */
export const pollOptionSchema = z.object({
    candidate_name: z.string()
        .min(1, 'Candidate name is required')
        .max(255, 'Candidate name must be less than 255 characters')
        .trim(),
    party_name: z.string()
        .max(100, 'Party name must be less than 100 characters')
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
        .max(500, 'Poll title must be less than 500 characters')
        .trim(),
    description: z.string()
        .max(2000, 'Description must be less than 2000 characters')
        .trim()
        .optional(),
    election_type: electionTypeSchema,
    state: z.string()
        .max(100, 'State name must be less than 100 characters')
        .trim()
        .optional(),
    lga: z.string()
        .max(100, 'LGA name must be less than 100 characters')
        .trim()
        .optional(),
    end_date: z.string()
        .datetime('Must be a valid date')
        .optional()
        .or(z.literal('')),
    options: z.array(pollOptionSchema)
        .min(2, 'At least 2 candidates are required')
        .max(10, 'Maximum 10 candidates allowed')
})

/**
 * Update Poll Schema
 * 
 * Validates poll update data (same as create but allows partial updates)
 */
export const updatePollSchema = createPollSchema.partial().extend({
    options: z.array(pollOptionSchema)
        .min(2, 'At least 2 candidates are required')
        .max(10, 'Maximum 10 candidates allowed')
        .optional()
})

/**
 * Vote Schema
 * 
 * Validates vote submission data
 */
export const voteSchema = z.object({
    poll_id: z.string().uuid('Invalid poll ID'),
    option_id: z.string().uuid('Invalid option ID')
})

/**
 * User Profile Schema
 * 
 * Validates user profile data
 */
export const userProfileSchema = z.object({
    full_name: z.string()
        .min(1, 'Full name is required')
        .max(255, 'Full name must be less than 255 characters')
        .trim(),
    email: z.string()
        .email('Must be a valid email address')
        .max(255, 'Email must be less than 255 characters'),
    state: z.string()
        .max(100, 'State name must be less than 100 characters')
        .trim()
        .optional(),
    lga: z.string()
        .max(100, 'LGA name must be less than 100 characters')
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
    const nigerianStates = [
        'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
        'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
        'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa',
        'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
        'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
        'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
    ]
    return nigerianStates.includes(state)
}
