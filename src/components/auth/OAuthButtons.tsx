import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Provider } from '@supabase/supabase-js';

interface OAuthButtonsProps {
  onSuccess: () => void;
}

export function OAuthButtons({ onSuccess }: OAuthButtonsProps) {
  const { signInWithProvider } = useAuth();
  const [loading, setLoading] = useState<Provider | null>(null);

  const handleOAuthSignIn = async (provider: Provider) => {
    setLoading(provider);
    try {
      const { error } = await signInWithProvider(provider);
      if (error) throw error;
      onSuccess();
    } catch (err) {
      console.error(`Error signing in with ${provider}:`, err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => handleOAuthSignIn('spotify')}
        disabled={loading !== null}
        className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-[#1DB954] text-white rounded-full font-semibold hover:bg-opacity-90 transition disabled:opacity-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
        <span>
          {loading === 'spotify' ? 'Connecting...' : 'Continue with Spotify'}
        </span>
      </button>

      <button
        onClick={() => handleOAuthSignIn('google')}
        disabled={loading !== null}
        className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-red-600 text-white rounded-full font-semibold hover:bg-opacity-90 transition disabled:opacity-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span>
          {loading === 'google' ? 'Connecting...' : 'Continue with YouTube'}
        </span>
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#323232]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-black text-[#E8E8E8]">or</span>
        </div>
      </div>
    </div>
  );
} 