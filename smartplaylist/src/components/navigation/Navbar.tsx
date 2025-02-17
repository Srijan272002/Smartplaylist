import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  // Don't show navbar on auth pages
  if (location.pathname.startsWith('/auth/')) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-[var(--dark-surface)] border-b border-[var(--dark-accent)]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left section */}
          <div className="flex">
            <Link
              to="/"
              className="flex items-center px-2 text-white font-bold text-xl"
            >
              SmartPlaylist
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <Link
                to="/create-playlist"
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  location.pathname === '/create-playlist'
                    ? 'bg-[var(--primary-color)] text-white'
                    : 'text-gray-300 hover:bg-[var(--dark-accent)] hover:text-white'
                }`}
              >
                Create Playlist
              </Link>
              {user && (
                <Link
                  to="/my-playlists"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    location.pathname === '/my-playlists'
                      ? 'bg-[var(--primary-color)] text-white'
                      : 'text-gray-300 hover:bg-[var(--dark-accent)] hover:text-white'
                  }`}
                >
                  My Playlists
                </Link>
              )}
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/settings"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    location.pathname === '/settings'
                      ? 'bg-[var(--primary-color)] text-white'
                      : 'text-gray-300 hover:bg-[var(--dark-accent)] hover:text-white'
                  }`}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Settings
                </Link>
                <div className="flex items-center space-x-2">
                  <img
                    src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-gray-300 text-sm hidden sm:block">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-[var(--dark-accent)] hover:text-white"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/auth/login"
                  className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium"
                >
                  Log in
                </Link>
                <Link
                  to="/auth/signup"
                  className="bg-[var(--primary-color)] text-white px-3 py-2 text-sm font-medium rounded-md hover:bg-[var(--primary-color)]/90"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/create-playlist"
            className={`block px-3 py-2 text-base font-medium rounded-md ${
              location.pathname === '/create-playlist'
                ? 'bg-[var(--primary-color)] text-white'
                : 'text-gray-300 hover:bg-[var(--dark-accent)] hover:text-white'
            }`}
          >
            Create Playlist
          </Link>
          {user && (
            <Link
              to="/my-playlists"
              className={`block px-3 py-2 text-base font-medium rounded-md ${
                location.pathname === '/my-playlists'
                  ? 'bg-[var(--primary-color)] text-white'
                  : 'text-gray-300 hover:bg-[var(--dark-accent)] hover:text-white'
              }`}
            >
              My Playlists
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
} 