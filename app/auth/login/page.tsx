"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../src/context/AuthContext';

/**
 * LoginPage Component
 * 
 * Handles user authentication through email and password login.
 * Provides a form interface for users to sign in to the polling application.
 * 
 * Features:
 * - Form validation and error handling
 * - Automatic redirect to polls page after successful login
 * - Loading states during authentication process
 * - Real-time form state management
 * 
 * @returns JSX element containing the login form
 */
export default function LoginPage() {
  // Form state management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Navigation and authentication hooks
  const router = useRouter();
  const { user, login, loading, error } = useAuth();

  /**
   * Effect hook to handle post-login navigation
   * Redirects authenticated users to the polls dashboard
   * Prevents authenticated users from accessing login page
   */
  useEffect(() => {
    if (user) router.push('/polls');
  }, [user, router]);

  /**
   * Handles form submission for user login
   * Prevents default form submission and calls the login function
   * 
   * @param e - React form event
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-md">
        <form
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
          onSubmit={handleLogin}
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

          {/* Error message display - shows authentication errors */}
          {error && <div className="text-red-500 mb-2">{error}</div>}

          {/* Submit button with loading state */}
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={loading} // Disable during authentication process
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
