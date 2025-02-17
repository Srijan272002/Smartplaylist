import { supabase } from '../lib/supabase';
import { generatePlaylistSuggestions } from '../lib/groq';
import type { Playlist, Song, MoodType } from '../types/database';
import { PostgrestError } from '@supabase/supabase-js';

export interface GeneratePlaylistOptions {
  prompt: string;
  mood?: MoodType;
  songCount?: number;
  /** @deprecated Use authentication context instead */
  userId?: string;
}

interface SongSuggestion {
  title: string;
  artist: string;
  album?: string;
  year?: number;
  bpm?: number;
  duration?: number;
}

interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    spotify_id?: string;
    [key: string]: unknown;
  };
}

interface DatabaseError {
  code: string;
  message?: string;
  details?: string;
}

export class PlaylistService {
  private handleSupabaseError(error: PostgrestError, context: string) {
    console.error(`${context}:`, error);
    
    // Handle specific Supabase error codes
    switch (error.code) {
      case '23505': // unique_violation
        throw new Error('A playlist with these details already exists');
      case '23503': // foreign_key_violation
        throw new Error('Invalid reference to another resource');
      case '42703': // undefined_column
        throw new Error('Invalid field in request');
      case 'PGRST116': // not found
        return null;
      default:
        throw new Error(`${context}: ${error.message}`);
    }
  }

  private async waitForAuthReady(maxAttempts = 3): Promise<void> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (session?.access_token) {
        // Set auth header through Supabase client methods
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token!
        });
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    throw new Error('Authentication not ready');
  }

  private async ensureUserProfile(authUser: AuthUser) {
    try {
      // Wait for auth to be ready
      await this.waitForAuthReady();

      // Set proper headers through session management
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token!
        });
      }

      // First try to get the user profile with proper error handling
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id, created_at')
        .eq('id', authUser.id)
        .maybeSingle();

      if (fetchError) {
        // Handle specific error codes
        if (fetchError.code === 'PGRST116') {
          // Profile doesn't exist, continue to creation
          console.log('User profile not found, creating new profile');
        } else {
          console.error('Error fetching user profile:', fetchError);
          throw new Error(`Failed to fetch user profile: ${fetchError.message}`);
        }
      }

      if (!existingUser) {
        // Prepare the user data with proper timestamps
        const now = new Date().toISOString();
        const userData = {
          id: authUser.id,
          full_name: authUser.user_metadata?.full_name || null,
          avatar_url: authUser.user_metadata?.avatar_url || null,
          spotify_id: authUser.user_metadata?.spotify_id || null,
          created_at: now,
          updated_at: now
        };

        // Create user profile with retry logic
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          const { error: insertError } = await supabase
            .from('users')
            .upsert([userData], {
              onConflict: 'id',
              ignoreDuplicates: false
            });

          if (!insertError) {
            break;
          }

          if (insertError.code === '23505') { // Unique violation
            console.log('Profile already exists, continuing...');
            break;
          }

          console.warn(`Retry ${retryCount + 1}/${maxRetries} failed:`, insertError);
          retryCount++;
          
          if (retryCount === maxRetries) {
            throw new Error(`Failed to create user profile after ${maxRetries} attempts`);
          }
          
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }

        // Create preferences with separate error handling
        const preferencesData = {
          user_id: authUser.id,
          preferred_genres: [],
          favorite_artists: [],
          preferred_moods: [],
          public_profile: false,
          show_playlists: true,
          allow_data_collection: true,
          share_listening_history: false,
          created_at: now,
          updated_at: now
        };

        const { error: prefError } = await supabase
          .from('user_preferences')
          .upsert([preferencesData], {
            onConflict: 'user_id',
            ignoreDuplicates: true
          });

        if (prefError) {
          console.warn('Failed to create preferences:', prefError);
          // Don't throw, continue with basic profile
        }

        // Verify the profile exists
        const { data: verifyUser, error: verifyError } = await supabase
          .from('users')
          .select('id')
          .eq('id', authUser.id)
          .maybeSingle();

        if (verifyError || !verifyUser) {
          throw new Error('Failed to verify user profile creation');
        }
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
      if (error && typeof error === 'object' && this.isDatabaseError(error)) {
        throw new Error(`Database error: ${error.message || error.details || 'Unknown error'}`);
      }
      if (error instanceof Error) {
        throw new Error(`Failed to sync user profile: ${error.message}`);
      }
      throw new Error('Failed to sync user profile');
    }
  }

  private isDatabaseError(error: unknown): error is DatabaseError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as DatabaseError).code === 'string'
    );
  }

  async createPlaylist(data: Partial<Playlist>) {
    try {
      // Get the current user's ID
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('User not authenticated');

      // Ensure user profile exists
      await this.ensureUserProfile(user);

      // Ensure required fields are present
      const playlistData = {
        user_id: user.id,
        name: data.name || 'Untitled Playlist',
        description: data.description || null,
        prompt: data.prompt || null,
        mood: data.mood || null,
        is_public: data.is_public || false,
        cover_url: data.cover_url || null,
        spotify_id: data.spotify_id || null,
        song_count: 0,
        total_duration: 0
      };

      const { data: playlist, error } = await supabase
        .from('playlists')
        .insert([playlistData])
        .select('*')
        .single();

      if (error) {
        this.handleSupabaseError(error, 'Failed to create playlist');
      }

      return playlist;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create playlist');
    }
  }

  async getPlaylist(playlistId: string) {
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select(`
          *,
          songs (*)
        `)
        .eq('id', playlistId)
        .single();

      if (error) {
        this.handleSupabaseError(error, 'Failed to get playlist');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get playlist');
    }
  }

  async getUserPreferences(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to handle missing preferences

      if (error) {
        this.handleSupabaseError(error, 'Failed to get user preferences');
      }

      return data;
    } catch (error) {
      console.warn('Failed to get user preferences:', error);
      return null; // Return null instead of throwing to handle missing preferences gracefully
    }
  }

  async getUserPlaylists(userId: string) {
    const { data, error } = await supabase
      .from('playlists')
      .select('*, songs(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async addSongToPlaylist(playlistId: string, song: Partial<Song>) {
    try {
      // Validate required fields
      if (!song.title || !song.artist) {
        throw new Error('Song title and artist are required');
      }

      // Prepare song data with required fields
      const songData = {
        playlist_id: playlistId,
        title: song.title.substring(0, 200),
        artist: song.artist.substring(0, 200),
        album: song.album?.substring(0, 200) || null,
        duration: song.duration || 0,
        year: song.year || null,
        bpm: song.bpm || null,
        key: song.key || null,
        spotify_id: song.spotify_id || null,
        youtube_id: song.youtube_id || null,
        preview_url: song.preview_url || null,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('songs')
        .insert([songData])
        .select('*')
        .single();

      if (error) {
        console.error('Failed to add song:', error);
        throw error;
      }

      // Update playlist song count and duration
      await this.updatePlaylistMetrics(playlistId);

      return data;
    } catch (error) {
      console.error('Failed to add song to playlist:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Failed to add song to playlist');
    }
  }

  async removeSongFromPlaylist(playlistId: string, songId: string) {
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId)
      .eq('playlist_id', playlistId);

    if (error) throw error;

    // Update playlist song count and duration
    await this.updatePlaylistMetrics(playlistId);
  }

  private async updatePlaylistMetrics(playlistId: string) {
    try {
      // Get all songs in the playlist
      const { data: songs, error: songsError } = await supabase
        .from('songs')
        .select('duration')
        .eq('playlist_id', playlistId);

      if (songsError) {
        console.error('Failed to fetch songs for metrics:', songsError);
        throw songsError;
      }

      // Calculate total duration and count
      const totalDuration = songs?.reduce((sum, song) => sum + (song.duration || 0), 0) || 0;
      const songCount = songs?.length || 0;

      // Update playlist metrics
      const { error: updateError } = await supabase
        .from('playlists')
        .update({
          song_count: songCount,
          total_duration: totalDuration,
          updated_at: new Date().toISOString()
        })
        .eq('id', playlistId);

      if (updateError) {
        console.error('Failed to update playlist metrics:', updateError);
        throw updateError;
      }
    } catch (error) {
      console.error('Failed to update playlist metrics:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Failed to update playlist metrics');
    }
  }

  private cleanJsonResponse(response: string): string {
    try {
      // Remove any text before the first [
      const startIndex = response.indexOf('[');
      if (startIndex === -1) throw new Error('No JSON array found in response');
      
      // Remove any text after the last ]
      const endIndex = response.lastIndexOf(']');
      if (endIndex === -1) throw new Error('Incomplete JSON array in response');
      
      const jsonPart = response.substring(startIndex, endIndex + 1);
      
      // Attempt to parse to validate
      JSON.parse(jsonPart);
      
      return jsonPart;
    } catch (error) {
      console.error('Failed to clean JSON response:', error);
      throw error;
    }
  }

  async generatePlaylist({ prompt, mood, songCount = 10 }: GeneratePlaylistOptions) {
    try {
      // Verify user authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('User not authenticated');

      // Get user preferences - handle case where preferences might not exist
      const preferences = await this.getUserPreferences(user.id);

      // Create AI prompt with user preferences and strict JSON formatting
      const aiPrompt = `Create a playlist with ${songCount} songs based on: "${prompt}"
        
        Additional context:
        ${preferences?.preferred_genres?.length ? `- Preferred genres: ${preferences.preferred_genres.join(', ')}` : ''}
        ${preferences?.favorite_artists?.length ? `- Consider these artists: ${preferences.favorite_artists.join(', ')}` : ''}
        ${preferences?.preferred_bpm_min && preferences?.preferred_bpm_max ? 
          `- BPM range: ${preferences.preferred_bpm_min}-${preferences.preferred_bpm_max}` : ''}
        ${mood ? `- Target mood: ${mood}` : '- Create a balanced mix of moods based on the prompt'}

        Return ONLY a valid JSON array of songs. Format:
        [
          {
            "title": "Song Title",
            "artist": "Artist Name",
            "album": "Album Name",
            "year": 2024,
            "bpm": 120,
            "duration": 180
          }
        ]
        
        Important:
        1. Response must start with [ and end with ]
        2. No text before or after the JSON array
        3. All strings must be properly quoted
        4. No trailing commas
        5. Exactly ${songCount} songs
        6. No duplicate songs
        7. Maximum response length: 4000 characters
        8. Include estimated duration in seconds for each song (average song is 180-240 seconds)
        ${mood ? `9. Songs should match the ${mood} mood` : '9. Create a natural mood progression based on the prompt'}`;

      const suggestions = await generatePlaylistSuggestions(aiPrompt);
      if (!suggestions) throw new Error('Failed to generate playlist suggestions');

      let songs: SongSuggestion[];
      try {
        // Clean and parse the AI response
        const cleanedResponse = this.cleanJsonResponse(suggestions);
        songs = JSON.parse(cleanedResponse);
        
        // Validate the response structure
        if (!Array.isArray(songs)) {
          throw new Error('Response is not an array');
        }
        
        if (songs.length !== songCount) {
          console.warn(`Expected ${songCount} songs, got ${songs.length}`);
          // Truncate or pad the array if needed
          songs = songs.slice(0, songCount);
        }
        
        // Validate and clean each song
        songs = songs.map((song, index) => {
          if (!song.title || !song.artist) {
            throw new Error(`Song at index ${index} is missing required fields`);
          }
          
          // Clean and validate the song data
          return {
            title: String(song.title).trim(),
            artist: String(song.artist).trim(),
            album: song.album ? String(song.album).trim() : undefined,
            year: song.year && !isNaN(song.year) ? Number(song.year) : undefined,
            bpm: song.bpm && !isNaN(song.bpm) ? Number(song.bpm) : undefined,
            duration: song.duration && !isNaN(song.duration) ? Number(song.duration) : Math.floor(180 + Math.random() * 60) // Fallback duration between 180-240 seconds
          };
        });
      } catch (error) {
        console.error('Invalid AI response:', suggestions);
        throw new Error(
          error instanceof Error 
            ? `Failed to parse playlist: ${error.message}`
            : 'Failed to parse playlist'
        );
      }

      // Create the playlist with explicit typing
      const playlist = await this.createPlaylist({
        user_id: user.id,
        name: prompt.substring(0, 100), // Ensure name isn't too long
        description: `AI-generated playlist based on: ${prompt}`.substring(0, 500), // Limit description length
        mood,
        prompt: prompt.substring(0, 1000), // Limit prompt length
        is_public: false,
      });

      // Add songs to playlist with error handling for each song
      for (const song of songs) {
        try {
          await this.addSongToPlaylist(playlist.id, {
            title: song.title.substring(0, 200), // Limit field lengths
            artist: song.artist.substring(0, 200),
            album: song.album?.substring(0, 200),
            year: song.year,
            bpm: song.bpm,
            duration: song.duration
          });
        } catch (error) {
          console.error('Failed to add song to playlist:', error);
          // Continue with next song instead of failing entire playlist
          continue;
        }
      }

      return this.getPlaylist(playlist.id);
    } catch (error) {
      console.error('Error generating playlist:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to generate playlist: ${error.message}`);
      }
      throw new Error('Failed to generate playlist');
    }
  }
}

export const playlistService = new PlaylistService(); 