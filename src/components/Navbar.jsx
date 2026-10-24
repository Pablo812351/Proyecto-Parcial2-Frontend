import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gray-800 p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-500 hover:text-blue-400 transition flex items-center gap-2">
          <span>🎮</span>
          <span>Gaming Hub</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-gray-300 hover:text-white transition">Inicio</Link>
          
          {user ? (
            <>
              <Link to="/library" className="text-gray-300 hover:text-white font-medium flex items-center gap-1.5 transition">
                <span>📚</span>
                <span>Mi Biblioteca</span>
              </Link>
              {user.role === 'ADMIN_ROLE' && (
                <Link to="/admin" className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium transition">
                  <span>⚙️</span>
                  <span>Admin</span>
                </Link>
              )}
              <span className="text-gray-400 hidden sm:inline">| Hola, <span className="text-white font-semibold">{user.username}</span></span>
              <button 
                onClick={handleLogout} 
                className="text-red-400 hover:text-red-300 font-medium transition ml-2"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-blue-400 hover:text-blue-300 transition">Iniciar Sesión</Link>
              <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg font-medium transition shadow">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
