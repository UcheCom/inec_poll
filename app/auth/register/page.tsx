"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../src/context/AuthContext';

/**
 * RegisterPage Component
 * 
 * Handles new user registration through email and password signup.
 * Provides a form interface for users to create accounts in the polling application.
 * 
 * Features:
 * - User registration with email/password validation
 * - Automatic redirect to polls page after successful registration
 * - Loading states during registration process
 * - Error handling for registration failures
 * - Form state management with controlled inputs
 * 
 * @returns JSX element containing the registration form
 */
export default function RegisterPage() {
  // Form state management for registration inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Navigation and authentication hooks
  const router = useRouter();
  const { user, register, loading, error } = useAuth();

  /**
   * Effect hook to handle post-registration navigation
   * Redirects newly registered users to the polls dashboard
   * Prevents authenticated users from accessing registration page
   */
  useEffect(() => {
    if (user) router.push('/polls');
  }, [user, router]);

  /**
   * Handles form submission for user registration
   * Prevents default form submission and calls the register function
   * 
   * @param e - React form event
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(email, password);
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-md">
        <form
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
          onSubmit={handleRegister}
        >
          {/* Email input field with validation */}
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required // HTML5 validation for email format
            />
          </div>

          {/* Password input field */}
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required // HTML5 validation for required field
            />
          </div>

          {/* Error message display - shows registration errors */}
          {error && <div className="text-red-500 mb-2">{error}</div>}

          {/* Submit button with loading state */}
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={loading} // Disable during registration process
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
