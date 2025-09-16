import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes with clsx
 * 
 * This function combines clsx for conditional class handling with tailwind-merge
 * for proper Tailwind CSS class deduplication and conflict resolution.
 * 
 * @param inputs - Class values to merge (strings, objects, arrays, etc.)
 * @returns Merged and deduplicated class string
 * 
 * @example
 * ```typescript
 * cn("px-2 py-1", "px-4") // "py-1 px-4"
 * cn("bg-red-500", { "bg-blue-500": true }) // "bg-blue-500"
 * ```
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Formats a date string to a human-readable format
 * 
 * @param date - Date string or Date object
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
    date: string | Date,
    options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }
): string {
    return new Intl.DateTimeFormat('en-GB', options).format(new Date(date))
}

/**
 * Generates a unique ID for client-side use
 * 
 * @param prefix - Optional prefix for the ID
 * @returns Unique ID string
 */
export function generateId(prefix?: string): string {
    const id = Math.random().toString(36).substr(2, 9)
    return prefix ? `${prefix}-${id}` : id
}

/**
 * Debounce function to limit the rate of function execution
 * 
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

/**
 * Truncates text to a specified length with ellipsis
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
}

/**
 * Validates if a string is a valid URL
 * 
 * @param url - String to validate
 * @returns True if valid URL, false otherwise
 */
export function isValidUrl(url: string): boolean {
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}

/**
 * Safely parses JSON with error handling
 * 
 * @param json - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback value
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
    try {
        return JSON.parse(json)
    } catch {
        return fallback
    }
}
