import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthPage } from './pages/auth/AuthPage';
import { AuthCallback } from './pages/auth/AuthCallback';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { CreatePlaylistPage } from './pages/create-playlist/CreatePlaylistPage';
import { PlaylistResultPage } from './pages/playlist-result/PlaylistResultPage';
import './App.css'
import { AppProvider } from './contexts/AppContext';
import { Navbar } from './components/navigation/Navbar';
import { SettingsPage } from './pages/settings/SettingsPage';
import { HomePage } from './pages/home/HomePage';
import { MyPlaylistsPage } from './pages/my-playlists/MyPlaylistsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <div className="min-h-screen bg-[var(--dark-background)]">
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="signup" element={<SignupPage />} />
              </Route>
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/create-playlist" element={<CreatePlaylistPage />} />
              <Route path="/playlist-result/:id" element={<PlaylistResultPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/my-playlists" element={<MyPlaylistsPage />} />
            </Routes>
          </div>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App
