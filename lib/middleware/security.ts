import { NextRequest, NextResponse } from 'next/server'

/**
 * Security Headers Configuration
 * 
 * Defines security headers to be applied to all responses
 */
export const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co;"
}

/**
 * Rate Limiting Store
 * 
 * In-memory store for rate limiting (in production, use Redis or similar)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Rate Limiting Configuration
 */
const RATE_LIMITS = {
    create_poll: { requests: 5, window: 60 * 1000 }, // 5 requests per minute
    vote: { requests: 10, window: 60 * 1000 }, // 10 votes per minute
    update_poll: { requests: 10, window: 60 * 1000 }, // 10 updates per minute
    delete_poll: { requests: 3, window: 60 * 1000 }, // 3 deletes per minute
    general: { requests: 100, window: 60 * 1000 } // 100 general requests per minute
}

/**
 * Applies security headers to response
 * 
 * @param response - NextResponse object
 * @returns Response with security headers applied
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
    Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
    })
    return response
}

/**
 * Checks if request is within rate limit
 * 
 * @param key - Rate limit key (user ID + action)
 * @param limit - Rate limit configuration
 * @returns True if within limit, false if rate limited
 */
export function checkRateLimit(
    key: string,
    limit: { requests: number; window: number }
): boolean {
    const now = Date.now()
    const record = rateLimitStore.get(key)

    if (!record || now > record.resetTime) {
        // Create new record or reset expired record
        rateLimitStore.set(key, { count: 1, resetTime: now + limit.window })
        return true
    }

    if (record.count >= limit.requests) {
        return false
    }

    record.count++
    return true
}

/**
 * Gets client IP address from request
 * 
 * @param request - NextRequest object
 * @returns Client IP address
 */
export function getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')

    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }

    if (realIP) {
        return realIP
    }

    return request.ip || 'unknown'
}

/**
 * Rate limiting middleware
 * 
 * @param request - NextRequest object
 * @param action - Action being performed
 * @param userId - User ID (if authenticated)
 * @returns NextResponse or null if rate limited
 */
export function rateLimitMiddleware(
    request: NextRequest,
    action: keyof typeof RATE_LIMITS,
    userId?: string
): NextResponse | null {
    const ip = getClientIP(request)
    const key = userId ? `${userId}:${action}` : `${ip}:${action}`
    const limit = RATE_LIMITS[action]

    if (!checkRateLimit(key, limit)) {
        return new NextResponse(
            JSON.stringify({
                error: 'Rate limit exceeded. Please try again later.',
                retryAfter: Math.ceil(limit.window / 1000)
            }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': Math.ceil(limit.window / 1000).toString()
                }
            }
        )
    }

    return null
}

/**
 * Input sanitization middleware
 * 
 * @param data - Data to sanitize
 * @returns Sanitized data
 */
export function sanitizeInput(data: any): any {
    if (typeof data === 'string') {
        return data
            .trim()
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
    }

    if (Array.isArray(data)) {
        return data.map(sanitizeInput)
    }

    if (data && typeof data === 'object') {
        const sanitized: any = {}
        for (const [key, value] of Object.entries(data)) {
            sanitized[key] = sanitizeInput(value)
        }
        return sanitized
    }

    return data
}

/**
 * CSRF protection middleware
 * 
 * @param request - NextRequest object
 * @returns True if CSRF token is valid, false otherwise
 */
export function validateCSRFToken(request: NextRequest): boolean {
    const token = request.headers.get('x-csrf-token')
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')

    // In production, implement proper CSRF token validation
    // For now, we'll do basic origin/referer checking
    const allowedOrigins = [
        'http://localhost:3000',
        'https://yourdomain.com' // Replace with your actual domain
    ]

    if (origin && !allowedOrigins.includes(origin)) {
        return false
    }

    if (referer && !allowedOrigins.some(allowed => referer.startsWith(allowed))) {
        return false
    }

    return true
}

/**
 * Security middleware for API routes
 * 
 * @param request - NextRequest object
 * @param action - Action being performed
 * @param userId - User ID (if authenticated)
 * @returns NextResponse or null if security checks pass
 */
export function securityMiddleware(
    request: NextRequest,
    action: keyof typeof RATE_LIMITS,
    userId?: string
): NextResponse | null {
    // Apply rate limiting
    const rateLimitResponse = rateLimitMiddleware(request, action, userId)
    if (rateLimitResponse) {
        return rateLimitResponse
    }

    // Validate CSRF token
    if (!validateCSRFToken(request)) {
        return new NextResponse(
            JSON.stringify({ error: 'Invalid CSRF token' }),
            {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            }
        )
    }

    return null
}

/**
 * Cleans up expired rate limit records
 * 
 * This should be called periodically to prevent memory leaks
 */
export function cleanupRateLimitStore(): void {
    const now = Date.now()
    for (const [key, record] of rateLimitStore.entries()) {
        if (now > record.resetTime) {
            rateLimitStore.delete(key)
        }
    }
}

// Clean up rate limit store every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000)
