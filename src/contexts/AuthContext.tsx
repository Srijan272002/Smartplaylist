/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthError, Provider } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (data: { email: string; password: string; fullName: string }) => Promise<{ error: AuthError | null }>;
  signIn: (data: { email: string; password: string }) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: Provider) => Promise<{ error: AuthError | null }>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async ({ email, password, fullName }: { email: string; password: string; fullName: string }) => {
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) return { error: signUpError };
      if (!authData.user) {
        const error = new Error('User creation failed') as AuthError;
        error.status = 400;
        error.code = 'USER_CREATION_FAILED';
        return { error };
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            full_name: fullName,
            avatar_url: null,
          },
        ]);

      if (profileError) {
        const error = new Error(profileError.message) as AuthError;
        error.status = parseInt(profileError.code) || 400;
        error.code = 'PROFILE_CREATION_FAILED';
        return { error };
      }

      // Create initial user preferences
      const { error: preferencesError } = await supabase
        .from('user_preferences')
        .insert([
          {
            user_id: authData.user.id,
            preferred_genres: [],
            favorite_artists: [],
            preferred_moods: [],
            privacy_settings: {
              publicProfile: false,
              showPlaylists: true,
              allowDataCollection: true,
              shareListeningHistory: false
            }
          },
        ]);

      if (preferencesError) {
        console.warn('Failed to create initial preferences:', preferencesError);
        // Don't fail signup if preferences creation fails
      }

      return { error: null };
    } catch (error) {
      const authError = new Error((error as Error).message) as AuthError;
      authError.status = 500;
      authError.code = 'SIGNUP_FAILED';
      return { error: authError };
    }
  };

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithProvider = async (provider: Provider) => {
    try {
      // Clear any existing auth states before starting new flow
      sessionStorage.removeItem('spotify_auth_state');
      localStorage.removeItem('spotify_auth_state');
      
      // Store the redirect path, defaulting to home if on auth pages
      const currentPath = window.location.pathname;
      const redirectPath = currentPath.startsWith('/auth/') ? '/' : currentPath;
      
      // Store auth state with timestamp for validation
      const authState = {
        provider,
        timestamp: Date.now(),
        redirectPath,
        origin: window.location.origin
      };
      
      localStorage.setItem('auth_redirect', redirectPath);
      localStorage.setItem('auth_state', JSON.stringify(authState));
      
      // Get the current origin for the redirect URL
      const origin = window.location.origin;
      const redirectUrl = `${origin}/auth/callback`;
      
      console.log('Starting provider sign in:', {
        provider,
        redirectUrl,
        currentPath,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      });

      const { error, data } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          scopes: provider === 'spotify' 
            ? 'playlist-modify-public playlist-modify-private user-read-private user-read-email'
            : provider === 'google'
            ? 'profile email'
            : undefined,
          queryParams: provider === 'spotify' ? {
            show_dialog: 'true',
            response_type: 'code',
            state: JSON.stringify({
              provider,
              timestamp: Date.now(),
              origin: window.location.origin
            })
          } : undefined
        },
      });

      if (error) {
        console.error('Provider sign in error:', {
          provider,
          error,
          redirectUrl,
          currentUrl: window.location.href,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV
        });
        
        // Clear any stale state that might cause loops
        sessionStorage.removeItem('spotify_auth_state');
        localStorage.removeItem('spotify_auth_state');
        localStorage.removeItem('auth_redirect');
        localStorage.removeItem('auth_state');
        
        // If it's a user cancellation, handle gracefully
        if (error.message?.includes('cancelled')) {
          return { error: null };
        }
      }

      return { error, data };
    } catch (error) {
      console.error('Unexpected error during provider sign in:', {
        error,
        provider,
        timestamp: new Date().toISOString()
      });
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting sign out process...');
      
      // Clear any stored auth states first
      sessionStorage.removeItem('spotify_auth_state');
      localStorage.removeItem('spotify_auth_state');
      localStorage.removeItem('auth_redirect');
      localStorage.removeItem('auth_state');
      
      // Sign out from Supabase with proper error handling
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', {
          error,
          message: error.message,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      // Clear any cached auth state
      setUser(null);
      
      // Add a longer delay to ensure all operations complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Force a page reload to clear any cached states and redirect to home
      window.location.replace('/');
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
      // Still try to redirect even if there's an error
      window.location.replace('/');
    }
  };

  const refreshUser = async () => {
    const { data: { user: refreshedUser } } = await supabase.auth.getUser();
    setUser(refreshedUser);
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithProvider,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 