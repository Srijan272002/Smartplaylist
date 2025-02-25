# SmartPlaylist 🎵

An AI-powered music playlist generator that creates personalized playlists based on your preferences, moods, and musical tastes.

![SmartPlaylist Demo](https://via.placeholder.com/800x400?text=SmartPlaylist+Demo)

## 🌟 Features

- **AI-Powered Recommendations**: Generate personalized playlists using Groq's advanced AI models
- **Intelligent Curation**: Create playlists based on mood, genre, activity, or any text prompt
- **User Profiles**: Save preferences and favorite genres for better recommendations
- **Playlist Management**: Create, edit, save, and share your playlists
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Secure Authentication**: User authentication powered by Supabase
- **Modern UI**: Beautiful interface built with React and Tailwind CSS

## 🚀 Live Demo

Check out the live application: [SmartPlaylist](https://smartplaylist.vercel.app/)

## 🛠️ Technology Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS with custom theming
- **State Management**: React Query
- **Backend & Auth**: Supabase (PostgreSQL + Auth)
- **AI Integration**: Groq API
- **Deployment**: Vercel
- **UI Components**: Material UI
- **Drag & Drop**: React DnD
- **Data Visualization**: Recharts
- **Testing**: Jest, React Testing Library, Playwright

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- Supabase account
- Groq API key

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smartplaylist.git
   cd smartplaylist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory with the following variables:
   ```
   # Supabase Configuration
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   
   # Groq Configuration
   VITE_GROQ_API_KEY=your-groq-api-key
   
   # Application URL
   VITE_APP_URL=http://localhost:5173
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` to see the application running.

## 📁 Project Structure

```
smartplaylist/
├── src/               # Source code
│   ├── components/    # Reusable UI components
│   ├── pages/         # Page components
│   ├── lib/           # Utility functions and API clients
│   ├── hooks/         # Custom React hooks
│   ├── types/         # TypeScript type definitions
│   ├── styles/        # Global styles and theme configuration
│   ├── App.tsx        # Main application component
│   └── main.tsx       # Application entry point
├── public/            # Static assets
├── dist/              # Build output (generated)
├── .vercel/           # Vercel configuration
├── supabase/          # Supabase configuration and migrations
├── tests/             # Test files
└── ... config files   # Various configuration files
```

## 🚢 Deployment

The application is configured for deployment on Vercel. See [DEPLOYMENT.md](./smartplaylist/DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deployment Steps:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

## 🧪 Testing

Run the test suite:

```bash
# Unit and integration tests
npm test

# End-to-end tests
npm run test:e2e
```

## 🤝 Contributing

Contributions are welcome! Please check out our [contributing guidelines](./smartplaylist/CONTRIBUTING.md).

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./smartplaylist/LICENSE) file for details.

## 🔮 Roadmap

See our [ROADMAP.md](./ROADMAP.md) for planned features and improvements.

## 🙏 Acknowledgments

- [Groq](https://groq.com) for AI capabilities
- [Supabase](https://supabase.com) for backend infrastructure
- [React](https://reactjs.org) and [Vite](https://vitejs.dev) teams
- [Tailwind CSS](https://tailwindcss.com) team
- All open-source contributors

## 📧 Contact

For questions or support, please open an issue on this repository or contact the maintainers.

---

<p align="center">Made with ❤️ by the SmartPlaylist team</p> 
