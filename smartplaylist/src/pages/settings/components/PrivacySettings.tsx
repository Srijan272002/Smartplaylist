import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { userService } from '../../../services/userService';

interface PrivacyPreferences {
  publicProfile: boolean;
  showPlaylists: boolean;
  allowDataCollection: boolean;
  shareListeningHistory: boolean;
}

export function PrivacySettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<PrivacyPreferences>({
    publicProfile: false,
    showPlaylists: true,
    allowDataCollection: true,
    shareListeningHistory: false,
  });

  const handleToggle = async (key: keyof PrivacyPreferences) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      const newPreferences = {
        ...preferences,
        [key]: !preferences[key],
      };

      // Update preferences in the database
      await userService.updateUserPreferences(user.id, {
        public_profile: newPreferences.publicProfile,
        show_playlists: newPreferences.showPlaylists,
        allow_data_collection: newPreferences.allowDataCollection,
        share_listening_history: newPreferences.shareListeningHistory,
      });

      setPreferences(newPreferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Implement account deletion logic
      await userService.deleteAccount(user.id);
      // Handle successful deletion (e.g., sign out and redirect)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Privacy Settings</h2>
        <p className="text-[#E8E8E8]">
          Control your privacy and data preferences
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Public Profile */}
        <div className="flex items-center justify-between p-4 bg-black rounded-lg">
          <div>
            <h3 className="font-medium">Public Profile</h3>
            <p className="text-sm text-[#E8E8E8]">
              Allow others to view your profile
            </p>
          </div>
          <button
            onClick={() => handleToggle('publicProfile')}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1DB954] focus:ring-offset-2 focus:ring-offset-black ${
              preferences.publicProfile ? 'bg-[#1DB954]' : 'bg-[#323232]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.publicProfile ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Show Playlists */}
        <div className="flex items-center justify-between p-4 bg-black rounded-lg">
          <div>
            <h3 className="font-medium">Show Playlists</h3>
            <p className="text-sm text-[#E8E8E8]">
              Make your playlists visible to others
            </p>
          </div>
          <button
            onClick={() => handleToggle('showPlaylists')}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1DB954] focus:ring-offset-2 focus:ring-offset-black ${
              preferences.showPlaylists ? 'bg-[#1DB954]' : 'bg-[#323232]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.showPlaylists ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Data Collection */}
        <div className="flex items-center justify-between p-4 bg-black rounded-lg">
          <div>
            <h3 className="font-medium">Data Collection</h3>
            <p className="text-sm text-[#E8E8E8]">
              Allow us to collect usage data to improve your experience
            </p>
          </div>
          <button
            onClick={() => handleToggle('allowDataCollection')}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1DB954] focus:ring-offset-2 focus:ring-offset-black ${
              preferences.allowDataCollection ? 'bg-[#1DB954]' : 'bg-[#323232]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.allowDataCollection ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Listening History */}
        <div className="flex items-center justify-between p-4 bg-black rounded-lg">
          <div>
            <h3 className="font-medium">Share Listening History</h3>
            <p className="text-sm text-[#E8E8E8]">
              Share your listening activity with friends
            </p>
          </div>
          <button
            onClick={() => handleToggle('shareListeningHistory')}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1DB954] focus:ring-offset-2 focus:ring-offset-black ${
              preferences.shareListeningHistory ? 'bg-[#1DB954]' : 'bg-[#323232]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.shareListeningHistory ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Data Export & Deletion */}
      <div className="border-t border-[#323232] pt-6 mt-6">
        <h3 className="text-lg font-medium mb-4">Data Management</h3>
        <div className="space-y-4">
          <button
            onClick={() => {/* Implement data export */}}
            className="w-full px-4 py-2 bg-[#323232] text-white rounded-lg hover:bg-opacity-90 transition"
          >
            Export Your Data
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={loading}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-opacity-90 transition disabled:opacity-50"
          >
            Delete Account
          </button>
        </div>
        <p className="mt-4 text-sm text-[#E8E8E8]">
          Deleting your account will permanently remove all your data from our servers.
          This action cannot be undone.
        </p>
      </div>
    </div>
  );
} 