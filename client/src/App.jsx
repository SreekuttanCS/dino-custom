import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';

import CharacterSelect from './pages/CharacterSelect';
import Leaderboard from './pages/Leaderboard';
import Game from './pages/Game';

// Layout component to handle global UI (Home button)
const Layout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show home button on login/register pages
  const isAuthPage = ['/login', '/register', '/'].includes(location.pathname);

  return (
    <div className="app w-full h-screen bg-gray-900 text-white font-sans relative">
      {user && !isAuthPage && (
        <button
          onClick={() => navigate('/character-select')}
          className="fixed top-4 left-4 z-50 bg-[#535353] text-white p-2 border-2 border-white hover:bg-gray-700 font-arcade text-xs"
          title="Home"
        >
          🏠 HOME
        </button>
      )}
      {children}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/character-select" element={<CharacterSelect />} />
            <Route path="/game" element={<Game />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
