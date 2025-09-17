'use client'

import { useState } from 'react'
import { createPoll, CreatePollData } from '../../lib/actions/polls'
import { ElectionType } from '../../lib/types/poll'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../lib/context/AuthContext'
import { ELECTION_TYPES, NIGERIAN_STATES, POLL_CONFIG } from '../../lib/constants'

/**
 * Interface for individual poll option data
 * 
 * @interface PollOption
 */
interface PollOption {
    candidate_name: string
    party_name: string
    candidate_image_url: string
}

/**
 * CreatePollForm Component
 * 
 * Provides a comprehensive form interface for creating new polls.
 * Handles all aspects of poll creation including:
 * - Poll metadata (title, description, election type)
 * - Geographic scope (state, LGA for local elections)
 * - Candidate options with party affiliations and images
 * - Form validation and error handling
 * - Dynamic option management (add/remove candidates)
 * 
 * Features:
 * - Dynamic form fields based on election type
 * - Real-time form validation
 * - Loading states during submission
 * - Success/error feedback
 * - Automatic navigation after successful creation
 * 
 * @returns JSX element containing the poll creation form
 */
export default function CreatePollForm() {
    // Navigation and authentication
    const router = useRouter()
    const { user } = useAuth()

    // Form state management
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    // Form data state with default values
    const [formData, setFormData] = useState<CreatePollData>({
        title: '',
        description: '',
        election_type: 'Presidential',
        state: '',
        lga: '',
        end_date: '',
        options: [
            { candidate_name: '', party_name: '', candidate_image_url: '' },
            { candidate_name: '', party_name: '', candidate_image_url: '' }
        ]
    })

    // Available election types for the dropdown
    const electionTypes: ElectionType[] = ELECTION_TYPES

    // Complete list of Nigerian states for state-specific elections
    const nigerianStates = NIGERIAN_STATES

    /**
     * Handles changes to main poll form fields
     * 
     * @param field - The form field being updated
     * @param value - The new value for the field
     */
    const handleInputChange = (field: keyof CreatePollData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    /**
     * Handles changes to individual candidate option fields
     * 
     * @param index - Index of the option being updated
     * @param field - The option field being updated
     * @param value - The new value for the field
     */
    const handleOptionChange = (index: number, field: keyof PollOption, value: string) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.map((option, i) =>
                i === index ? { ...option, [field]: value } : option
            )
        }))
    }

    /**
     * Adds a new candidate option to the poll
     * Allows users to create polls with more than 2 candidates
     */
    const addOption = () => {
        setFormData(prev => ({
            ...prev,
            options: [...prev.options, { candidate_name: '', party_name: '', candidate_image_url: '' }]
        }))
    }

    /**
     * Removes a candidate option from the poll
     * Prevents removal if only 2 options remain (minimum required)
     * 
     * @param index - Index of the option to remove
     */
    const removeOption = (index: number) => {
        if (formData.options.length > 2) {
            setFormData(prev => ({
                ...prev,
                options: prev.options.filter((_, i) => i !== index)
            }))
        }
    }

    /**
     * Handles form submission for poll creation
     * 
     * Performs comprehensive validation before submitting:
     * - User authentication check
     * - Required field validation
     * - Minimum candidate count validation
     * - Server-side poll creation
     * - Success/error handling with user feedback
     * 
     * @param e - React form event
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        // Ensure user is authenticated before creating poll
        if (!user) {
            setError('You must be logged in to create polls')
            setIsSubmitting(false)
            return
        }

        // Validate required fields
        if (!formData.title.trim()) {
            setError('Poll title is required')
            setIsSubmitting(false)
            return
        }

        // Filter out empty options and validate minimum count
        const validOptions = formData.options.filter(option => option.candidate_name.trim())
        if (validOptions.length < POLL_CONFIG.MIN_CANDIDATES) {
            setError(`At least ${POLL_CONFIG.MIN_CANDIDATES} candidates are required`)
            setIsSubmitting(false)
            return
        }

        // Prepare data for submission (only include valid options)
        const submitData = {
            ...formData,
            options: validOptions
        }

        // Submit poll creation to server action
        const result = await createPoll(submitData, user.id)

        if (result.success) {
            // Show success feedback and redirect
            setError(null)
            setSuccess(true)
            // Brief delay to show success message before redirect
            setTimeout(() => {
                router.push('/polls')
            }, 2000)
        } else {
            setError(result.error || 'Failed to create poll')
        }

        setIsSubmitting(false)
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Create a New Poll</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="font-semibold">Poll created successfully!</p>
                                <p className="text-sm">Redirecting to polls page...</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Poll Title */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        Poll Title *
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 2023 Presidential Election Poll"
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe what this poll is about..."
                    />
                </div>

                {/* Election Type */}
                <div>
                    <label htmlFor="election_type" className="block text-sm font-medium text-gray-700 mb-2">
                        Election Type *
                    </label>
                    <select
                        id="election_type"
                        value={formData.election_type}
                        onChange={(e) => handleInputChange('election_type', e.target.value as ElectionType)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        {electionTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                {/* State (for state-specific elections) */}
                {formData.election_type !== 'Presidential' && (
                    <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                            State
                        </label>
                        <select
                            id="state"
                            value={formData.state}
                            onChange={(e) => handleInputChange('state', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a state</option>
                            {nigerianStates.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* LGA (for local elections) */}
                {formData.election_type === 'State Assembly' && (
                    <div>
                        <label htmlFor="lga" className="block text-sm font-medium text-gray-700 mb-2">
                            Local Government Area
                        </label>
                        <input
                            type="text"
                            id="lga"
                            value={formData.lga}
                            onChange={(e) => handleInputChange('lga', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter LGA name"
                        />
                    </div>
                )}

                {/* End Date */}
                <div>
                    <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                        End Date (Optional)
                    </label>
                    <input
                        type="datetime-local"
                        id="end_date"
                        value={formData.end_date}
                        onChange={(e) => handleInputChange('end_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Poll Options */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Candidates *
                    </label>
                    <div className="space-y-4">
                        {formData.options.map((option, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-medium text-gray-700">Candidate {index + 1}</h4>
                                    {formData.options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removeOption(index)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Candidate Name *</label>
                                        <input
                                            type="text"
                                            value={option.candidate_name}
                                            onChange={(e) => handleOptionChange(index, 'candidate_name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter candidate name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Party Name</label>
                                        <input
                                            type="text"
                                            value={option.party_name}
                                            onChange={(e) => handleOptionChange(index, 'party_name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter party name"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm text-gray-600 mb-1">Image URL (Optional)</label>
                                    <input
                                        type="url"
                                        value={option.candidate_image_url}
                                        onChange={(e) => handleOptionChange(index, 'candidate_image_url', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addOption}
                        className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium"
                    >
                        + Add Another Candidate
                    </button>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        disabled={isSubmitting || success}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || success}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Creating...' : success ? 'Poll Created!' : 'Create Poll'}
                    </button>
                </div>
            </form>
        </div>
    )
}
