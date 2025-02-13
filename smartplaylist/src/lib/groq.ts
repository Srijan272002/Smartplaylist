import { Groq, ChatMessage, ChatCompletion } from '@groq/groq-sdk';

const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;

if (!groqApiKey) {
  throw new Error('Missing Groq API key in environment variables');
}

export const groq = new Groq({
  apiKey: groqApiKey,
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
}

export async function generatePlaylistSuggestions(
  prompt: string,
  options: PlaylistGenerationOptions = {}
): Promise<string> {
  const {
    temperature = 0.7,
    maxTokens = 1024,
    systemPrompt = 'You are a music expert AI that helps create personalized playlists. Provide song suggestions based on the user\'s prompt, considering genres, moods, and musical elements.'
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
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new PlaylistGenerationError('No suggestions generated');
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