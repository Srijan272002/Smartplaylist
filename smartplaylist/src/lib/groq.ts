import { Groq, ChatMessage, ChatCompletion } from 'groq-sdk';

const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
const isDevelopment = import.meta.env.DEV;

if (!groqApiKey) {
  throw new Error('Missing Groq API key in environment variables');
}

// Security warning for development environment
if (isDevelopment) {
  console.warn(
    'Warning: GROQ API key is exposed in the browser. ' +
    'This is only acceptable for development. ' +
    'In production, API calls should be proxied through a backend server.'
  );
}

export const groq = new Groq({
  apiKey: groqApiKey,
  dangerouslyAllowBrowser: true, // Only enable this in development
});

export class PlaylistGenerationError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'PlaylistGenerationError';
  }
}

export interface PlaylistGenerationOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  /** @deprecated Kept for backward compatibility but not currently used */
  allowExplicit?: boolean;
  /** @deprecated Kept for backward compatibility but not currently used */
  familiarityBias?: number;
}

export async function generatePlaylistSuggestions(
  prompt: string,
  options: PlaylistGenerationOptions = {}
): Promise<string> {
  const {
    temperature = 0.7,
    maxTokens = 4000,
    systemPrompt = `You are **SmartPlaylistAI**, a music expert AI that generates personalized playlists using strict criteria. Return **ONLY a valid JSON array** of songs with the following rules:

**Role & Expertise**
1. Analyze song metadata and characteristics:
   - Title and Artist (required)
   - BPM/Tempo (optional, numeric)
   - Duration in seconds (optional, numeric)
   - Year of release (optional, numeric)
   - Album name (optional, string)
   - Consider genre cohesion and mood progression

2. **Playlist Flow**:
   - Create natural transitions between songs
   - Consider energy levels and mood progression
   - Balance familiar and lesser-known tracks
   - Ensure genre consistency unless diversity is requested

**User Constraints**
- **Must Include**:
  - Exactly {playlistLength} songs
  - Unique artists (no repeats unless specifically requested)
  - Songs that match the prompt's intent
- **Must Consider**:
  - User's genre preferences
  - Mood and energy requirements
  - BPM ranges if specified
  - Era/decade preferences if mentioned

**Output Format**
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

Note: Only title and artist are required. Other fields are optional but should be included when confident about their values.`
  } = options;

  try {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const completion: ChatCompletion = await groq.chat.completions.create({
      messages,
      model: 'mixtral-8x7b-32768',
      temperature,
      max_tokens: maxTokens,
      stop: ['}]'], // Stop when the JSON array is complete
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new PlaylistGenerationError('No suggestions generated');
    }

    // Ensure the response is properly terminated
    if (!content.trim().endsWith(']')) {
      throw new PlaylistGenerationError('Incomplete JSON response');
    }

    // Validate the response format
    try {
      const parsed = JSON.parse(content);
      if (!Array.isArray(parsed)) {
        throw new PlaylistGenerationError('Response is not an array');
      }
      // Validate each song object has required fields
      parsed.forEach((song, index) => {
        const requiredFields = ['title', 'artist'];
        const missingFields = requiredFields.filter(field => !(field in song));
        if (missingFields.length > 0) {
          throw new PlaylistGenerationError(`Song at index ${index} is missing required fields: ${missingFields.join(', ')}`);
        }
        
        // Ensure optional fields have correct types if present
        if ('bpm' in song && typeof song.bpm !== 'number') {
          throw new PlaylistGenerationError(`Song at index ${index} has invalid BPM type`);
        }
        if ('duration' in song && typeof song.duration !== 'number') {
          throw new PlaylistGenerationError(`Song at index ${index} has invalid duration type`);
        }
        if ('year' in song && typeof song.year !== 'number') {
          throw new PlaylistGenerationError(`Song at index ${index} has invalid year type`);
        }
      });
    } catch (error) {
      if (error instanceof PlaylistGenerationError) {
        throw error;
      }
      throw new PlaylistGenerationError('Invalid JSON response format');
    }

    return content;
  } catch (error) {
    console.error('Error generating playlist suggestions:', error);
    throw new PlaylistGenerationError(
      'Failed to generate playlist suggestions',
      error
    );
  }
} 