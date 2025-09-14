'use client'

import { useState } from 'react'
import { createPoll, CreatePollData } from '../lib/actions/polls'
import { ElectionType } from '../src/types/poll'
import { useRouter } from 'next/navigation'
import { useAuth } from '../src/context/AuthContext'

interface PollOption {
    candidate_name: string
    party_name: string
    candidate_image_url: string
}

export default function CreatePollForm() {
    const router = useRouter()
    const { user } = useAuth()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

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

    const electionTypes: ElectionType[] = [
        'Presidential',
        'Gubernatorial',
        'Senatorial',
        'House of Reps',
        'State Assembly'
    ]

    const nigerianStates = [
        'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
        'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
        'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa',
        'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
        'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
        'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
    ]

    const handleInputChange = (field: keyof CreatePollData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleOptionChange = (index: number, field: keyof PollOption, value: string) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.map((option, i) =>
                i === index ? { ...option, [field]: value } : option
            )
        }))
    }

    const addOption = () => {
        setFormData(prev => ({
            ...prev,
            options: [...prev.options, { candidate_name: '', party_name: '', candidate_image_url: '' }]
        }))
    }

    const removeOption = (index: number) => {
        if (formData.options.length > 2) {
            setFormData(prev => ({
                ...prev,
                options: prev.options.filter((_, i) => i !== index)
            }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        // Check if user is authenticated
        if (!user) {
            setError('You must be logged in to create polls')
            setIsSubmitting(false)
            return
        }

        // Validate form
        if (!formData.title.trim()) {
            setError('Poll title is required')
            setIsSubmitting(false)
            return
        }

        const validOptions = formData.options.filter(option => option.candidate_name.trim())
        if (validOptions.length < 2) {
            setError('At least 2 candidates are required')
            setIsSubmitting(false)
            return
        }

        const submitData = {
            ...formData,
            options: validOptions
        }

        const result = await createPoll(submitData, user.id)

        if (result.success) {
            // Show success message
            setError(null)
            setSuccess(true)
            // Redirect after a short delay to show the success message
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
