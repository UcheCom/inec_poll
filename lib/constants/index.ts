// lib/constants/index.ts

/**
 * Application Constants
 * 
 * Centralized configuration and constants for the polling application
 */

// Election Types
export const ELECTION_TYPES = [
    'Presidential',
    'Gubernatorial',
    'Senatorial',
    'House of Reps',
    'State Assembly'
] as const

// Nigerian States
export const NIGERIAN_STATES = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
    'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
    'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa',
    'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
    'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
] as const

// Poll Configuration
export const POLL_CONFIG = {
    MIN_CANDIDATES: 2,
    MAX_CANDIDATES: 10,
    MAX_TITLE_LENGTH: 500,
    MAX_DESCRIPTION_LENGTH: 2000,
    MAX_CANDIDATE_NAME_LENGTH: 255,
    MAX_PARTY_NAME_LENGTH: 100,
    MAX_STATE_LENGTH: 100,
    MAX_LGA_LENGTH: 100
} as const

// Rate Limiting Configuration
export const RATE_LIMITS = {
    CREATE_POLL: { requests: 5, window: 60 * 1000 }, // 5 requests per minute
    VOTE: { requests: 10, window: 60 * 1000 }, // 10 votes per minute
    UPDATE_POLL: { requests: 10, window: 60 * 1000 }, // 10 updates per minute
    DELETE_POLL: { requests: 3, window: 60 * 1000 }, // 3 deletes per minute
    GENERAL: { requests: 100, window: 60 * 1000 } // 100 general requests per minute
} as const

// Security Headers
export const SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co;"
} as const

// UI Configuration
export const UI_CONFIG = {
    QR_CODE_SIZE: 200,
    POLL_CARDS_PER_PAGE: 12,
    DEBOUNCE_DELAY: 300,
    TOAST_DURATION: 5000,
    ANIMATION_DURATION: 200
} as const

// API Configuration
export const API_CONFIG = {
    TIMEOUT: 30000, // 30 seconds
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000 // 1 second
} as const

// Database Configuration
export const DB_CONFIG = {
    MAX_STORE_SIZE: 10000,
    CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
    CONNECTION_POOL_SIZE: 10
} as const

// Error Messages
export const ERROR_MESSAGES = {
    AUTHENTICATION_REQUIRED: 'Authentication required',
    POLL_NOT_FOUND: 'Poll not found',
    POLL_INACTIVE: 'This poll is no longer active',
    POLL_ENDED: 'This poll has ended',
    ALREADY_VOTED: 'You have already voted on this poll',
    INVALID_POLL_DATA: 'Invalid poll data provided',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNKNOWN_ERROR: 'An unexpected error occurred'
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
    POLL_CREATED: 'Poll created successfully!',
    POLL_UPDATED: 'Poll updated successfully!',
    POLL_DELETED: 'Poll deleted successfully!',
    VOTE_CAST: 'Vote cast successfully!',
    URL_COPIED: 'URL copied to clipboard!',
    QR_DOWNLOADED: 'QR code downloaded successfully!'
} as const

// Validation Rules
export const VALIDATION_RULES = {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    URL_REGEX: /^https?:\/\/.+/,
    UUID_REGEX: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    PHONE_REGEX: /^\+?[1-9]\d{1,14}$/
} as const

// File Upload Configuration
export const FILE_CONFIG = {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    ALLOWED_IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif']
} as const

// Environment Configuration
export const ENV_CONFIG = {
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
    IS_PRODUCTION: process.env.NODE_ENV === 'production',
    IS_TEST: process.env.NODE_ENV === 'test'
} as const

// Default Values
export const DEFAULTS = {
    POLL_END_DATE_OFFSET: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    PAGINATION_SIZE: 10,
    SEARCH_DEBOUNCE: 300,
    CACHE_TTL: 5 * 60 * 1000 // 5 minutes
} as const
