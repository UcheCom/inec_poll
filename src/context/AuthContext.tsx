"use client"
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { User } from '@supabase/supabase-js'

/**
 * Authentication Context Type Definition
 * 
 * Defines the shape of the authentication context that provides
 * user state and authentication methods throughout the application.
 * 
 * @interface AuthContextType
 */
interface AuthContextType {
  /** Current authenticated user object or null if not logged in */
  user: User | null;
  /** Loading state for authentication operations */
  loading: boolean;
  /** Error message from authentication operations */
  error: string | null;
  /** Function to authenticate user with email and password */
  login: (email: string, password: string) => Promise<void>;
  /** Function to register new user with email and password */
  register: (email: string, password: string) => Promise<void>;
  /** Function to sign out the current user */
  logout: () => Promise<void>;
}

// Default context values for uninitialized state
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  login: async () => { },
  register: async () => { },
  logout: async () => { },
});

/**
 * AuthProvider Component
 * 
 * Provides authentication context to the entire application.
 * Manages user state, authentication operations, and session persistence.
 * 
 * Features:
 * - Automatic session restoration on app load
 * - Real-time authentication state changes
 * - Centralized error handling for auth operations
 * - Loading states for all authentication actions
 * 
 * @param children - React children components that need auth context
 * @returns JSX element with authentication context provider
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Authentication state management
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Effect hook for session management and auth state monitoring
   * 
   * On component mount:
   * 1. Retrieves existing session from Supabase
   * 2. Sets up real-time auth state change listener
   * 3. Cleans up listener on component unmount
   * 
   * This ensures the app stays in sync with authentication state
   * across browser tabs and page refreshes.
   */
  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) setError(sessionError.message);
      setUser(session?.user ?? null);
      setLoading(false);
    };
    getSession();

    // Listen for auth state changes (login, logout, token refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // Cleanup listener on unmount to prevent memory leaks
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  /**
   * Authenticates user with email and password
   * 
   * @param email - User's email address
   * @param password - User's password
   * @throws Sets error state if authentication fails
   */
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  /**
   * Registers new user with email and password
   * 
   * @param email - User's email address
   * @param password - User's password
   * @throws Sets error state if registration fails
   */
  const register = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  /**
   * Signs out the current user
   * Clears user session and redirects to login
   * 
   * @throws Sets error state if logout fails
   */
  const logout = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signOut();
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication context
 * 
 * Provides easy access to user state and authentication methods
 * throughout the application components.
 * 
 * @returns AuthContextType - Authentication context value
 * @throws Error if used outside of AuthProvider
 */
export const useAuth = () => useContext(AuthContext);
