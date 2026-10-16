import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import GameDetail from './pages/GameDetail';
import Library from './pages/Library';
import AdminPanel from './pages/AdminPanel';

import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-900 text-white font-sans">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/games/:id" element={<GameDetail />} />
              <Route path="/favorites" element={<Navigate to="/library" replace />} />
              <Route path="/library" element={<Library />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <footer className="bg-gray-800 text-center p-4 mt-8 text-gray-500">
            &copy; {new Date().getFullYear()} Gaming Hub. Todos los derechos reservados.
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
