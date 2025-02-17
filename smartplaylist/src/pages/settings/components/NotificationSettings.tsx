import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { userService } from '../../../services/userService';

interface NotificationPreferences {
  emailNotifications: boolean;
  playlistUpdates: boolean;
  newFeatures: boolean;
  marketingEmails: boolean;
}

export function NotificationSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    playlistUpdates: true,
    newFeatures: true,
    marketingEmails: false,
  });

  const handleToggle = async (key: keyof NotificationPreferences) => {
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
        notification_settings: newPreferences,
      });

      setPreferences(newPreferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Notification Settings</h2>
        <p className="text-[#E8E8E8]">
          Manage how you receive notifications and updates
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Email Notifications */}
        <div className="flex items-center justify-between p-4 bg-black rounded-lg">
          <div>
            <h3 className="font-medium">Email Notifications</h3>
            <p className="text-sm text-[#E8E8E8]">
              Receive important updates via email
            </p>
          </div>
          <button
            onClick={() => handleToggle('emailNotifications')}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1DB954] focus:ring-offset-2 focus:ring-offset-black ${
              preferences.emailNotifications ? 'bg-[#1DB954]' : 'bg-[#323232]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Playlist Updates */}
        <div className="flex items-center justify-between p-4 bg-black rounded-lg">
          <div>
            <h3 className="font-medium">Playlist Updates</h3>
            <p className="text-sm text-[#E8E8E8]">
              Get notified when your playlists are updated
            </p>
          </div>
          <button
            onClick={() => handleToggle('playlistUpdates')}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1DB954] focus:ring-offset-2 focus:ring-offset-black ${
              preferences.playlistUpdates ? 'bg-[#1DB954]' : 'bg-[#323232]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.playlistUpdates ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* New Features */}
        <div className="flex items-center justify-between p-4 bg-black rounded-lg">
          <div>
            <h3 className="font-medium">New Features</h3>
            <p className="text-sm text-[#E8E8E8]">
              Stay updated about new features and improvements
            </p>
          </div>
          <button
            onClick={() => handleToggle('newFeatures')}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1DB954] focus:ring-offset-2 focus:ring-offset-black ${
              preferences.newFeatures ? 'bg-[#1DB954]' : 'bg-[#323232]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.newFeatures ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Marketing Emails */}
        <div className="flex items-center justify-between p-4 bg-black rounded-lg">
          <div>
            <h3 className="font-medium">Marketing Emails</h3>
            <p className="text-sm text-[#E8E8E8]">
              Receive promotional offers and marketing updates
            </p>
          </div>
          <button
            onClick={() => handleToggle('marketingEmails')}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1DB954] focus:ring-offset-2 focus:ring-offset-black ${
              preferences.marketingEmails ? 'bg-[#1DB954]' : 'bg-[#323232]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.marketingEmails ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <p className="text-sm text-[#E8E8E8]">
        You can change these settings at any time. For more information about our communication practices, please see our Privacy Policy.
      </p>
    </div>
  );
} 