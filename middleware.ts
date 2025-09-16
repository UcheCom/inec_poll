import { NextRequest, NextResponse } from 'next/server'
import { applySecurityHeaders, securityMiddleware } from './lib/middleware/security'

/**
 * Next.js Middleware
 * 
 * Applies security headers and rate limiting to all requests.
 * This middleware runs before the request is processed by the application.
 */
export function middleware(request: NextRequest) {
    // Apply security headers to all responses
    const response = NextResponse.next()
    applySecurityHeaders(response)

    // Apply rate limiting for API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
        const action = getActionFromPath(request.nextUrl.pathname, request.method)
        const userId = request.headers.get('x-user-id') || undefined

        const securityResponse = securityMiddleware(request, action, userId)
        if (securityResponse) {
            return securityResponse
        }
    }

    return response
}

/**
 * Determines the action type from the request path for rate limiting
 * 
 * @param pathname - Request pathname
 * @param method - HTTP method
 * @returns Action type for rate limiting
 */
function getActionFromPath(pathname: string, method: string): 'create_poll' | 'vote' | 'update_poll' | 'delete_poll' | 'general' {
    if (pathname.includes('/polls') && method === 'POST') {
        return 'create_poll'
    }
    if (pathname.includes('/vote')) {
        return 'vote'
    }
    if (pathname.includes('/polls') && method === 'PUT') {
        return 'update_poll'
    }
    if (pathname.includes('/polls') && method === 'DELETE') {
        return 'delete_poll'
    }
    return 'general'
}

// Configure which paths the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
