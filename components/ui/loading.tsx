import { Loader2 } from 'lucide-react'
import { Button } from './button'
import { cn } from '../../lib/utils'

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

/**
 * LoadingSpinner Component
 * 
 * A reusable loading spinner with different sizes
 */
export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8'
    }

    return (
        <Loader2
            className={cn(
                'animate-spin text-muted-foreground',
                sizeClasses[size],
                className
            )}
        />
    )
}

interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
    loading?: boolean
    loadingText?: string
}

/**
 * LoadingButton Component
 * 
 * A button that shows a loading state with spinner
 */
export function LoadingButton({
    loading = false,
    loadingText = 'Loading...',
    children,
    disabled,
    className,
    ...props
}: LoadingButtonProps) {
    return (
        <Button
            disabled={disabled || loading}
            className={cn(className)}
            {...props}
        >
            {loading && <LoadingSpinner size="sm" className="mr-2" />}
            {loading ? loadingText : children}
        </Button>
    )
}

interface LoadingPageProps {
    message?: string
}

/**
 * LoadingPage Component
 * 
 * Full page loading state
 */
export function LoadingPage({ message = 'Loading...' }: LoadingPageProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground">{message}</p>
        </div>
    )
}

interface LoadingCardProps {
    message?: string
    className?: string
}

/**
 * LoadingCard Component
 * 
 * Loading state within a card
 */
export function LoadingCard({ message = 'Loading...', className }: LoadingCardProps) {
    return (
        <div className={cn(
            'flex flex-col items-center justify-center p-8 space-y-4',
            className
        )}>
            <LoadingSpinner size="md" />
            <p className="text-muted-foreground text-sm">{message}</p>
        </div>
    )
}