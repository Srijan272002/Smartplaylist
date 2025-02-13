# SmartPlaylist 🎵

An AI-powered music playlist generator that creates personalized playlists based on your preferences, moods, and musical tastes.

## Features ✨

- 🤖 AI-powered playlist generation using Groq
- 🎯 Personalized music recommendations
- 🔐 Secure authentication with Supabase
- 🎨 Modern UI with Tailwind CSS
- ⚡ Built with Vite and React
- 📱 Responsive design
- 🔄 Real-time updates

## Getting Started 🚀

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- A Supabase account
- A Groq API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/smartplaylist.git
cd smartplaylist
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Groq Configuration
VITE_GROQ_API_KEY=your-groq-api-key
```

4. Start the development server:
```bash
npm run dev
```

## Project Structure 📁

```
smartplaylist/
├── src/
│   ├── components/     # Reusable React components
│   ├── lib/           # Utility functions and API clients
│   ├── pages/         # Page components
│   ├── types/         # TypeScript type definitions
│   ├── App.tsx        # Root component
│   └── main.tsx       # Entry point
├── public/            # Static assets
└── ...config files
```

## Technology Stack 🛠️

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase
- **AI Integration**: Groq API
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Real-time**: Supabase Real-time subscriptions

## API Integration 🔌

### Groq Integration

The project uses Groq's AI capabilities for intelligent playlist generation. Example usage:

```typescript
import { generatePlaylistSuggestions } from '../lib/groq';

// Basic usage
const suggestions = await generatePlaylistSuggestions('Create a relaxing evening playlist');

// Advanced usage with options
const customSuggestions = await generatePlaylistSuggestions('Create a workout playlist', {
  temperature: 0.8,
  maxTokens: 2048,
  systemPrompt: 'You are a fitness music expert...'
});
```

### Supabase Integration

Database schema and authentication are handled through Supabase:

- Users table with Spotify integration
- Playlists management
- Song metadata storage
- User preferences

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📝

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- Groq for AI capabilities
- Supabase for backend infrastructure
- React and Vite teams
- Tailwind CSS team
