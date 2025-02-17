import type { PlaylistGenerationOptions } from '../groq';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const isDevelopment = import.meta.env.DEV;

export async function generatePlaylistSuggestionsApi(
  prompt: string,
  options: PlaylistGenerationOptions = {}
): Promise<string> {
  if (isDevelopment) {
    // In development, use direct GROQ SDK
    const { generatePlaylistSuggestions } = await import('../groq');
    return generatePlaylistSuggestions(prompt, options);
  }

  // In production, use API endpoint
  try {
    const response = await fetch(`${API_BASE_URL}/api/playlist/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, options }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('Error generating playlist suggestions:', error);
    throw new Error('Failed to generate playlist suggestions');
  }
} 