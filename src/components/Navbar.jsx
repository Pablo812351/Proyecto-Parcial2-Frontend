import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-gray-800 shadow-xl sticky top-0 z-50 border-b border-gray-700/60">
      <div className="container mx-auto px-4 py-3.5">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/" 
            onClick={() => setIsOpen(false)}
            className="text-2xl font-extrabold text-blue-500 hover:text-blue-400 transition flex items-center gap-2 shrink-0"
          >
            <span className="text-2xl">🎮</span>
            <span className="tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Gaming Hub
            </span>
          </Link>

          {/* Botón Hamburguesa exclusivo para móviles */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-700/60 focus:outline-none transition"
            aria-label="Alternar menú de navegación"
          >
            {isOpen ? (
              <span className="text-2xl font-bold leading-none">✕</span>
            ) : (
              <span className="text-2xl font-bold leading-none">☰</span>
            )}
          </button>

          {/* Menú Horizontal para Desktop / Pantallas Medianas y Grandes */}
          <div className="hidden md:flex items-center space-x-5">
            <Link to="/" className="text-gray-300 hover:text-white font-medium transition">
              Inicio
            </Link>
            
            {user ? (
              <>
                <Link to="/library" className="text-gray-300 hover:text-white font-medium flex items-center gap-1.5 transition">
                  <span>📚</span>
                  <span>Mi Biblioteca</span>
                </Link>

                {user.role === 'ADMIN_ROLE' && (
                  <Link to="/admin" className="text-purple-400 hover:text-purple-300 flex items-center gap-1.5 font-medium transition bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-lg">
                    <span>⚙️</span>
                    <span>Admin</span>
                  </Link>
                )}

                <span className="text-gray-400 text-sm">
                  | Hola, <span className="text-white font-semibold">{user.username}</span>
                </span>

                <button 
                  onClick={handleLogout} 
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 font-medium px-3.5 py-1.5 rounded-lg transition"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white font-medium transition">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold transition shadow-lg shadow-blue-600/30">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Menú Desplegable Elegante para Celulares */}
        {isOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-700/80 flex flex-col space-y-2 animate-fade-in">
            {user && (
              <div className="px-3.5 py-2.5 bg-gray-900/80 rounded-xl text-sm text-gray-300 flex items-center justify-between border border-gray-700/50">
                <span>Conectado como:</span>
                <span className="text-white font-bold">{user.username}</span>
              </div>
            )}

            <Link 
              to="/" 
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-gray-200 hover:bg-gray-700/60 hover:text-white font-medium flex items-center gap-2.5 transition"
            >
              <span>🏠</span>
              <span>Inicio</span>
            </Link>

            {user ? (
              <>
                <Link 
                  to="/library" 
                  onClick={() => setIsOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-gray-200 hover:bg-gray-700/60 hover:text-white font-medium flex items-center gap-2.5 transition"
                >
                  <span>📚</span>
                  <span>Mi Biblioteca</span>
                </Link>

                {user.role === 'ADMIN_ROLE' && (
                  <Link 
                    to="/admin" 
                    onClick={() => setIsOpen(false)}
                    className="px-3.5 py-2.5 rounded-xl text-purple-300 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 font-bold flex items-center gap-2.5 transition"
                  >
                    <span>⚙️</span>
                    <span>Panel de Administración</span>
                  </Link>
                )}

                <button 
                  onClick={handleLogout} 
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-red-400 bg-red-500/10 hover:bg-red-500/20 font-medium flex items-center gap-2.5 transition mt-1"
                >
                  <span>🚪</span>
                  <span>Cerrar Sesión</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={() => setIsOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-gray-200 hover:bg-gray-700/60 font-medium transition"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setIsOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-center transition shadow"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
