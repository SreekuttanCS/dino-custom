import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const CharacterSelect = lazy(() => import('./pages/CharacterSelect'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Game = lazy(() => import('./pages/Game'));

// Simple loading component
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white font-arcade">
    <div className="text-xl animate-pulse">LOADING...</div>
  </div>
);

// Layout component to handle global UI (Home button)
const Layout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show home button on login/register pages OR character select
  const isAuthPage = ['/login', '/register', '/', '/character-select'].includes(location.pathname);

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
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/character-select" element={<CharacterSelect />} />
              <Route path="/game" element={<Game />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
