import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * LoadingSpinner Component
 * 
 * A reusable loading spinner component with customizable size and styling.
 * 
 * @param className - Additional CSS classes
 * @param size - Size variant for the spinner
 * @param text - Optional loading text to display
 */
interface LoadingSpinnerProps {
    className?: string
    size?: "sm" | "md" | "lg"
    text?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    className,
    size = "md",
    text
}) => {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8"
    }

    return (
        <div className={cn("flex items-center justify-center", className)}>
            <div className="flex flex-col items-center space-y-2">
                <div
                    className={cn(
                        "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
                        sizeClasses[size]
                    )}
                />
                {text && (
                    <p className="text-sm text-gray-600 animate-pulse">{text}</p>
                )}
            </div>
        </div>
    )
}

/**
 * LoadingCard Component
 * 
 * A skeleton loading card for displaying while content is loading.
 * 
 * @param className - Additional CSS classes
 */
interface LoadingCardProps {
    className?: string
}

const LoadingCard: React.FC<LoadingCardProps> = ({ className }) => {
    return (
        <div className={cn("rounded-lg border bg-white p-6 shadow-sm", className)}>
            <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="flex space-x-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
            </div>
        </div>
    )
}

/**
 * LoadingButton Component
 * 
 * A button that shows loading state with spinner.
 * 
 * @param loading - Whether the button is in loading state
 * @param children - Button content
 * @param className - Additional CSS classes
 */
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean
    children: React.ReactNode
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
    loading = false,
    children,
    className,
    disabled,
    ...props
}) => {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed",
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {children}
        </button>
    )
}

export { LoadingSpinner, LoadingCard, LoadingButton }
